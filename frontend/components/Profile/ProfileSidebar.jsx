

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { User, ClipboardList, Bell, LogOut, ChevronDown, Edit2 } from 'lucide-react';
import './Profile.css';

const ProfileSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname: pathname } = useLocation();

    // Default Avatar
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // Toggle State for My Account Menu
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(true);

    const toggleAccountMenu = () => {
        setIsAccountMenuOpen(!isAccountMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Derived State for UI
    const [userData, setUserData] = useState({
        username: '',
        avatarUrl: ''
    });

    useEffect(() => {
        if (user) {
            const username = user.user_metadata?.username || user.email?.split('@')[0] || '';
            const avatarUrl = user.user_metadata?.avatar_url || '';
            setUserData({ username, avatarUrl });
        }
    }, [user]);

    // Helper to check active route
    const isActive = (path) => pathname === path;

    return (
        <div className="profile-sidebar">
            <div className="sidebar-user">
                <img
                    src={userData.avatarUrl || defaultAvatar}
                    alt="avatar"
                    className="sidebar-avatar"
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => { e.target.src = defaultAvatar; }}
                />
                <div className="sidebar-username">
                    <strong>{userData.username || 'User'}</strong>
                    <Link to="/profile" className="edit-profile-link">
                        <Edit2 size={12} /> Sửa Hồ Sơ
                    </Link>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <div
                        className="nav-item active-highlight"
                        onClick={toggleAccountMenu}
                        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="nav-icon"><User size={20} /></span>
                            <span className="nav-label">Tài Khoản Của Tôi</span>
                        </div>
                        <ChevronDown
                            size={16}
                            style={{
                                transform: isAccountMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                color: '#888'
                            }}
                        />
                    </div>

                    {isAccountMenuOpen && (
                        <div className="sub-nav">
                            <Link to="/profile" className={`sub-nav-item ${isActive('/profile') ? 'active' : ''}`}>Hồ Sơ</Link>
                            <Link to="/addresses" className={`sub-nav-item ${isActive('/addresses') ? 'active' : ''}`}>Địa Chỉ</Link>
                            <Link to="/change-password" className={`sub-nav-item ${isActive('/change-password') ? 'active' : ''}`}>Đổi Mật Khẩu</Link>
                        </div>
                    )}
                </div>

                <Link to="/orders" className={`nav-item ${isActive('/orders') ? 'active-highlight' : ''}`}>
                    <span className="nav-icon"><ClipboardList size={20} /></span>
                    <span className="nav-label">Đơn Mua</span>
                </Link>

                <Link to="/profile/notifications" className={`nav-item ${isActive('/profile/notifications') ? 'active-highlight' : ''}`}>
                    <span className="nav-icon"><Bell size={20} /></span>
                    <span className="nav-label">Thông Báo</span>
                </Link>

                <button onClick={handleLogout} className="nav-item logout-btn">
                    <span className="nav-icon"><LogOut size={20} /></span>
                    <span className="nav-label">Đăng Xuất</span>
                </button>
            </nav>
        </div>
    );
};

export default ProfileSidebar;
