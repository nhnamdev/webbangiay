

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Addresses.css';

const Addresses = () => {
    const { user } = useAuth();
    const [showAddForm, setShowAddForm] = useState(false);

    const [addresses, setAddresses] = useState([
        {
            id: 1,
            isDefault: true,
            firstName: user?.firstName || 'Lê',
            lastName: user?.lastName || 'Khang',
            company: '',
            address1: '123 Đường ABC',
            address2: '',
            city: 'TP HCM',
            country: 'Vietnam',
            zip: '70000',
            phone: '0901234567'
        }
    ]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        country: 'Vietnam',
        zip: '',
        phone: '',
        isDefault: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleAddForm = () => {
        setShowAddForm(!showAddForm);
    };

    return (
        <div className="addresses-container">
            <div className="addresses-header">
                <h1>Địa chỉ</h1>
                <Link to="/profile" className="back-link">Quay lại Chi tiết tài khoản</Link>
            </div>

            {!showAddForm ? (
                // List View
                <div className="addresses-list">
                    <button className="add-new-btn" onClick={toggleAddForm}>Thêm Địa Chỉ Mới</button>

                    <div className="address-cards">
                        {addresses.map(addr => (
                            <div key={addr.id} className="address-card">
                                {addr.isDefault && <div className="default-badge">Mặc định</div>}
                                <div className="address-info">
                                    <p><strong>Họ tên:</strong> {addr.firstName} {addr.lastName}</p>
                                    <p><strong>Công ty:</strong> {addr.company}</p>
                                    <p><strong>Địa chỉ 1:</strong> {addr.address1}</p>
                                    <p><strong>Địa chỉ 2:</strong> {addr.address2}</p>
                                    <p><strong>Thành phố:</strong> {addr.city}</p>
                                    <p><strong>Quốc gia:</strong> {addr.country}</p>
                                    <p><strong>Zip:</strong> {addr.zip}</p>
                                    <p><strong>Điện thoại:</strong> {addr.phone}</p>
                                </div>
                                <div className="address-actions">
                                    <button className="submit-btn">Chỉnh Sửa</button>
                                    <button className="cancel-btn">Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // Add/Edit Form
                <div className="address-form-container">
                    <h2>Thêm địa chỉ mới</h2>
                    <form className="address-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Tên</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Họ</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Công ty</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ 1</label>
                            <input
                                type="text"
                                name="address1"
                                value={formData.address1}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ 2</label>
                            <input
                                type="text"
                                name="address2"
                                value={formData.address2}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Quốc gia/khu vực</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                >
                                    <option value="Vietnam">Vietnam</option>
                                    <option value="United States">United States</option>
                                    {/* Add more options as needed */}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Thành phố</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Mã bưu chính/mã ZIP</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-checkbox">
                            <input
                                type="checkbox"
                                id="isDefault"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="submit-btn">Thêm Địa Chỉ</button>
                            <button type="button" className="cancel-btn" onClick={toggleAddForm}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Addresses;
