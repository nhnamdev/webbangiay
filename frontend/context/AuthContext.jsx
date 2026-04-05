

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser } from '../services/api';
import PropTypes from 'prop-types'; // Import PropTypes để fix lỗi kiểm tra kiểu dữ liệu

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Kiểm tra LocalStorage khi load trang để giữ trạng thái đăng nhập
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user:", error);
                localStorage.removeItem('currentUser');
            }
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        localStorage.removeItem('currentUser');
        document.cookie = "admin-session=; path=/; max-age=0";
    };

    const updateUser = (updates) => {
        setUser((prevUser) => {
            if (!prevUser) return null;

            // Deep merge logic for user_metadata
            const updatedUser = {
                ...prevUser,
                ...updates,
                user_metadata: {
                    ...(prevUser.user_metadata || {}),
                    ...(updates.user_metadata || {})
                }
            };

            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Khai báo kiểu dữ liệu cho props children để tránh lỗi ESLint
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);