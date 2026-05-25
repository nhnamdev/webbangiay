

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SnakeGame.css';
import './GameOverlay.css';
import { X, HelpCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WIDTH = 20;
const HEIGHT = 20;
const INITIAL_SPEED = 150; // ms

// Directions
const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

const VOUCHER_TIERS = [
    { score: 10, amount: 10000, codePrefix: 'SNAKE10', label: 'Voucher 10k' },
    { score: 100, amount: 100000, codePrefix: 'SNAKE100', label: 'Voucher 100k' },
    { score: 200, amount: 200000, codePrefix: 'SNAKE200', label: 'Voucher 200k' }
];

const SnakeGame = ({ onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [walls, setWalls] = useState([]);
    const [direction, setDirection] = useState(RIGHT);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [rewardMessage, setRewardMessage] = useState(null);
    const [wonVoucherCode, setWonVoucherCode] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [dailyPlaysLeft, setDailyPlaysLeft] = useState(null); // Default null to show loading

    // Refs for mutable state in the game loop to avoid dependency staleness
    const directionRef = useRef(RIGHT);
    const nextDirectionRef = useRef(RIGHT); // Input buffering
    const snakeRef = useRef([{ x: 10, y: 10 }]);
    const gameLoopRef = useRef(null);
    const speedRef = useRef(INITIAL_SPEED);

    // Initialize Game
    useEffect(() => {
        if (!user) return;

        const checkDailyLimit = async () => {
            const today = new Date().toDateString();
            const { data, error } = await supabase
                .from('point_transactions')
                .select('created_at')
                .eq('user_id', user.id)
                .eq('reason', 'Play Snake Game')
                .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
            if (data && data.length > 0) {
                setDailyPlaysLeft(0);
            } else {
                setDailyPlaysLeft(1);
            }
        };

        checkDailyLimit();

        // Don't auto-start. Just setup initial state.
        setSnake([{ x: 10, y: 10 }]);
        setScore(0);
        return () => stopGameLoop();
    }, [user]);

    const generateItem = (exclude) => {
        let newItem;
        let attempts = 0;
        while (attempts < 100) {
            newItem = {
                x: Math.floor(Math.random() * WIDTH),
                y: Math.floor(Math.random() * HEIGHT)
            };
            const collision = exclude.some(item => item.x === newItem.x && item.y === newItem.y);
            if (!collision) return newItem;
            attempts++;
        }
        return { x: 0, y: 0 }; // Fallback
    };

    const generateWalls = (snakeBody) => {
        const newWalls = [];
        // Generate 5 random walls, ensuring they don't spawn on snake
        for (let i = 0; i < 5; i++) {
            newWalls.push(generateItem([...snakeBody, ...newWalls]));
        }
        return newWalls;
    };

    const startNewGame = async () => {
        if (dailyPlaysLeft === null) return;
        if (dailyPlaysLeft <= 0) {
            alert("Bạn đã hết lượt chơi hôm nay!");
            return;
        }

        // Record play attempt
        try {
            const { error } = await supabase.from('point_transactions').insert({
                user_id: user.id,
                amount: 0,
                reason: 'Play Snake Game',
                type: 'spend'
            });

            if (error) throw error;

            setDailyPlaysLeft(0);

            const initialSnake = [{ x: 10, y: 10 }];
            const initialWalls = generateWalls(initialSnake);
            const initialFood = generateItem([...initialSnake, ...initialWalls]);

            setSnake(initialSnake);
            snakeRef.current = initialSnake;
            setWalls(initialWalls);
            setFood(initialFood);
            setDirection(RIGHT);
            directionRef.current = RIGHT;
            nextDirectionRef.current = RIGHT;
            setScore(0);
            setGameOver(false);
            setRewardMessage(null);
            setWonVoucherCode(null);
            setIsPaused(false);
            speedRef.current = INITIAL_SPEED;

            stopGameLoop();
            gameLoopRef.current = setInterval(gameStep, INITIAL_SPEED);
            setIsGameStarted(true);

        } catch (err) {
            console.error("Error starting game:", err);
            alert("Không thể bắt đầu trò chơi. Vui lòng thử lại.");
        }
    };

    const stopGameLoop = () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };

    const saveVoucher = async (tier) => {
        if (!user) return;

        // Generate a semi-unique code: Prefix - Random Chars
        const code = `${tier.codePrefix} -${Math.random().toString(36).substring(2, 7).toUpperCase()} `;

        try {
            // Check if user already has a voucher of this type/day? 
            // Allow multiple for now as per game logic.

            const { error } = await supabase.from('user_vouchers').insert({
                user_id: user.id,
                code: code,
                discount_amount: tier.amount,
                min_order_value: tier.amount * 5, // Example logic: Min order 5x value
                status: 'active',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            });

            if (error) throw error;

            setWonVoucherCode(code);
            setRewardMessage(`Chúc mừng! Voucher ${tier.amount.toLocaleString()}đ đã được lưu vào ví.`);

            // Notify system to update UI
            window.dispatchEvent(new Event('pointsUpdated')); // Using existing event to reload membership data

        } catch (err) {
            console.error("Error saving voucher:", err);
            setRewardMessage("Lỗi khi lưu voucher. Vui lòng liên hệ CSKH.");
        }
    };

    const handleKeyDown = useCallback((e) => {
        if (gameOver || showHelp || !isGameStarted) return;

        const currentDir = directionRef.current;
        let newDir = null;

        const key = e.key.toLowerCase();
        switch (key) {
            case 'arrowup':
            case 'w':
                if (currentDir !== DOWN) newDir = UP;
                break;
            case 'arrowdown':
            case 's':
                if (currentDir !== UP) newDir = DOWN;
                break;
            case 'arrowleft':
            case 'a':
                if (currentDir !== RIGHT) newDir = LEFT;
                break;
            case 'arrowright':
            case 'd':
                if (currentDir !== LEFT) newDir = RIGHT;
                break;
            case ' ': // Space to pause
                setIsPaused(prev => !prev);
                break;
            default:
                break;
        }

        if (newDir) {
            // Validate against the *latest committed* direction to prevent 180 turns in one tick
            // Ideally we queue this, but simple ref updating works for buffering 1 input per tick mostly
            nextDirectionRef.current = newDir;
        }
    }, [gameOver, showHelp, isGameStarted]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Handle Pause
    useEffect(() => {
        if (isPaused) {
            stopGameLoop();
        } else if (!gameOver) {
            stopGameLoop();
            gameLoopRef.current = setInterval(gameStep, speedRef.current);
        }
    }, [isPaused, gameOver]);

    const gameStep = () => {
        if (isPaused) return;

        const head = snakeRef.current[0];
        const currentDir = nextDirectionRef.current;
        directionRef.current = currentDir;
        setDirection(currentDir); // Sync state for UI if needed

        const newHead = {
            x: head.x + currentDir.x,
            y: head.y + currentDir.y
        };

        // Wrap around logic (Toroidal)
        if (newHead.x < 0) newHead.x = WIDTH - 1;
        if (newHead.x >= WIDTH) newHead.x = 0;
        if (newHead.y < 0) newHead.y = HEIGHT - 1;
        if (newHead.y >= HEIGHT) newHead.y = 0;

        // Check Collision with Walls or Self
        // Note: Check self collision against the *current* snake body (excluding tail if we don't eat)
        // effectively, we check full body for now, will pop later if not eating

        // 1. Check Wall
        // Since state 'walls' might be stale in closure if we didn't use refs, but here update is infrequent
        // We can trust the state 'walls' or use a ref. For safety let's assume walls don't move.
        // But `walls` is state, so we need to access it properly. 
        // Best to keep walls in ref too if they were dynamic, but they are static per game. 
        // We can access 'walls' from the outer scope as the function is recreated on render? 
        // Wait, `gameStep` is called by setInterval. It closes over initial scope.
        // We MUST use refs for everything accessed inside `gameStep`.
    };

    // Refactored Game Loop to use `useEffect` dependencies properly or use a robust `useInterval` hooks.
    // simpler approach: use a ref for the tick function that always has latest state
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = () => {
            const head = snakeRef.current[0];
            const currentDir = nextDirectionRef.current;
            directionRef.current = currentDir;

            const newHead = {
                x: head.x + currentDir.x,
                y: head.y + currentDir.y
            };

            // Wrap around
            if (newHead.x < 0) newHead.x = WIDTH - 1;
            if (newHead.x >= WIDTH) newHead.x = 0;
            if (newHead.y < 0) newHead.y = HEIGHT - 1;
            if (newHead.y >= HEIGHT) newHead.y = 0;

            // Check Walls
            // We use 'walls' from state, but need to be sure it's fresh.
            // Actually, let's put walls in ref to be safe inside this callback
            const isWallHit = walls.some(w => w.x === newHead.x && w.y === newHead.y);

            // Check Self
            // We don't check tail because it will move unless we eat
            // But if length < 2, no self collision possible
            // Simplified: check all parts. If tail moves, we'll pop it before rendering, 
            // but for collision logic, hitting the tail being popped is generally safe, 
            // but hitting any other part is death.
            const isSelfHit = snakeRef.current.some((part, index) => {
                // Ignore the very last tail segment if we are not eating, as it will move away.
                // But simplifying: just check all for now.
                if (index === snakeRef.current.length - 1) return false;
                return part.x === newHead.x && part.y === newHead.y;
            });

            if (isWallHit || isSelfHit) {
                handleGameOver();
                return;
            }

            const newSnake = [newHead, ...snakeRef.current];

            // Check Food
            // accessing 'food' state inside this ref-callback is tricky if not in ref.
            // Let's rely on standard functional state update pattern?
            // "tick" effect runs every X ms. 
            // BETTER ARCHITECTURE: `useInterval` custom hooks pattern.
        };
    });

    // Let's rewrite using the standard robust React Game Loop pattern
    // We will just use `useEffect` with a tick flag or `setTimeout` recursively.

    useEffect(() => {
        if (gameOver || isPaused || showHelp) {
            stopGameLoop();
            return;
        }

        const tick = () => {
            setSnake(prevSnake => {
                const head = prevSnake[0];
                const currentDir = nextDirectionRef.current;
                directionRef.current = currentDir;
                setDirection(currentDir);

                const newHead = {
                    x: head.x + currentDir.x,
                    y: head.y + currentDir.y
                };

                // Wrap
                if (newHead.x < 0) newHead.x = WIDTH - 1;
                if (newHead.x >= WIDTH) newHead.x = 0;
                if (newHead.y < 0) newHead.y = HEIGHT - 1;
                if (newHead.y >= HEIGHT) newHead.y = 0;

                // Check Wall Collision
                // Accessing `walls` here relies on closure. `walls` doesn't change during game, so it's fine.
                if (walls.some(w => w.x === newHead.x && w.y === newHead.y)) {
                    handleGameOver();
                    return prevSnake;
                }

                // Check Self Collision
                // We check against `prevSnake` but ignore tail if we don't eat.
                // For simplicity, checking all except tail is safe enough.
                if (prevSnake.some((part, index) => index !== prevSnake.length - 1 && part.x === newHead.x && part.y === newHead.y)) {
                    handleGameOver();
                    return prevSnake;
                }

                const newSnakeBody = [newHead, ...prevSnake];

                // Check Food
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore(s => {
                        const sNew = s + 1;
                        if (sNew % 5 === 0) speedRef.current = Math.max(50, INITIAL_SPEED - (sNew * 2));
                        return sNew;
                    });

                    setFood(generateItem([...newSnakeBody, ...walls]));
                    return newSnakeBody;
                } else {
                    newSnakeBody.pop();
                    return newSnakeBody;
                }
            });
        };

        gameLoopRef.current = setInterval(tick, speedRef.current);
        return () => stopGameLoop();
    }, [isPaused, gameOver, showHelp, walls, food]); // Re-bind if food/walls change is fine

    useEffect(() => {
        if (gameOver) {
            // Old logic removed
        }
    }, [gameOver, score]);

    const handleGameOver = () => {
        setGameOver(true);
        stopGameLoop();

        // Check for specific scores - Threshold based (>=)
        // Find highest tier achieved
        // Sort tiers by score descending to find the highest match first
        const sortedTiers = [...VOUCHER_TIERS].sort((a, b) => b.score - a.score);
        const achievedTier = sortedTiers.find(t => score >= t.score);

        if (achievedTier) {
            saveVoucher(achievedTier);
        }
    };

    return (
        <div className="game-overlay-container">
            <div className="game-modal">
                <div className="game-header">
                    <div className="header-left">
                        <h2>Rắn Săn Mồi</h2>
                    </div>
                    {/* Center div removed if not used, or kept empty */}
                    <div className="header-right">
                        <div className="score-container">
                            <div className="play-count">Lượt: {dailyPlaysLeft === null ? '-' : dailyPlaysLeft}</div>
                            <div className="score-board">Điểm: {score}</div>
                            <button className="help-btn" onClick={() => setShowHelp(true)}>
                                <HelpCircle size={18} />
                            </button>
                            <button className="close-btn" onClick={() => navigate('/rewards')}><X /></button>
                        </div>
                    </div>
                </div>

                <div id="snake-board" style={{
                    gridTemplateColumns: `repeat(${WIDTH}, 20px)`,
                    gridTemplateRows: `repeat(${HEIGHT}, 20px)`
                }}>
                    {Array.from({ length: HEIGHT }).map((_, y) => (
                        Array.from({ length: WIDTH }).map((_, x) => {
                            let className = 'cell';
                            if (snake.some(p => p.x === x && p.y === y)) className += ' snake';
                            if (food.x === x && food.y === y) className += ' food';
                            if (walls.some(w => w.x === x && w.y === y)) className += ' wall';
                            return <div key={`${x} -${y} `} className={className} />;
                        })
                    ))}

                    {!isGameStarted && !gameOver && (
                        <div className="play-overlay">
                            <button
                                className={`play-start-btn ${dailyPlaysLeft <= 0 && dailyPlaysLeft !== null ? 'disabled' : ''}`}
                                onClick={startNewGame}
                                disabled={dailyPlaysLeft === null}
                            >
                                {dailyPlaysLeft === null ? "ĐANG TẢI..." : (dailyPlaysLeft <= 0 ? "HẾT LƯỢT" : "CHƠI NGAY")}
                            </button>
                        </div>
                    )}
                </div>

                <div className="controls-hint">Dùng phím mũi tên hoặc WASD để di chuyển</div>

                {gameOver && (
                    <div className="game-over-screen">
                        <h3>Game Over!</h3>
                        <div className="final-score">Điểm của bạn: {score}</div>

                        {wonVoucherCode ? (
                            <div className="voucher-reward">
                                <div>{rewardMessage}</div>
                                <div className="voucher-code">{wonVoucherCode}</div>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '20px', color: '#ccc' }}>
                                Cố gắng đạt mốc 10, 100, 200 điểm để nhận quà!
                            </div>
                        )}

                        <button
                            className={`play-again-btn ${dailyPlaysLeft <= 0 ? 'disabled' : ''}`}
                            onClick={startNewGame}
                            style={dailyPlaysLeft <= 0 ? { background: '#666', cursor: 'not-allowed' } : {}}
                        >
                            {dailyPlaysLeft <= 0 ? "Hết lượt chơi" : "Chơi lại"}
                        </button>
                    </div>
                )}

                {showHelp && (
                    <div className="help-modal-overlay">
                        <div className="help-content">
                            <h3>Cách Chơi & Giải Thưởng</h3>
                            <ul className="help-list">
                                <li>Di chuyển rắn để ăn mồi và ghi điểm.</li>
                                <li>Tránh đâm vào tường và đâm vào thân.</li>
                                <li>Tốc độ sẽ tăng dần theo điểm số.</li>
                            </ul>

                            <div className="reward-tier">
                                <div className="tier-item">
                                    <span>&ge; 10 Điểm</span>
                                    <span>Voucher 10k</span>
                                </div>
                                <div className="tier-item">
                                    <span>&ge; 100 Điểm</span>
                                    <span>Voucher 100k</span>
                                </div>
                                <div className="tier-item">
                                    <span>&ge; 200 Điểm</span>
                                    <span>Voucher 200k</span>
                                </div>
                            </div>

                            <button className="play-again-btn" onClick={() => setShowHelp(false)}>Đã hiểu</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SnakeGame;

// giam toc do ran cho de choi hon
