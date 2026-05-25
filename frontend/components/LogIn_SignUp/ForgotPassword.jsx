

// eslint-disable-next-line no-unused-vars
import React from 'react';
import Navbar from '../Navbar/Navbar.jsx';
import Footer from '../Footer/Footer.jsx';
import './Auth.css';
import CategoryBar from "../CategoryBar/CategoryBar.jsx";


const ForgotPassword = () => {
    return (
        <>
            <Navbar/>
            <CategoryBar />
            <div className="auth-wrapper">
                <div className="auth-container">
                    {/* Cột Trái */}
                    <div className="auth-left">
                        <div>
                            <h2 className="auth-title">ĐẶT LẠI MẬT KHẨU</h2>
                            <p className="auth-desc">
                                Chúng tôi sẽ nhanh chóng gửi email hướng dẫn chi tiết, giúp bạn đặt lại mật khẩu một cách dễ dàng và thuận tiện.
                            </p>
                        </div>
                        <div className="auth-image">
                            {/* Thay src bằng biến import ảnh hoặc link ảnh thật */}
                            <img
                                src="/pic1.jpg"
                                alt="Welcome to HKT-SHOES"/>
                        </div>
                    </div>

                    {/* Cột Phải - Form */}
                    <div className="auth-right">
                        <form>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-input"/>
                            </div>
                            <div className="btn-container">
                                <button type="submit" className="auth-btn">Gửi</button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => window.location.href = '/login'}  >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default ForgotPassword;