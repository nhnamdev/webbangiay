import React from 'react';

const LoadingSpinner = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            width: '100%',
            gap: '16px',
            backgroundColor: 'transparent'
        }}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .spinner-ring {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(0, 0, 0, 0.05);
                    border-top: 3px solid #ff5722;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .spinner-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: #555;
                    animation: pulse 1.5s ease-in-out infinite;
                    font-family: 'Inter', sans-serif;
                }
            `}</style>
            <div className="spinner-ring"></div>
            <span className="spinner-text">Đang tải trang...</span>
        </div>
    );
};

export default LoadingSpinner;
