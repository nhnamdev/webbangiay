

import React, { useState, useEffect, useRef } from 'react';
import './ShoeMatchGame.css';
import './GameOverlay.css';

import { X, HelpCircle, Timer, Trophy } from 'lucide-react';
import { get, post } from '../../services/http';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GRID_ROWS = 5;
const GRID_COLS = 8;
const GAME_TIME = 60; // seconds

const ShoeMatchGame = ({ onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [grid, setGrid] = useState([]);
    const [selectedTile, setSelectedTile] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(null); // 'win' or 'lose'
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [dailyPlaysLeft, setDailyPlaysLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [rewardMessage, setRewardMessage] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState(0);

    const timerRef = useRef(null);

    // Initial Data Fetch & setup
    useEffect(() => {
        if (!user) return;
        checkDailyLimit();
        // Pre-fetch not needed strictly here as we fetch on Start, but for UX maybe? 
        // Let's fetch on Start to ensure randomness each play? 
        // Or fetch once and shuffle? Fetching on Start is better.
    }, [user]);

    const checkDailyLimit = async () => {
        try {
            const all = await get(`/users/${user.id}/point-transactions`);
            const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
            const today = (all || []).filter(t =>
                t.reason === 'Play Shoe Match' && new Date(t.createdAt).getTime() >= startOfDay
            );
            setDailyPlaysLeft(today.length > 0 ? 0 : 1);
        } catch (err) {
            console.error('Error checking daily limit:', err.message);
            setDailyPlaysLeft(1);
        }
        setLoading(false);
    };

    const fetchAndSetupGrid = async () => {
        let data = [];
        try {
            const all = await get('/products');
            data = (all || []).filter(p => p.image && p.image.length > 5).slice(0, 50);
        } catch (err) {
            console.error('Error fetching products', err.message);
            return;
        }

        if (data.length < 2) return;

        let validItems = data;

        if (validItems.length === 0) return;

        // Pick 20 distinct items if possible, or repeat
        let selectedItems = [];
        if (validItems.length >= 20) {
            // Shuffle and pick 20
            selectedItems = validItems.sort(() => Math.random() - 0.5).slice(0, 20);
        } else {
            // Repeat valid items to fill 20
            while (selectedItems.length < 20) {
                selectedItems = [...selectedItems, ...validItems].slice(0, 20);
            }
        }

        let pairs = [...selectedItems, ...selectedItems]; // 40 items total
        // Shuffle pairs
        pairs.sort(() => Math.random() - 0.5);

        // Create Grid
        const newGrid = [];
        for (let r = 0; r < GRID_ROWS; r++) {
            const row = [];
            for (let c = 0; c < GRID_COLS; c++) {
                row.push({
                    id: `${r}-${c}`,
                    row: r,
                    col: c,
                    product: pairs[r * GRID_COLS + c],
                    isVisible: true,
                    isSelected: false
                });
            }
            newGrid.push(row);
        }
        setGrid(newGrid);
    };

    const startGame = async () => {
        if (dailyPlaysLeft <= 0) return;

        // Deduct play
        await post(`/users/${user.id}/point-transactions`, {
            type: 'spend',
            amount: 0,
            reason: 'Play Shoe Match',
        });
        setDailyPlaysLeft(prev => prev - 1);

        await fetchAndSetupGrid();
        setScore(0);
        setTimeLeft(GAME_TIME);
        setGameOver(false);
        setGameResult(null);
        setMatchedPairs(0);
        setIsGameStarted(true);

        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleGameOver('lose');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleGameOver = (result) => {
        clearInterval(timerRef.current);
        setGameOver(true);
        setGameResult(result);
        setIsGameStarted(false);

        if (result === 'win') {
            saveVoucher();
        }
    };

    const saveVoucher = async () => {
        const code = `MATCH50-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        try {
            await post('/vouchers', {
                userId: user.id,
                code,
                discountAmount: 50000,
                minOrderValue: 200000,
                status: 'active',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
            setRewardMessage(`Chúc mừng! Bạn nhận được Voucher 50k: ${code}`);
            window.dispatchEvent(new Event('pointsUpdated'));
        } catch (err) {
            console.error(err.message || err);
        }
    };

    // BFS Matching Logic
    // BFS Matching Logic
    const checkPath = (p1, p2) => {
        if (p1.row === p2.row && p1.col === p2.col) return false;

        // Use Map for sparse/negative coordinates
        const minTurns = new Map();
        const getKey = (r, c) => `${r},${c}`;

        const queue = [{ r: p1.row, c: p1.col, turns: 0, dir: -1 }];
        minTurns.set(getKey(p1.row, p1.col), 0);

        // Directions: 0:Up, 1:Right, 2:Down, 3:Left
        const dr = [-1, 0, 1, 0];
        const dc = [0, 1, 0, -1];

        let head = 0;
        while (head < queue.length) {
            const curr = queue[head++];

            if (curr.r === p2.row && curr.c === p2.col) return true;

            for (let i = 0; i < 4; i++) {
                const nr = curr.r + dr[i];
                const nc = curr.c + dc[i];

                // Extended Bounds: Allow -1 to Size (one step outside grid)
                if (nr < -1 || nr > GRID_ROWS || nc < -1 || nc > GRID_COLS) continue;

                // Obstacle check: Only if INSIDE grid
                if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
                    const isTarget = (nr === p2.row && nc === p2.col);
                    if (grid[nr][nc].isVisible && !isTarget) continue;
                }

                const newTurns = (curr.dir !== -1 && curr.dir !== i) ? curr.turns + 1 : curr.turns;

                if (newTurns <= 2) {
                    const key = getKey(nr, nc);
                    const currentMin = minTurns.has(key) ? minTurns.get(key) : Infinity;

                    if (newTurns <= currentMin) {
                        minTurns.set(key, newTurns);
                        queue.push({ r: nr, c: nc, turns: newTurns, dir: i });
                    }
                }
            }
        }
        return false;
    };

    const handleTileClick = (r, c) => {
        if (!isGameStarted || gameOver) return;
        const tile = grid[r][c];
        if (!tile.isVisible) return;

        // Deselect if clicking same
        if (selectedTile && selectedTile.row === r && selectedTile.col === c) {
            setSelectedTile(null);
            updateGridStatus(r, c, false);
            return;
        }

        // Select first
        if (!selectedTile) {
            setSelectedTile(tile);
            updateGridStatus(r, c, true);
            return;
        }

        // Check Match
        if (tile.product.id === selectedTile.product.id) {
            // Check Path
            if (checkPath(selectedTile, tile)) {
                // Match Found!
                setScore(s => s + 10);
                setMatchedPairs(p => {
                    const newCount = p + 1;
                    if (newCount === 20) {
                        handleGameOver('win');
                    }
                    return newCount;
                });

                // Remove tiles
                const newGrid = [...grid];
                newGrid[r][c].isVisible = false;
                newGrid[selectedTile.row][selectedTile.col].isVisible = false;
                newGrid[selectedTile.row][selectedTile.col].isSelected = false; // clear selection style
                setGrid(newGrid);
                setSelectedTile(null);
            } else {
                // Same item but no path
                // Switch selection to new tile or just deselect old?
                // Usually just select new
                updateGridStatus(selectedTile.row, selectedTile.col, false);
                setSelectedTile(tile);
                updateGridStatus(r, c, true);
            }
        } else {
            // No Match
            updateGridStatus(selectedTile.row, selectedTile.col, false);
            setSelectedTile(tile);
            updateGridStatus(r, c, true);
        }
    };

    const updateGridStatus = (r, c, isSelected) => {
        const newGrid = [...grid];
        newGrid[r][c].isSelected = isSelected;
        setGrid(newGrid);
    };

    return (
        <div className="game-overlay-container">
            <div className="game-modal match-game-modal">
                <div className="game-header">
                    <div className="header-left">
                        <h2>Ghép Giày</h2>
                    </div>
                    <div className="header-right">
                        <div className="score-container">
                            <div className="timer-box" style={{ width: 'fit-content' }}><Timer size={16} /> {timeLeft}s</div>
                            <div className="play-count">Lượt: {dailyPlaysLeft === null ? '-' : dailyPlaysLeft}</div>
                            <div className="score-board">Điểm: {score}</div>
                            <button className="help-btn" onClick={() => setShowHelp(true)}>
                                <HelpCircle size={18} />
                            </button>
                        </div>
                        <button className="close-btn" onClick={() => navigate('/rewards')}><X /></button>
                    </div>
                </div>

                <div className="match-board">
                    {grid.map((row, r) => (
                        <div key={r} className="match-row">
                            {row.map((tile, c) => (
                                <div
                                    key={tile.id}
                                    className={`match-tile ${tile.isVisible ? '' : 'hidden'} ${tile.isSelected ? 'selected' : ''}`}
                                    onClick={() => handleTileClick(r, c)}
                                >
                                    {tile.isVisible && <img src={tile.product.image} alt="shoe" />}
                                </div>
                            ))}
                        </div>
                    ))}

                    {!isGameStarted && !gameOver && (
                        <div className="play-overlay">
                            <button
                                className={`play-start-btn ${dailyPlaysLeft <= 0 && dailyPlaysLeft !== null ? 'disabled' : ''}`}
                                onClick={startGame}
                                disabled={dailyPlaysLeft === null}
                            >
                                {dailyPlaysLeft === null ? "ĐANG TẢI..." : (dailyPlaysLeft <= 0 ? "HẾT LƯỢT" : "CHƠI NGAY")}
                            </button>
                        </div>
                    )}
                </div>

                {gameOver && (
                    <div className="game-over-screen">
                        <h3>{gameResult === 'win' ? "CHIẾN THẮNG!" : "HẾT GIỜ!"}</h3>
                        <div className="final-score">Điểm: {score}</div>

                        {gameResult === 'win' && (
                            <div className="voucher-reward">
                                <div>{rewardMessage}</div>
                            </div>
                        )}
                        {gameResult === 'lose' && (
                            <div style={{ color: '#ccc', marginBottom: '15px' }}>Rất tiếc! Bạn chưa hoàn thành thử thách.</div>
                        )}

                        <button className="play-again-btn" onClick={() => navigate('/rewards')}>Đóng</button>
                    </div>
                )}

                {showHelp && (
                    <div className="help-modal-overlay">
                        <div className="help-content">
                            <h3>Luật Chơi & Giải Thưởng</h3>
                            <ul className="help-list">
                                <li>Tìm và ghép 2 chiếc giày giống nhau.</li>
                                <li>Đường nối không được quá 2 lần gấp khúc.</li>
                                <li>Thời gian: 60 giây.</li>
                                <li>Ghép hết bảng để chiến thắng.</li>
                            </ul>

                            <div className="reward-tier">
                                <div className="tier-item">
                                    <span>Chiến thắng</span>
                                    <span>Voucher 50k</span>
                                </div>
                            </div>

                            <button className="play-again-btn" onClick={() => setShowHelp(false)}>Đã hiểu</button>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ShoeMatchGame;
