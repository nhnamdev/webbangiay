

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { User, Lock, Edit2, ClipboardList, Bell, LogOut, ChevronDown } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Default Avatar
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // Toggle State for My Account Menu
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(true);

    const toggleAccountMenu = () => {
        setIsAccountMenuOpen(!isAccountMenuOpen);
    };

    // Initial state setup
    const [profileData, setProfileData] = useState({
        username: '',
        name: '',
        email: '',
        phone: '', 
        gender: 'male',
        day: '1',
        month: '1',
        year: '1990',
        avatarUrl: ''
    });

    useEffect(() => {
        if (user) {
            // Extract username
            const username = user.user_metadata?.username || user.email?.split('@')[0] || '';

            // Extract name
            let fullName = '';
            if (user.user_metadata?.full_name) {
                fullName = user.user_metadata.full_name;
            } else if (user.user_metadata?.first_name || user.user_metadata?.last_name) {
                fullName = [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ');
            } else {
                fullName = 'Khách';
            }

            setProfileData(prev => ({
                ...prev,
                username: username,
                name: fullName,
                email: user.email || '',
                phone: user.user_metadata?.phone || '********42',
                avatarUrl: user.user_metadata?.avatar_url || ''
            }));
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!user) {
        return (
            <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
                <p>Vui lòng đăng nhập để xem thông tin tài khoản.</p>
                <Link to="/login" className="btn-primary">Đăng nhập</Link>
            </div>
        );
    }

    // Days/Months/Years generation
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    return (
        <div className="profile-container">
            <div className="profile-layout">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="sidebar-user">
                        <img
                            src={profileData.avatarUrl || defaultAvatar}
                            alt="avatar"
                            className="sidebar-avatar"
                            onError={(e) => { e.target.src = defaultAvatar; }}
                        />
                        <div className="sidebar-username">
                            <strong>{profileData.username}</strong>
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
                                    <Link to="/profile" className="sub-nav-item active">Hồ Sơ</Link>
                                    <Link to="/addresses" className="sub-nav-item">Địa Chỉ</Link>
                                    <Link to="/change-password" className="sub-nav-item">Đổi Mật Khẩu</Link>
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
                            <h2>Hồ Sơ Của Tôi</h2>
                            <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                        </div>

                        <div className="profile-body">
                            {/* Left Side: Form */}
                            <div className="profile-form-section">
                                <div className="form-row-custom">
                                    <label>Tên đăng nhập</label>
                                    <div className="input-text-display read-only-text">
                                        {profileData.username} <Lock size={14} className="lock-icon" />
                                    </div>
                                </div>

                                <div className="form-row-custom">
                                    <label>Tên</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>

                                <div className="form-row-custom">
                                    <label>Email</label>
                                    <div className="input-text-display">
                                        {profileData.email.replace(/(^..)(.*)(@.*)/, '$1**$3')}
                                        <a href="#" className="link-change">Thay Đổi</a>
                                    </div>
                                </div>

                                <div className="form-row-custom">
                                    <label>Số điện thoại</label>
                                    <div className="input-text-display">
                                        {profileData.phone}
                                        <a href="#" className="link-change">Thay Đổi</a>
                                    </div>
                                </div>

                                <div className="form-row-custom">
                                    <label>Giới tính</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={profileData.gender === 'male'}
                                                onChange={handleChange}
                                            />
                                            <span>Nam</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={profileData.gender === 'female'}
                                                onChange={handleChange}
                                            />
                                            <span>Nữ</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="other"
                                                checked={profileData.gender === 'other'}
                                                onChange={handleChange}
                                            />
                                            <span>Khác</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-row-custom">
                                    <label>Ngày sinh</label>
                                    <div className="dob-selects">
                                        <select name="day" value={profileData.day} onChange={handleChange}>
                                            <option value="">Ngày</option>
                                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <select name="month" value={profileData.month} onChange={handleChange}>
                                            <option value="">Tháng</option>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select name="year" value={profileData.year} onChange={handleChange}>
                                            <option value="">Năm</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-custom submit-row">
                                    <label></label>
                                    <button className="save-btn">Lưu</button>
                                </div>
                            </div>

                            {/* Right Side: Avatar */}
                            <div className="profile-avatar-section">
                                <div className="avatar-wrapper">
                                    <img
                                        src={profileData.avatarUrl || defaultAvatar}
                                        alt="Avatar"
                                        onError={(e) => { e.target.src = defaultAvatar; }}
                                    />
                                </div>
                                <button className="select-image-btn">Chọn Ảnh</button>
                                <div className="avatar-note">
                                    <p>Dụng lượng file tối đa 1 MB</p>
                                    <p>Định dạng:.JPEG, .PNG</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
