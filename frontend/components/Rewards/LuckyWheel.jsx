

import React, { useState, useEffect } from 'react';
import './LuckyWheel.css';
import { get, post, patch } from '../../services/http';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRIZES = [
    { id: 1, name: "Voucher 500k", weight: 0.1, color: '#FF5252', value: 'VOUCHER_500' },
    { id: 2, name: "Tặng Vớ", weight: 5, color: '#FFC107', value: 'GIFT_SOCK' },
    { id: 3, name: "100 Xu", weight: 30, color: '#4CAF50', value: 100 },
    { id: 4, name: "Voucher 50k", weight: 4, color: '#2196F3', value: 'VOUCHER_50' },
    { id: 5, name: "200 Xu", weight: 5, color: '#9C27B0', value: 200 },
    { id: 6, name: "Chúc may mắn", weight: 55.9, color: '#FF9800', value: 0 }
];

const LuckyWheel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [canSpin, setCanSpin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        checkEligibility();
    }, [user]);

    const checkEligibility = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await get(`/users/${user.id}`);
            const lastSpin = data.lastLuckySpin ? new Date(data.lastLuckySpin).toDateString() : null;
            const today = new Date().toDateString();

            if (lastSpin !== today) {
                setCanSpin(true);
                setMessage("Bạn có 1 lượt quay miễn phí hôm nay!");
            } else if ((data.spinTickets || 0) > 0) {
                setCanSpin(true);
                setMessage(`Bạn còn ${data.spinTickets} vé quay thêm.`);
            }
        } catch (err) {
            console.error('Error checking spin status:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const getPrize = () => {
        const random = Math.random() * 100;
        let sum = 0;
        for (const prize of PRIZES) {
            sum += prize.weight;
            if (random <= sum) return prize;
        }
        return PRIZES[PRIZES.length - 1];
    };

    const processReward = async (prize) => {
        try {
            if (typeof prize.value === 'number' && prize.value > 0) {
                await post(`/users/${user.id}/point-transactions`, {
                    type: 'earn',
                    amount: prize.value,
                    reason: `Trúng thưởng Lucky Wheel: ${prize.name}`,
                });
            } else if (typeof prize.value === 'string' && prize.value.startsWith('VOUCHER')) {
                const code = `WHEEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                const amount = prize.value === 'VOUCHER_500' ? 500000 : 50000;

                await post('/vouchers', {
                    userId: user.id,
                    code,
                    discountAmount: amount,
                    minOrderValue: 0,
                    status: 'active',
                });

                alert(`Bạn nhận được mã: ${code}`);
            }

            await patch(`/users/${user.id}`, { lastLuckySpin: new Date().toISOString() });

            window.dispatchEvent(new Event('pointsUpdated'));
            checkEligibility();
        } catch (error) {
            console.error('Error processing reward:', error.message);
        }
    };

    const handleSpin = async () => {
        if (!canSpin || spinning || !user?.id) return;
        setSpinning(true);

        const prize = getPrize();
        const prizeIndex = PRIZES.findIndex(p => p.id === prize.id);
        const segmentAngle = 360 / PRIZES.length;

        const targetRotation = 360 * 6 + (360 - (prizeIndex * segmentAngle) - segmentAngle / 2);
        const finalRotation = rotation + targetRotation;

        setRotation(finalRotation);

        setTimeout(async () => {
            await processReward(prize);
            setSpinning(false);
            alert(`Chúc mừng! Bạn quay vào: ${prize.name}`);
        }, 4000);
    };

    return (
        <div className="lucky-wheel-overlay">
            <div className="lucky-wheel-container">
                <button className="close-btn-wheel" onClick={() => navigate('/rewards')}><X /></button>
                <h3>VÒNG QUAY MAY MẮN</h3>
                <p>{message}</p>

                <div className="wheel-wrapper">
                    <div className="wheel-pointer"></div>
                    <div
                        className="wheel-board"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        {PRIZES.map((p, i) => (
                            <div
                                key={p.id}
                                className="wheel-label"
                                style={{ transform: `rotate(${i * 60 - 60}deg)` }}
                            >
                                {p.name}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    className="spin-btn"
                    onClick={handleSpin}
                    disabled={!canSpin || spinning || loading}
                >
                    {spinning ? "ĐANG QUAY..." : "QUAY NGAY"}
                </button>
            </div>
        </div>
    );
};

export default LuckyWheel;
