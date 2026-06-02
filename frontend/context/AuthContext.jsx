

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { logoutUser } from '../services/api';
import { clearAdminSessionCookie, clearStoredUser, getStoredUser, setStoredUser } from '../services/authStorage';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);

    const login = useCallback((userData) => {
        setUser(userData);
        setStoredUser(userData);
    }, []);

    const logout = useCallback(async () => {
        await logoutUser();
        setUser(null);
        clearStoredUser();
        clearAdminSessionCookie();
    }, []);

    const updateUser = useCallback((updates) => {
        setUser((prevUser) => {
            if (!prevUser) return null;

            const updatedUser = {
                ...prevUser,
                ...updates,
                user_metadata: {
                    ...(prevUser.user_metadata || {}),
                    ...(updates.user_metadata || {})
                }
            };

            setStoredUser(updatedUser);
            return updatedUser;
        });
    }, []);

    const value = useMemo(() => ({ user, login, logout, updateUser }), [user, login, logout, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);