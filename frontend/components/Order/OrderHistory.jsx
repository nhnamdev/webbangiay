

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, DollarSign, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [activeStatus, setActiveStatus] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const data = await orderService.getOrdersByUser(user.email);
                setOrders(data);
            } catch (error) {
                console.error('Failed to load orders', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate, user]);

    const getStatusColor = (status) => {
        if (status === 'processing' || status === 'pending') return 'status-processing';
        if (status === 'cancelled') return 'status-cancelled';
        return 'status-success';
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'processing': return 'Đang xử lý';
            case 'pending': return 'Chờ thanh toán';
            case 'cancelled': return 'Đã hủy';
            default: return 'Thành công';
        }
    };

    const filterOrders = (status) => {
        if (status === 'all') return orders;
        if (status === 'processing') return orders.filter(o => ['processing', 'pending', 'paid'].includes(o.status));
        if (status === 'shipping') return orders.filter(o => o.status === 'shipping');
        if (status === 'success') return orders.filter(o => ['success', 'completed'].includes(o.status));
        if (status === 'cancelled') return orders.filter(o => o.status === 'cancelled');
        return orders;
    };

    const filteredOrders = filterOrders(activeStatus);

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'processing', label: 'Đang xử lý' },
        { id: 'shipping', label: 'Đang giao' },
        { id: 'success', label: 'Đã giao' },
        { id: 'cancelled', label: 'Đã hủy' },
    ];

    if (loading) return <div className="loading-spinner">Đang tải...</div>;

    return (
        <div className="order-history-container">
            <h2 className="page-title">Lịch sử đơn hàng</h2>

            <div className="order-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-item ${activeStatus === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveStatus(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="no-orders">
                    <Package size={48} />
                    <p>Không có đơn hàng nào.</p>
                    {activeStatus === 'all' && <button onClick={() => navigate('/')} className="shop-now-btn">Mua sắm ngay</button>}
                </div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map((order) => {
                        const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (Array.isArray(order.items) ? order.items : []);
                        return (<div key={order.id} className="order-card">
                            <div className="order-header">
                                <div className="order-id">
                                    <span className="label">Đơn hàng</span>
                                    <span className="value">#{order.id}</span>
                                </div>
                                <div className={`order-status ${getStatusColor(order.status)}`}>
                                    {order.status === 'processing' || order.status === 'pending' ? <Clock size={16} /> : <CheckCircle size={16} />}
                                    {getStatusText(order.status)}
                                </div>
                            </div>

                            <div className="order-body">
                                <div className="order-info">
                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <span>{new Date(order.created_at).toLocaleDateString('vi-VN')} {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="info-item">
                                        <DollarSign size={16} />
                                        <span className="price">{Number(order.total_amount).toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <div className="info-item">
                                        <span>{orderItems.length} sản phẩm</span>
                                    </div>
                                </div>
                                <div className="order-items-preview-visual">
                                    {orderItems.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="item-preview-visual" title={`${item.product_name} x${item.quantity}`}>
                                            <div className="preview-image-container">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.product_name} />
                                                ) : (
                                                    <div className="no-image-preview"><Package size={16} /></div>
                                                )}
                                                <span className="preview-qty">x{item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {orderItems.length > 4 && (
                                        <div className="more-items-badge">
                                            +{orderItems.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="order-footer">
                                <button className="view-detail-btn" onClick={() => navigate(`/orders/${order.id}`)}>
                                    Xem chi tiết <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>);
                    })}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
