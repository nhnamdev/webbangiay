

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import orderService from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeft,
    Truck,
    CheckCircle,
    Package,
    Store,
    MessageCircle,
    FileText
} from 'lucide-react';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('Cập nhật địa chỉ/sđt');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const data = await orderService.getOrderById(id);

                if (!data) {
                    setError('Không tìm thấy đơn hàng');
                    return;
                }

                const parseJSONRobust = (val, defaultVal = {}) => {
                    if (val == null) return defaultVal;
                    let temp = val;
                    if (typeof temp === 'string') {
                        try {
                            temp = JSON.parse(temp);
                            if (typeof temp === 'string') {
                                temp = JSON.parse(temp);
                            }
                        } catch (e) {
                            return defaultVal;
                        }
                    }
                    return temp || defaultVal;
                };

                const userEmail = user.email?.toLowerCase();
                const customer = parseJSONRobust(data.customer);
                const customerEmail = customer.email?.toLowerCase();

                if (userEmail !== customerEmail) {
                    setError('Bạn không có quyền xem đơn hàng này');
                    return;
                }

                setOrder(data);
            } catch (err) {
                console.error(err);
                setError('Lỗi khi tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, navigate, user]);

    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    const handleCloseModal = () => {
        setShowCancelModal(false);
        setCancelReason('Cập nhật địa chỉ/sđt');
    };

    const handleConfirmCancel = async () => {
        try {
            setLoading(true);
            await orderService.cancelOrder(order.id, cancelReason);
            // Reload order data
            const updatedOrder = await orderService.getOrderById(order.id);
            setOrder(updatedOrder);
            setShowCancelModal(false);
        } catch (err) {
            console.error(err);
            alert('Lỗi khi hủy đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (v) =>
        Number(v || 0).toLocaleString('vi-VN');

    const formatDateTime = (d) =>
        d ? new Date(d).toLocaleString('vi-VN') : '';

    if (loading) return <div className="loading-spinner">Đang tải...</div>;

    if (error)
        return (
            <div className="error-message">
                {error}
                <br />
                <button onClick={() => navigate('/orders')}>Quay lại</button>
            </div>
        );

    if (!order) return null;

    const parseJSONRobust = (val, defaultVal = {}) => {
        if (val == null) return defaultVal;
        let temp = val;
        if (typeof temp === 'string') {
            try {
                temp = JSON.parse(temp);
                if (typeof temp === 'string') {
                    temp = JSON.parse(temp);
                }
            } catch (e) {
                return defaultVal;
            }
        }
        return temp || defaultVal;
    };

    const orderCustomer = parseJSONRobust(order.customer);
    const items = parseJSONRobust(order.items, []);

    return (
        <div className="shopee-order-detail">
            <div className="shopee-container">

                {/* HEADER */}
                <div className="shopee-header-actions">
                    <button onClick={() => navigate('/orders')} className="shopee-back-btn">
                        <ArrowLeft size={18} /> TRỞ LẠI
                    </button>
                    <div className="shopee-order-meta">
                        <span>MÃ ĐƠN HÀNG: #{order.id}</span>
                        <span className="divider">|</span>
                        <span className="shopee-status-text">
                            {order.status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* STEPS */}
                {order.status !== 'cancelled' && (
                    <div className="shopee-stepper-card">
                        <div className="stepper-wrapper">
                            <div className="stepper-item completed">
                                <div className="step-counter"><FileText size={18} /></div>
                                <div className="step-name">Đặt hàng</div>
                            </div>
                            <div className={`stepper-item ${['processing', 'shipping', 'completed', 'success'].includes(order.status) ? 'completed' : ''}`}>
                                <div className="step-counter"><CheckCircle size={18} /></div>
                                <div className="step-name">Xác nhận</div>
                            </div>
                            <div className={`stepper-item ${['shipping', 'completed', 'success'].includes(order.status) ? 'completed' : ''}`}>
                                <div className="step-counter"><Truck size={18} /></div>
                                <div className="step-name">Vận chuyển</div>
                            </div>
                            <div className={`stepper-item ${['completed', 'success'].includes(order.status) ? 'completed' : ''}`}>
                                <div className="step-counter"><Package size={18} /></div>
                                <div className="step-name">Hoàn thành</div>
                                {['completed', 'success'].includes(order.status) && (
                                    <div className="step-time">
                                        {formatDateTime(order.updated_at || order.created_at)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ADDRESS */}
                <div className="shopee-info-group">
                    <div className="info-col address-col">
                        <div className="col-header">
                            <h3>Địa Chỉ Nhận Hàng</h3>
                        </div>
                        <div className="addr-content">
                            <div className="addr-name">{orderCustomer.fullName || 'Người nhận'}</div>
                            <div className="addr-phone">{'******' + (orderCustomer.phone?.slice(-4) || '8888')}</div>
                            <div className="addr-text">
                                {orderCustomer.address || 'Chưa có địa chỉ'}
                            </div>
                        </div>
                    </div>

                    <div className="info-col logistics-col">
                        <div className="col-header">
                            <h3>Thông Tin Vận Chuyển</h3>
                        </div>
                        <div className="logistics-timeline">
                            {['completed', 'shipping', 'processing', 'pending'].map((s) => {
                                const steps = {
                                    pending: { status: 'Đã đặt hàng', label: 'Đơn hàng đã được đặt' },
                                    processing: { status: 'Đã xác nhận', label: 'Người bán đang chuẩn bị hàng' },
                                    shipping: { status: 'Đang vận chuyển', label: 'Đơn hàng đã được giao cho ĐVVC' },
                                    completed: { status: 'Đã giao', label: 'Giao hàng thành công' },
                                    cancelled: { status: 'Đã hủy', label: 'Đơn hàng đã bị hủy' }
                                };

                                if (order.status === 'cancelled') {
                                    if (s === 'cancelled') {
                                        return (
                                            <div key={s} className="timeline-item latest">
                                                <div className="tl-dot"></div>
                                                <div className="tl-time">{formatDateTime(order.updated_at)}</div>
                                                <div className="tl-status">{steps[s].status}</div>
                                                <div className="tl-desc">{steps[s].label}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }
                                if (s === 'cancelled') return null;

                                const statusOrder = ['pending', 'processing', 'shipping', 'completed'];
                                const currentIdx = statusOrder.indexOf(order.status === 'success' ? 'completed' : order.status);
                                const stepIdx = statusOrder.indexOf(s);

                                if (stepIdx > currentIdx) return null;

                                const isLatest = stepIdx === currentIdx;
                                let time = order.created_at;
                                // Mock times just for visuals if not real
                                if (s === 'processing') time = new Date(new Date(order.created_at).getTime() + 3600000);
                                if (s === 'shipping') time = new Date(new Date(order.created_at).getTime() + 86400000);
                                if (s === 'completed') time = order.updated_at || new Date(new Date(order.created_at).getTime() + 172800000);

                                return (
                                    <div key={s} className={`timeline-item ${isLatest ? 'latest' : ''}`}>
                                        <div className="tl-dot"></div>
                                        <div className="tl-time">{formatDateTime(time)}</div>
                                        <div className={`tl-status ${s === 'completed' && isLatest ? 'success-text' : ''}`}>
                                            {steps[s].status}
                                        </div>
                                        <div className={`tl-desc ${s === 'completed' && isLatest ? 'success-text' : ''}`}>
                                            {steps[s].label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* PRODUCTS */}
                <div className="shopee-product-card">
                    <div className="shop-header">
                        <span className="shop-badge">Yêu thích</span>
                        <span className="shop-name">ZestFoot Official</span>
                        <button className="shop-btn-action"><MessageCircle size={14} /> Chat</button>
                        <button className="shop-btn-action"><Store size={14} /> Xem Shop</button>
                    </div>

                    {items.map((item, idx) => (
                        <div key={idx} className="order-product-item">
                            <div className="p-img-wrapper">
                                <img src={item.image || ''} alt="" />
                            </div>
                            <div className="p-info">
                                <div className="p-name">{item.productName || item.product_name}</div>
                                <div className="p-variant">Phân loại hàng: {item.size || 'Mặc định'}</div>
                                <div className="p-qty">x{item.quantity}</div>
                            </div>
                            <div className="p-price">
                                {item.oldPrice && <span className="old-price">{formatPrice(item.oldPrice)}₫</span>}
                                <span className="curr-price">{formatPrice(item.price)}₫</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SUMMARY */}
                <div className="shopee-summary-section">
                    <div className="summary-row">
                        <span className="s-label">Tổng tiền hàng</span>
                        <span className="s-value">{formatPrice(order.totalAmount ?? order.total_amount)}₫</span>
                    </div>
                    <div className="summary-row">
                        <span className="s-label">Phí vận chuyển</span>
                        <span className="s-value">16.500₫</span>
                    </div>
                    <div className="summary-row">
                        <span className="s-label">Giảm giá phí vận chuyển</span>
                        <span className="s-value discount">-15.000₫</span>
                    </div>
                    <div className="summary-row">
                        <span className="s-label">Thành tiền</span>
                        <span className="s-value big-total">{formatPrice((order.totalAmount ?? order.total_amount) + 1500)}₫</span>
                    </div>
                </div>

                {/* Footer Actions */}
                {['pending', 'processing'].includes(order.status) && (
                    <div className="shopee-footer-actions">
                        <button className="shopee-btn cancel" onClick={handleCancelClick}>Hủy Đơn Hàng</button>
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Chọn lý do hủy</h3>
                            <div className="cancel-reasons">
                                {['Cập nhật địa chỉ/sđt', 'Thay đổi mã giảm giá', 'Không còn nhu cầu', 'Lý do khác'].map(r => (
                                    <label key={r} className="reason-option">
                                        <input
                                            type="radio"
                                            name="cancelReason"
                                            value={r}
                                            checked={cancelReason === r}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                        />
                                        <span>{r}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={handleCloseModal}>Đóng</button>
                                <button className="modal-btn primary" onClick={handleConfirmCancel}>Đồng ý</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OrderDetail;
