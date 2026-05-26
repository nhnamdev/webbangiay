

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Membership.css';
import { useAuth } from '../../context/AuthContext';
import { get, post } from '../../services/http';

const Membership = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [points, setPoints] = useState(0);
    const [history, setHistory] = useState([]);
    const [currentView, setCurrentView] = useState('main');
    const [expandedSections, setExpandedSections] = useState({
        redeem: false,
        earn: false,
    });

    const [vouchers, setVouchers] = useState([]);
    const [redeemedVoucher, setRedeemedVoucher] = useState(null);

    const loadData = async () => {
        if (!user?.id) {
            setPoints(0);
            setHistory([]);
            setVouchers([]);
            return;
        }
        try {
            const profile = await get(`/users/${user.id}`);
            if (profile) setPoints(profile.points || 0);

            const transactions = await get(`/points/user/${user.id}/transactions`).catch(() => []);
            setHistory((transactions || []).map(t => ({
                ...t,
                date: new Date(t.createdAt).toLocaleDateString('vi-VN'),
                time: new Date(t.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            })));

            const voucherList = await get(`/vouchers/user/${user.id}`).catch(() => []);
            setVouchers(voucherList || []);
        } catch (error) {
            console.error('Error loading membership data:', error.message || error);
        }
    };

    useEffect(() => {
        loadData();
        const handlePointUpdate = () => loadData();
        window.addEventListener('pointsUpdated', handlePointUpdate);
        return () => window.removeEventListener('pointsUpdated', handlePointUpdate);
    }, [user, isOpen]);

    const handleAddPoints = async (amount, reason) => {
        if (!user?.id) return;
        if (amount < 0 && points + amount < 0) {
            alert('Bạn không đủ xu để thực hiện đổi quà này.');
            return;
        }

        try {
            await post(`/points/user/${user.id}`, {
                type: amount >= 0 ? 'earn' : 'spend',
                amount: Math.abs(amount),
                reason,
            });
            window.dispatchEvent(new Event('pointsUpdated'));
        } catch (error) {
            console.error(error.message || error);
        }
    };

    const handleRedeemExchange = async () => {
        if (!user?.id) return;
        if (points < 200) {
            alert('Bạn không đủ xu để đổi quà!');
            return;
        }

        if (!confirm('Bạn có chắc muốn dùng 200 xu để đổi voucher 200k không?')) return;

        try {
            await post(`/points/user/${user.id}`, {
                type: 'spend',
                amount: 200,
                reason: 'Đổi xu lấy Voucher 200k',
            });

            const code = `V200K-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await post('/vouchers', {
                userId: user.id,
                code,
                discountAmount: 200000,
                minOrderValue: 1000000,
                status: 'active',
                expiresAt,
            });

            setPoints(points - 200);
            window.dispatchEvent(new Event('pointsUpdated'));

            setRedeemedVoucher({
                code,
                discountAmount: 200000,
                expiresAt,
            });

            setCurrentView('redeem-success');
        } catch (error) {
            console.error('Redeem error:', error.message || error);
            alert('Có lỗi xảy ra khi đổi quà. Vui lòng thử lại.');
        }
    };

    const hasJoined = history.some(item => item.reason === 'Đăng ký thành viên');

    const toggleModal = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setCurrentView('main');
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleBack = () => setCurrentView('main');

    const renderHeader = () => {
        if (currentView === 'main') {
            return (
                <div className="membership-header">
                    <span className="close-btn" onClick={toggleModal}>&times;</span>
                    <h3>{user ? 'THẺ THÀNH VIÊN' : 'Chào mừng đến với cửa hàng của chúng tôi'}</h3>
                </div>
            );
        }
        let title = '';
        if (currentView === 'redeem') title = 'Quy Đổi Xu';
        if (currentView === 'redeem-success') title = 'Quy Đổi Xu';
        if (currentView === 'referral') title = 'Giới thiệu bạn bè';
        if (currentView === 'history') title = 'Lịch sử của tôi';
        if (currentView === 'my-coupons') title = 'ĐỔI XU';

        return (
            <div className="membership-header sub-header">
                <button className="back-btn" onClick={handleBack}><i className="fas fa-angle-left"></i></button>
                <h3>{title}</h3>
                <button className="close-btn" onClick={toggleModal}>&times;</button>
            </div>
        );
    };

    const renderMainContent = () => (
        <>
            <div className="member-info-card">
                <div>
                    <div className="member-card-title">THẺ THÀNH VIÊN</div>
                    <div className="member-card-subtitle">Xu hiện có</div>
                    <div className="member-card-points">
                        {points}<small>Xu</small>
                    </div>
                </div>
                <div className="member-card-name">
                    {user?.lastName || user?.user_metadata?.last_name || 'KHÁCH HÀNG'}
                </div>
            </div>

            <div className="membership-grid">
                <div className="membership-card clickable-card grid-item" onClick={() => setCurrentView('redeem')}>
                    <div className="card-header-column">
                        <div className="icon-box-small green"><span className="icon">P</span></div>
                        <h4>Đối thưởng xu</h4>
                        <span className="arrow-right">&rsaquo;</span>
                    </div>
                </div>

                <div className="membership-card clickable-card grid-item" onClick={() => setCurrentView('my-coupons')}>
                    <div className="card-header-column">
                        <div className="icon-box-small pink"><span className="icon">%</span></div>
                        <h4>Mã giảm giá của tôi</h4>
                        <span className="arrow-right">&rsaquo;</span>
                    </div>
                </div>
            </div>

            <div className="membership-card clickable-card">
                <div className="card-header" onClick={() => toggleSection('earn')}>
                    <div>
                        <p className="subtitle-text">1 chương trình</p>
                    </div>
                    <span className={`arrow-icon ${expandedSections.earn ? 'expanded' : ''}`}>
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 1L6 6L1 1" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
                {expandedSections.earn && (
                    <div className="card-content">
                        <div className="reward-item" onClick={() => !hasJoined && handleAddPoints(200, 'Đăng ký thành viên')}>
                            <div className="icon-box blue"><span className="icon">👤</span></div>
                            <div className="reward-info">
                                <h5>Đăng ký thành viên</h5>
                                <p>Nhận được 200 xu</p>
                            </div>
                            {hasJoined && <div className="check-mark">✓</div>}
                        </div>
                    </div>
                )}
            </div>

            <div className="membership-card clickable-card" onClick={() => setCurrentView('referral')}>
                <div className="card-header">
                    <div>
                        <h4>Giới thiệu bạn bè</h4>
                        <p className="subtitle-text">Nhận voucher 10%</p>
                    </div>
                    <span className="arrow-icon">
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 9L5 5L1 1" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
            </div>

            <div className="history-link" onClick={() => setCurrentView('history')}>
                Xem lịch sử xu
            </div>
        </>
    );

    const renderRedeemInputView = () => (
        <div className="view-content center-content">
            <div className="ticket-icon-large">
                <img src="/redeem_logo.png" alt="Redeem Logo" className="redeem-logo-img" />
            </div>
            <h3 className="redeem-title">ĐỔI ĐIỂM</h3>
            <p className="activation-points">200 điểm</p>

            <button
                className={`primary-btn dark ${points < 200 ? 'disabled' : ''}`}
                onClick={handleRedeemExchange}
                disabled={points < 200}
            >
                ĐỔI QUÀ
            </button>

            <p className="redeem-subtitle">Đổi 200 điểm lấy 200.000 đ</p>

            <div className="redeem-terms-container">
                <div className="term-header">
                    <p>Áp dụng cho đơn hàng tối thiểu 1.000.000 VND</p>
                    <span className="term-arrow"></span>
                </div>
            </div>
        </div>
    );

    const renderRedeemSuccessView = () => {
        if (!redeemedVoucher) return null;

        return (
            <div className="view-content center-content">
                <div className="success-icon-large">
                    <div className="success-circle">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                <h3>ĐỔI XU</h3>
                <p style={{ marginBottom: '20px' }}>Giảm giá 200.000₫ cho 200 xu</p>

                <div className="coupon-box">
                    <span>{redeemedVoucher.code}</span>
                    <span className="copy-icon" onClick={() => {
                        navigator.clipboard.writeText(redeemedVoucher.code);
                        alert('Đã sao chép!');
                    }}>❐</span>
                </div>

                <button className="primary-btn dark" onClick={() => { toggleModal(); }}>
                    Áp dụng ngay
                </button>

                <p className="redeem-note">Hãy sử dụng mã giảm giá này cho đơn hàng tiếp theo.</p>
            </div>
        );
    };

    const renderReferralView = () => (
        <div className="view-content center-content">
            <div className="heart-icon-large">❤️</div>
            <h3>Giới Thiệu Bạn Bè</h3>
            <p className="refer-desc-large">
                Giới thiệu bạn bè cùng trở thành thành viên ABC-MART để nhận ngay voucher ưu đãi 10%
            </p>

            <div className="referral-link-box">
                https://hkt-shoes.com?referralCode=zDie
            </div>

            <button className="primary-btn dark" onClick={() => handleAddPoints(0, 'Nhận Voucher 10% (Giới thiệu)')}>
                Sao chép liên kết mời
            </button>

            <p className="refer-status">Bạn đã giới thiệu 0 người bạn</p>
        </div>
    );

    const renderHistoryView = () => (
        <div className="view-content">
            <div className="history-summary-card">
                <p>Tổng số xu hiện có:</p>
                <h2>{points} xu</h2>
            </div>

            <div className="history-list">
                {history.map((item, index) => (
                    <div key={index} className="history-item">
                        <div className="history-time">{item.time} • {item.date}</div>
                        <div className="history-reason">{item.reason}</div>
                        <div className={`history-amount ${item.type === 'earn' ? 'positive' : 'negative'}`}>
                            {item.type === 'earn' ? '+' : '-'}{item.amount} xu
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMyCouponsDetailView = () => {
        if (vouchers.length === 0) {
            return (
                <div className="view-content center-content">
                    <p>Bạn chưa có mã giảm giá nào.</p>
                    <button className="primary-btn dark" onClick={handleBack} style={{ marginTop: '20px' }}>Quay lại</button>
                </div>
            );
        }

        return (
            <div className="view-content">
                {vouchers.map(v => (
                    <div key={v.id} className="membership-card" style={{ marginBottom: '15px' }}>
                        <div className="coupon-detail-header">
                            <div className="icon-box orange"><span className="icon">$$</span></div>
                            <h4 style={{ marginLeft: '15px', fontSize: '16px' }}>
                                {(v.discountAmount || 0) >= 100000 ? 'VOUCHER VIP' : 'MÃ GIẢM GIÁ'}
                            </h4>
                        </div>

                        <ul className="coupon-detail-list">
                            <li><strong>Mã:</strong> {v.code}</li>
                            <li><strong>Giảm giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.discountAmount || 0)}</li>
                            <li><strong>Hết hạn vào:</strong> {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : 'Không bao giờ'}</li>
                            {v.minOrderValue > 0 && <li><strong>Đơn tối thiểu:</strong> {v.minOrderValue}đ</li>}
                        </ul>

                        <button className="primary-btn dark" onClick={() => {
                            navigator.clipboard.writeText(v.code);
                            alert(`Đã sao chép mã: ${v.code}`);
                        }} style={{ marginTop: '20px' }}>
                            Sao chép mã
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const renderGuestView = () => (
        <>
            <div className="membership-card main-card">
                <h4>THẺ THÀNH VIÊN</h4>
                <p>Nhận ưu đãi độc quyền từ chương trình khách hàng thân thiết của chúng tôi</p>
                <button
                    className="join-btn"
                    onClick={() => { setIsOpen(false); navigate('/register'); }}
                >
                    Tham gia chương trình
                </button>
                <div className="login-text">
                    Bạn đã là thành viên?
                    <span
                        style={{ color: 'black', textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
                        onClick={() => { setIsOpen(false); navigate('/login'); }}
                    >
                        Đăng nhập
                    </span>
                </div>
            </div>
        </>
    );

    return (
        <div className="membership-container">
            {isOpen && (
                <div className="membership-modal-overlay">
                    <div className="membership-modal">
                        {renderHeader()}
                        <div className="membership-body">
                            {!user ? renderGuestView() : (
                                <>
                                    {currentView === 'main' && renderMainContent()}
                                    {currentView === 'redeem' && renderRedeemInputView()}
                                    {currentView === 'redeem-success' && renderRedeemSuccessView()}
                                    {currentView === 'referral' && renderReferralView()}
                                    {currentView === 'history' && renderHistoryView()}
                                    {currentView === 'my-coupons' && renderMyCouponsDetailView()}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="membership-toggle" onClick={toggleModal}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};

export default Membership;
