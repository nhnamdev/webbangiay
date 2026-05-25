

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { User, Edit2, ClipboardList, Bell, LogOut, ChevronDown, Eye, EyeOff } from 'lucide-react';
import './Profile.css'; // Re-use profile styles for layout

const ChangePassword = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Default Avatar
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // Toggle State for My Account Menu
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(true);

    // Password States
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleAccountMenu = () => {
        setIsAccountMenuOpen(!isAccountMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation logic here
        if (formData.newPassword !== formData.confirmPassword) {
            alert("Mật khẩu mới không khớp!");
            return;
        }
        alert("Chức năng đổi mật khẩu đang được phát triển.");
    };

    if (!user) {
        return (
            <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
                <p>Vui lòng đăng nhập.</p>
                <Link to="/login" className="btn-primary">Đăng nhập</Link>
            </div>
        );
    }

    const avatarUrl = user.user_metadata?.avatar_url || defaultAvatar;
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

    return (
        <div className="profile-container">
            <div className="profile-layout">
                {/* Sidebar - Duplicated from Profile.jsx for consistency */}
                <div className="profile-sidebar">
                    <div className="sidebar-user">
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="sidebar-avatar"
                            onError={(e) => { e.target.src = defaultAvatar; }}
                        />
                        <div className="sidebar-username">
                            <strong>{username}</strong>
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
                                    <Link to="/profile" className="sub-nav-item">Hồ Sơ</Link>
                                    <Link to="/addresses" className="sub-nav-item">Địa Chỉ</Link>
                                    <Link to="/change-password" className="sub-nav-item active">Đổi Mật Khẩu</Link>
                                </div>
                            )}
                        </div>

                        <Link to="/orders" className="nav-item">
                            <span className="nav-icon"><ClipboardList size={20} /></span>
                            <span className="nav-label">Đơn Mua</span>
                        </Link>

                        <Link to="/notifications" className="nav-item">
                            <span className="nav-icon"><Bell size={20} /></span>
                            <span className="nav-label">Thông Báo</span>
                        </Link>

                        <button onClick={handleLogout} className="nav-item logout-btn">
                            <span className="nav-icon"><LogOut size={20} /></span>
                            <span className="nav-label">Đăng Xuất</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="profile-main-content">
                    <div className="profile-paper">
                        <div className="paper-header">
                            <h2>Đổi mật khẩu</h2>
                            <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                        </div>

                        <div className="profile-body" style={{ flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
                            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>

                                {/* Current Password */}
                                <div className="form-row-custom">
                                    <label>Mật khẩu hiện tại</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder=""
                                        />
                                        <button type="button" className="toggle-password" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="form-row-custom">
                                    <label>Mật khẩu mới</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder=""
                                        />
                                        <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="form-row-custom">
                                    <label>Xác nhận mật khẩu</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder=""
                                        />
                                        <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-row-custom submit-row" style={{ justifyContent: 'flex-start' }}>
                                    <label></label> {/* Empty label for alignment */}
                                    <button type="submit" className="save-btn" style={{ padding: '12px 30px' }}>Xác Nhận</button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
