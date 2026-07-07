

import React, { useState, useEffect } from 'react';
import './DailyCheckIn.css';
import { Calendar, Check, Flame, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { get, post } from '../../services/http';

const REWARD_MAP = [1, 1, 2, 2, 3, 5, 10];

const DailyCheckIn = ({ onPointUpdate }) => {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [isCheckedInToday, setIsCheckedInToday] = useState(false);
    const [loading, setLoading] = useState(false);
    const [daysState, setDaysState] = useState([]);

    useEffect(() => {
        if (!user?.id) return;

        const fetchCheckInStatus = async () => {
            try {
                const all = await get(`/users/${user.id}/point-transactions`);
                const transactions = (all || []).filter(t => t.reason === 'Điểm danh hàng ngày');

                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();

                let currentStreak = 0;
                let checkedToday = false;

                if (transactions.length > 0) {
                    const lastCheckIn = new Date(transactions[0].createdAt).toDateString();

                    if (lastCheckIn === today) {
                        checkedToday = true;
                    }

                    if (checkedToday) {
                        let tempStreak = 1;
                        for (let i = 1; i < transactions.length; i++) {
                            const d1 = new Date(transactions[i - 1].createdAt).setHours(0, 0, 0, 0);
                            const d2 = new Date(transactions[i].createdAt).setHours(0, 0, 0, 0);

                            if ((d1 - d2) === 86400000) {
                                tempStreak++;
                            } else if (d1 === d2) {
                                continue;
                            } else {
                                break;
                            }
                        }
                        currentStreak = tempStreak;
                    } else if (lastCheckIn === yesterday) {
                        let tempStreak = 0;
                        for (let i = 0; i < transactions.length; i++) {
                            const expectedDate = new Date();
                            expectedDate.setDate(expectedDate.getDate() - (i + 1));

                            const txDate = new Date(transactions[i].createdAt);
                            if (txDate.toDateString() === expectedDate.toDateString()) {
                                tempStreak++;
                            } else {
                                break;
                            }
                        }
                        currentStreak = tempStreak;
                    }
                }

                setStreak(currentStreak);
                setIsCheckedInToday(checkedToday);
            } catch (err) {
                console.error('Error fetching check-in:', err.message);
            }
        };

        fetchCheckInStatus();
    }, [user, isCheckedInToday]);

    useEffect(() => {
        const newDays = Array.from({ length: 7 }, (_, i) => {
            const dayNum = i + 1;
            let status = 'future';
            let label = `Ngày ${dayNum}`;

            const completedInCycle = isCheckedInToday ? ((streak - 1) % 7) + 1 : (streak % 7);

            if (dayNum <= completedInCycle) {
                status = 'checked';
                if (dayNum === completedInCycle && isCheckedInToday) {
                    label = 'Hôm nay';
                    status = 'today checked';
                } else {
                    label = i === completedInCycle - 1 && isCheckedInToday ? 'Hôm nay' : `Ngày ${dayNum}`;
                }
            } else if (dayNum === completedInCycle + 1) {
                if (!isCheckedInToday) {
                    status = 'today';
                    label = 'Hôm nay';
                }
            }

            if (isCheckedInToday && dayNum === completedInCycle - 1) label = 'Hôm qua';
            if (!isCheckedInToday && dayNum === completedInCycle) label = 'Hôm qua';

            return {
                day: dayNum,
                points: REWARD_MAP[i],
                status,
                label,
                isReward: dayNum === 7,
            };
        });

        setDaysState(newDays);
    }, [streak, isCheckedInToday]);

    const handleCheckIn = async () => {
        if (!user?.id || isCheckedInToday || loading) return;
        setLoading(true);

        const nextDay = (streak % 7) + 1;
        const pointsToAdd = REWARD_MAP[nextDay - 1];

        try {
            await post(`/users/${user.id}/point-transactions`, {
                type: 'earn',
                amount: pointsToAdd,
                reason: 'Điểm danh hàng ngày',
            });

            setIsCheckedInToday(true);
            setStreak(prev => prev + 1);
            alert(`Điểm danh thành công! Bạn nhận được ${pointsToAdd} xu.`);
            if (onPointUpdate) onPointUpdate(pointsToAdd);
            window.dispatchEvent(new Event('pointsUpdated'));
        } catch (error) {
            console.error('Check-in failed:', error.message);
            alert('Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="daily-checkin-container">
            <div className="checkin-header">
                <Calendar size={20} />
                <span>ĐIỂM DANH HÀNG NGÀY</span>
            </div>

            <div className="days-strip">
                {daysState.map((item, index) => (
                    <div
                        key={index}
                        className={`day-box ${item.status.includes('checked') ? 'checked' : ''} ${item.status === 'today' || item.status.includes('today') ? 'today' : ''} ${item.day === 7 ? 'day-7' : ''}`}
                    >
                        {item.status.includes('checked') && <Check className="check-icon" size={20} />}
                        {item.status === 'today' && !item.status.includes('checked') && <Flame className="check-icon" size={20} />}
                        {item.day === 7 && item.status === 'future' && <div className="check-icon"><Gift size={20} color="#FBC02D" /></div>}

                        <span className="points">+{item.points}</span>
                        <span className="day-label">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="checkin-btn-container">
                <button
                    className="checkin-btn"
                    onClick={handleCheckIn}
                    disabled={isCheckedInToday || loading || !user}
                >
                    {isCheckedInToday ? "ĐÃ ĐIỂM DANH HÔM NAY" : "ĐIỂM DANH & NHẬN XU"}
                </button>
            </div>
        </div>
    );
};

export default DailyCheckIn;
