

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from '../../services/api';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    if (!isAuthenticated()) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
