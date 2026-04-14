import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileSidebar from './ProfileSidebar';
import './Profile.css';

const ProfileLayout = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="profile-container" style={{ textAlign: 'center', padding: '50px' }}>
                <p>Vui lòng đăng nhập để xem thông tin tài khoản.</p>
                <Link to="/login" className="btn-primary">Đăng nhập</Link>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-layout">
                {/* Sidebar */}
                <ProfileSidebar />

                {/* Main Content Area (Dynamic) */}
                <div className="profile-main-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ProfileLayout;
