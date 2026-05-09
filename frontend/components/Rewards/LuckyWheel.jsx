

import React, { useState, useEffect } from 'react';
import './LuckyWheel.css';
import { supabase } from '../../services/supabaseClient';
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

const LuckyWheel = ({ onClose, onSpinComplete }) => {
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
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('last_lucky_spin, spin_tickets')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            const lastSpin = data.last_lucky_spin ? new Date(data.last_lucky_spin).toDateString() : null;
            const today = new Date().toDateString();

            if (lastSpin !== today) {
                setCanSpin(true);
                setMessage("Bạn có 1 lượt quay miễn phí hôm nay!");
            } else if (data.spin_tickets > 0) {
                setCanSpin(true);
                setMessage(`Bạn còn ${data.spin_tickets} vé quay thêm.`);
            }
        } catch (err) {
            console.error("Error checking spin status:", err);
        } finally {
            setLoading(false);
        }
    };

    const getPrize = () => {
        const random = Math.random() * 100;
        let sum = 0;
        for (let prize of PRIZES) {
            sum += prize.weight;
            if (random <= sum) return prize;
        }
        return PRIZES[PRIZES.length - 1];
    };

    const processReward = async (prize) => {
        try {
            const updates = { last_lucky_spin: new Date().toISOString() };
            // Add Reward Logic
            if (typeof prize.value === 'number') {
                const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
                updates.points = (profile?.points || 0) + prize.value;

                await supabase.from('point_transactions').insert({
                    user_id: user.id,
                    amount: prize.value,
                    reason: `Trúng thưởng Lucky Wheel: ${prize.name}`,
                    type: 'earn'
                });
            } else if (prize.value.startsWith('VOUCHER')) {
                // Generate simple code
                const code = `WHEEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                const amount = prize.value === 'VOUCHER_500' ? 500000 : 50000;

                // Insert Voucher
                await supabase.from('user_vouchers').insert({
                    user_id: user.id,
                    code: code,
                    discount_amount: amount,
                    min_order_value: 0,
                    status: 'active'
                });

                alert(`Bạn nhận được mã: ${code}`);
            }

            await supabase.from('profiles').update(updates).eq('id', user.id);

            // Notify global listener
            window.dispatchEvent(new Event('pointsUpdated'));

            checkEligibility();

        } catch (error) {
            console.error("Error processing reward:", error);
        }
    };

    const handleSpin = async () => {
        if (!canSpin || spinning || !user) return;
        setSpinning(true);

        const prize = getPrize();
        const prizeIndex = PRIZES.findIndex(p => p.id === prize.id);
        const segmentAngle = 360 / PRIZES.length;

        // Correct rotation calc for 0-60 degrees at top (with +30 offset for label)
        // If index 0 is at 0-60 deg. 
        // We want accurate animation so let's stick to standard logic:
        const targetRotation = 360 * 6 + (360 - (prizeIndex * segmentAngle) - segmentAngle / 2);
        const finalRotation = rotation + targetRotation;

        setRotation(finalRotation);

        setTimeout(async () => {
            await processReward(prize);
            setSpinning(false);
            // Infinite spin mode: do not disable canSpin
            alert(`Chúc mừng! Bạn quay vào: ${prize.name}`);
            if (onSpinComplete) onSpinComplete();
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
                                // Correct rotation: -60 deg offset to align indices
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
