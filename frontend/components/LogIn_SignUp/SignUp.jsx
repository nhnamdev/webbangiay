

import React, {useState} from 'react';
import Navbar from '../Navbar/Navbar.jsx';
import Footer from '../Footer/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';
import './Auth.css';
import CategoryBar from "../CategoryBar/CategoryBar.jsx";

const SignUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate cơ bản
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        // Gọi API đăng ký
        const result = await registerUser(formData);

        if (result.success) {
            alert("Tạo tài khoản thành công!");
            navigate('/login'); // Chuyển hướng sang trang đăng nhập
        } else {
            setError(result.message);
        }
    };

    return (
        <>
            <Navbar/>
            <CategoryBar />
            <div className="auth-wrapper">
                <div className="auth-container">
                    {/* Cột Trái */}
                    <div className="auth-left">
                        <div>
                            <h2 className="auth-title">TẠO TÀI KHOẢN</h2>
                            <p className="auth-desc">
                                Tạo tài khoản mới ngay để trải nghiệm mua sắm dễ dàng và nhận ngay những ưu đãi đặc biệt
                                dành riêng cho bạn!
                            </p>
                        </div>
                        <div className="auth-image">
                            <img
                                src="/pic1.jpg"
                                alt="Welcome to HKT-SHOES"/>
                        </div>
                    </div>

                    {/* Cột Phải - Form */}
                    <div className="auth-right">
                        <form onSubmit={handleSubmit}>
                            {/* Hiển thị lỗi nếu có */}
                            {error && <p style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

                            <div className="form-group">
                                <label>Tên</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-input"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Họ</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-input"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input
                                    type="date"
                                    name="dob"
                                    className="form-input"
                                    placeholder="dd/mm/yyyy"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    onChange={handleChange}
                                />
                                <small style={{color: '#999', fontSize: '0.8rem', marginTop: '5px', display: 'block'}}>
                                    Bao gồm ít nhất một chữ cái viết hoa.
                                </small>
                            </div>

                            <button type="submit" className="auth-btn">Tạo Ngay</button>

                            <div className="auth-switch">
                                <span>Đã có tài khoản? </span>
                                <a href="/login">Đăng nhập</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default SignUp;