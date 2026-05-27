
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.css';

const LoginPromptModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="login-prompt-overlay">
            <div className="login-prompt-modal">
                <button className="login-prompt-close" onClick={onClose}>&times;</button>
                <div className="login-prompt-icon">🔒</div>
                <h3>Yêu cầu đăng nhập</h3>
                <p>Bạn vui lòng đăng nhập hoặc đăng ký để truy cập mục quà tặng và các trò chơi.</p>
                <div className="login-prompt-actions">
                    <button className="login-prompt-btn primary" onClick={() => { navigate('/login'); }}>
                        Đăng nhập
                    </button>
                    <button className="login-prompt-btn secondary" onClick={() => { navigate('/register'); }}>
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;
