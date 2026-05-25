

import React, { useState, useEffect } from 'react';
import './DailyCheckIn.css';
import { Calendar, Check, Flame, Gift } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const REWARD_MAP = [1, 1, 2, 2, 3, 5, 10]; // Points for Day 1 to Day 7

const DailyCheckIn = ({ onPointUpdate }) => {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [isCheckedInToday, setIsCheckedInToday] = useState(false);
    const [loading, setLoading] = useState(false);
    const [daysState, setDaysState] = useState([]);

    // Fetch Check-in History
    useEffect(() => {
        if (!user) return;

        const fetchCheckInStatus = async () => {
            try {
                // Get check-in transactions
                const { data: transactions, error } = await supabase
                    .from('point_transactions')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .eq('reason', 'Điểm danh hàng ngày')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();

                let currentStreak = 0;
                let checkedToday = false;

                if (transactions && transactions.length > 0) {
                    const lastCheckIn = new Date(transactions[0].created_at).toDateString();

                    // Check if checked in today
                    if (lastCheckIn === today) {
                        checkedToday = true;
                    }

                    if (checkedToday) {
                        // Logic to count streak backwards
                        let tempStreak = 1;
                        for (let i = 1; i < transactions.length; i++) {
                            const d1 = new Date(transactions[i - 1].created_at).setHours(0, 0, 0, 0);
                            const d2 = new Date(transactions[i].created_at).setHours(0, 0, 0, 0);

                            if ((d1 - d2) === 86400000) { // Exactly 1 day gap
                                tempStreak++;
                            } else if (d1 === d2) {
                                continue;
                            } else {
                                break;
                            }
                        }
                        currentStreak = tempStreak;
                    } else {
                        // Not checked in today. Check if checked in yesterday.
                        if (lastCheckIn === yesterday) {
                            let tempStreak = 0;
                            for (let i = 0; i < transactions.length; i++) {
                                const expectedDate = new Date();
                                expectedDate.setDate(expectedDate.getDate() - (i + 1)); // Yesterday, Day before...

                                const txDate = new Date(transactions[i].created_at);
                                if (txDate.toDateString() === expectedDate.toDateString()) {
                                    tempStreak++;
                                } else {
                                    break;
                                }
                            }
                            currentStreak = tempStreak;
                        } else {
                            currentStreak = 0; // Streak broken
                        }
                    }
                }

                setStreak(currentStreak);
                setIsCheckedInToday(checkedToday);

            } catch (err) {
                console.error("Error fetching check-in:", err);
            }
        };

        fetchCheckInStatus();
    }, [user, isCheckedInToday]); // Re-run if checked in state changes

    // Update UI state based on streak/today status
    useEffect(() => {
        let displayDayIndex = isCheckedInToday ? streak : streak + 1;

        // Cycle logic usually implied by "streak". 
        // If streak > 7, we want to show the current 7-day window.
        // e.g. streak 8 -> Day 1 of new cycle? Or just Day 1?
        // Let's implement wrap-around for display 1-7.

        let cycleDay = ((displayDayIndex - 1) % 7) + 1;
        if (cycleDay === 0) cycleDay = 1;

        const newDays = Array.from({ length: 7 }, (_, i) => {
            const dayNum = i + 1;
            let status = 'future';
            let label = `Ngày ${dayNum}`;

            // Determine how many past days in THIS CURRENT 7-day cycle are completed.
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

            // Fix label for yesterday
            if (isCheckedInToday && dayNum === completedInCycle - 1) label = 'Hôm qua';
            if (!isCheckedInToday && dayNum === completedInCycle) label = 'Hôm qua';

            return {
                day: dayNum,
                points: REWARD_MAP[i],
                status: status,
                label: label,
                isReward: dayNum === 7
            };
        });

        setDaysState(newDays);

    }, [streak, isCheckedInToday]);


    const handleCheckIn = async () => {
        if (!user || isCheckedInToday || loading) return;
        setLoading(true);

        // Determine points
        const nextDay = (streak % 7) + 1;
        const pointsToAdd = REWARD_MAP[nextDay - 1];

        try {
            // 1. Add Transaction
            const { error: txError } = await supabase.from('point_transactions').insert([{
                user_id: user.id,
                amount: pointsToAdd,
                reason: 'Điểm danh hàng ngày',
                type: 'earn'
            }]);
            if (txError) throw txError;

            // 2. Update Profile Points
            const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
            if (profile) {
                await supabase.from('profiles').update({ points: profile.points + pointsToAdd }).eq('id', user.id);
            }

            // Update State
            setIsCheckedInToday(true);
            setStreak(prev => prev + 1);
            alert(`Điểm danh thành công! Bạn nhận được ${pointsToAdd} xu.`);
            if (onPointUpdate) onPointUpdate(pointsToAdd);

        } catch (error) {
            console.error("Check-in failed:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
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
