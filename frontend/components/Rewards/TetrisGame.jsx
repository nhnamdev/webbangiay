

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './TetrisGame.css';
import './GameOverlay.css'; // Reusing common overlay styles
import { X, HelpCircle, Trophy } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROWS = 20;
const COLS = 10;
const INITIAL_SPEED = 800;

// Tetromino Definitions
const TETROMINOES = {
    I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: 'I' },
    J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: 'J' },
    L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: 'L' },
    O: { shape: [[1, 1], [1, 1]], color: 'O' },
    S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: 'S' },
    T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'T' },
    Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: 'Z' }
};

const RANDOM_TETROMINO = () => {
    const keys = Object.keys(TETROMINOES);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    return TETROMINOES[randKey];
};

const TetrisGame = ({ onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Game State
    const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    const [currentPiece, setCurrentPiece] = useState(null); // { shape, color, x, y }
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // UI State
    const [dailyPlaysLeft, setDailyPlaysLeft] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [rewardMessage, setRewardMessage] = useState(null);

    // Refs for Loop
    // Refs for Loop
    const boardRef = useRef(board);
    const currentPieceRef = useRef(null);
    // speed is state for useInterval
    const [speed, setSpeed] = useState(INITIAL_SPEED);

    // Sync ref
    useEffect(() => { boardRef.current = board; }, [board]);

    function useInterval(callback, delay) {
        const savedCallback = useRef();
        useEffect(() => { savedCallback.current = callback; }, [callback]);
        useEffect(() => {
            function tick() { savedCallback.current(); }
            if (delay !== null) {
                const id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    }

    // Initial Check
    useEffect(() => {
        if (!user) return;
        checkDailyLimit();
    }, [user]);

    const checkDailyLimit = async () => {
        const { data, error } = await supabase
            .from('point_transactions')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('reason', 'Play Tetris Game')
            .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (data && data.length > 0) {
            setDailyPlaysLeft(0);
        } else {
            setDailyPlaysLeft(1);
        }
    };

    const startGame = async () => {
        if (dailyPlaysLeft <= 0) return;

        // Deduct Play
        await supabase.from('point_transactions').insert({
            user_id: user.id,
            amount: 0,
            reason: 'Play Tetris Game',
            type: 'spend'
        });
        setDailyPlaysLeft(0);

        // Reset Game
        setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
        setScore(0);
        setGameOver(false);
        setIsGameStarted(true);
        setRewardMessage(null);
        setIsPaused(false);
        setSpeed(INITIAL_SPEED);

        spawnPiece();
    };

    const spawnPiece = () => {
        const piece = RANDOM_TETROMINO();
        const startX = Math.floor((COLS - piece.shape[0].length) / 2);
        const newPiece = {
            shape: piece.shape,
            color: piece.color,
            x: startX,
            y: 0
        };

        // Check collision immediately (Game Over)
        if (checkCollision(newPiece, boardRef.current)) {
            setCurrentPiece(newPiece); // Show it colliding
            handleGameOver();
            return;
        }

        setCurrentPiece(newPiece);
        currentPieceRef.current = newPiece;
    };

    const checkCollision = (piece, currentBoard, moveX = 0, moveY = 0) => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const newX = piece.x + x + moveX;
                    const newY = piece.y + y + moveY;

                    if (
                        newX < 0 ||
                        newX >= COLS ||
                        newY >= ROWS ||
                        (newY >= 0 && currentBoard[newY][newX] !== 0)
                    ) {
                        // Ignore current piece position if checking rotation? 
                        // No, board only contains *frozen* blocks.
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const freezePiece = () => {
        const piece = currentPieceRef.current;
        const newBoard = boardRef.current.map(row => [...row]);

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    // Only if inside board (top clipping)
                    if (piece.y + y >= 0) {
                        newBoard[piece.y + y][piece.x + x] = piece.color;
                    }
                }
            }
        }

        // Check Lines
        let linesCleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (newBoard[y].every(cell => cell !== 0)) {
                newBoard.splice(y, 1);
                newBoard.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // Recheck same row index
            }
        }

        if (linesCleared > 0) {
            const points = linesCleared === 1 ? 100 : linesCleared === 2 ? 300 : linesCleared === 3 ? 500 : 800;
            setScore(prev => prev + points);
            setSpeed(prev => Math.max(100, INITIAL_SPEED - ((score + points) * 0.5)));
        }

        setBoard(newBoard);
        boardRef.current = newBoard; // Update ref immediately
        spawnPiece();
    };

    const moveDown = () => {
        if (!currentPieceRef.current || gameOver) return;

        if (!checkCollision(currentPieceRef.current, boardRef.current, 0, 1)) {
            const updated = { ...currentPieceRef.current, y: currentPieceRef.current.y + 1 };
            setCurrentPiece(updated);
            currentPieceRef.current = updated;
        } else {
            freezePiece();
        }
    };

    const moveHorizontal = (dir) => {
        if (!currentPieceRef.current || isPaused || gameOver) return;
        if (!checkCollision(currentPieceRef.current, boardRef.current, dir, 0)) {
            const updated = { ...currentPieceRef.current, x: currentPieceRef.current.x + dir };
            setCurrentPiece(updated);
            currentPieceRef.current = updated;
        }
    };

    const rotate = () => {
        if (!currentPieceRef.current || isPaused || gameOver) return;
        const piece = currentPieceRef.current;

        // Rotate matrix
        const rotatedShape = piece.shape[0].map((val, index) =>
            piece.shape.map(row => row[index]).reverse()
        );

        const rotatedPiece = { ...piece, shape: rotatedShape };

        // Wall kick (basic: try moving left/right if colliding)
        if (!checkCollision(rotatedPiece, boardRef.current)) {
            setCurrentPiece(rotatedPiece);
            currentPieceRef.current = rotatedPiece;
        } else {
            // Try kicking left
            if (!checkCollision(rotatedPiece, boardRef.current, -1, 0)) {
                const kicked = { ...rotatedPiece, x: rotatedPiece.x - 1 };
                setCurrentPiece(kicked);
                currentPieceRef.current = kicked;
            }
            // Try kicking right
            else if (!checkCollision(rotatedPiece, boardRef.current, 1, 0)) {
                const kicked = { ...rotatedPiece, x: rotatedPiece.x + 1 };
                setCurrentPiece(kicked);
                currentPieceRef.current = kicked;
            }
        }
    };

    // Stable moveDown reference
    const moveDownRef = useRef();
    useEffect(() => { moveDownRef.current = moveDown; });

    // Game Loop
    useInterval(() => {
        if (isGameStarted && !isPaused && !gameOver) {
            moveDownRef.current();
        }
    }, (isGameStarted && !isPaused && !gameOver) ? speed : null);

    // Controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check state directly inside if possible or via closure
            // With useInterval, we don't have loop restart issues, but closure staleness for moveDown is handled by moveDownRef for the loop.
            // For keys, we trigger moveDown directly. 
            // We need to ensure we don't have stale vars (isGameStarted etc).
            // But this useEffect recloses over them when they change.
            if (!isGameStarted || gameOver) return;

            // Check pause for non-pause keys
            if (isPaused && e.key.toLowerCase() !== 'p') return;

            switch (e.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    moveHorizontal(-1);
                    break;
                case 'arrowright':
                case 'd':
                    moveHorizontal(1);
                    break;
                case 'arrowdown':
                case 's':
                    moveDown();
                    break;
                case 'arrowup':
                case 'w':
                    rotate();
                    break;
                case 'p':
                    setIsPaused(prev => !prev);
                    break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameStarted, gameOver, isPaused, moveDown]); // moveDown needs to be in deps or stable




    const handleGameOver = async () => {
        // stopGameLoop handled by state
        setGameOver(true);
        setIsGameStarted(false);

        // Check for Rewards (Thresholds: 500, 1000, 2000)
        let reward = null;
        if (score >= 2000) reward = { codePrefix: 'TETRIS200', amount: 200000 };
        else if (score >= 1000) reward = { codePrefix: 'TETRIS100', amount: 100000 };
        else if (score >= 500) reward = { codePrefix: 'TETRIS50', amount: 50000 };

        if (reward) {
            const code = `${reward.codePrefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            try {
                await supabase.from('user_vouchers').insert({
                    user_id: user.id,
                    code: code,
                    discount_amount: reward.amount,
                    min_order_value: reward.amount * 5,
                    status: 'active',
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                });
                setRewardMessage(`Bạn nhận được Voucher ${reward.amount.toLocaleString()}đ!`);
                window.dispatchEvent(new Event('pointsUpdated'));
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Render Grid
    // We need to merge board + currentPiece for rendering
    const renderGrid = () => {
        const displayBoard = board.map(row => [...row]);

        if (currentPiece && !gameOver) {
            currentPiece.shape.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell !== 0) {
                        const boardY = currentPiece.y + y;
                        const boardX = currentPiece.x + x;
                        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                            displayBoard[boardY][boardX] = currentPiece.color;
                        }
                    }
                });
            });
        }
        return displayBoard;
    };

    const displayGrid = renderGrid();

    return (
        <div className="game-overlay-container">
            <div className="game-modal tetris-modal" style={{ width: 'auto', minWidth: '500px' }}>
                <div className="game-header">
                    <div className="header-left">
                        <h2>Xếp Gạch</h2>
                    </div>
                    <div className="header-right">
                        <div className="score-container">
                            <div className="play-count">Lượt: {dailyPlaysLeft === null ? '-' : dailyPlaysLeft}</div>
                            <div className="score-board">Điểm: {score}</div>
                            <button className="help-btn" onClick={() => setShowHelp(true)}>
                                <HelpCircle size={18} />
                            </button>
                        </div>
                        <button className="close-btn" onClick={() => navigate('/rewards')}><X /></button>
                    </div>
                </div>

                <div className="tetris-board">
                    {displayGrid.map((row, r) => (
                        row.map((cell, c) => (
                            <div key={`${r}-${c}`} className={`tetris-cell ${cell !== 0 ? cell : ''} ${cell !== 0 ? 'filled' : ''}`} />
                        ))
                    ))}

                    {!isGameStarted && !gameOver && (
                        <div className="play-overlay">
                            <button
                                className={`play-start-btn ${dailyPlaysLeft <= 0 ? 'disabled' : ''}`}
                                onClick={startGame}
                                disabled={dailyPlaysLeft === null || dailyPlaysLeft <= 0}
                            >
                                {dailyPlaysLeft === null ? "..." : (dailyPlaysLeft <= 0 ? "HẾT LƯỢT" : "CHƠI NGAY")}
                            </button>
                        </div>
                    )}
                </div>

                <div className="tetris-controls-hint">
                    Di chuyển: Mũi tên / WASD | Xoay: Lên / W
                </div>

                {gameOver && (
                    <div className="game-over-screen">
                        <h3>Game Over!</h3>
                        <div className="final-score">Điểm: {score}</div>
                        {rewardMessage && (
                            <div className="voucher-reward">{rewardMessage}</div>
                        )}
                        <button className="play-again-btn" onClick={() => navigate('/rewards')}>Đóng</button>
                    </div>
                )}

                {showHelp && (
                    <div className="help-modal-overlay">
                        <div className="help-content">
                            <h3>Cách chơi & Quà tặng</h3>
                            <ul className="help-list">
                                <li>Xếp gạch thành hàng ngang để ghi điểm.</li>
                                <li>Phím điều hướng để di chuyển, Mũi tên lên để xoay.</li>
                            </ul>
                            <div className="reward-tier">
                                <div className="tier-item"><span>&ge; 500 điểm</span><span>Voucher 50k</span></div>
                                <div className="tier-item"><span>&ge; 1000 điểm</span><span>Voucher 100k</span></div>
                                <div className="tier-item"><span>&ge; 2000 điểm</span><span>Voucher 200k</span></div>
                            </div>
                            <button className="play-again-btn" onClick={() => setShowHelp(false)}>Đã hiểu</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TetrisGame;
