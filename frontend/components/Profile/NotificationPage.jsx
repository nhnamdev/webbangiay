

import React, { useState, useEffect } from 'react';
import { Package, Tag, Info, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NotificationPage.css';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { get } from '../../services/http';

const parseJSON = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try { return JSON.parse(raw); } catch { return null; }
};

const NotificationPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                const orders = await orderService.getOrdersByUser(user.email).catch(() => []);
                const vouchers = user?.id ? await get(`/users/${user.id}/vouchers`).catch(() => []) : [];

                const orderNotifs = (orders || []).map(order => {
                    let title;
                    let content;
                    switch (order.status) {
                        case 'pending':
                            title = 'Đơn hàng đang chờ xử lý';
                            content = `Đơn hàng #${order.id} đang được xử lý.`;
                            break;
                        case 'processing':
                        case 'shipping':
                        case 'shipped':
                            title = 'Đơn hàng đang vận chuyển';
                            content = `Đơn hàng #${order.id} đã được giao cho đơn vị vận chuyển.`;
                            break;
                        case 'success':
                        case 'completed':
                        case 'delivered':
                            title = 'Giao hàng thành công';
                            content = `Đơn hàng #${order.id} đã giao thành công.`;
                            break;
                        case 'cancelled':
                            title = 'Đơn hàng đã bị hủy';
                            content = `Đơn hàng #${order.id} đã hủy.`;
                            break;
                        default:
                            title = 'Cập nhật đơn hàng';
                            content = `Trạng thái mới cho đơn hàng #${order.id}.`;
                    }

                    const customer = parseJSON(order.customerJson);
                    const firstItem = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0] : null;
                    const image = firstItem?.product?.image || customer?.items?.[0]?.image || null;

                    return {
                        id: `order-${order.id}`,
                        type: 'order',
                        title,
                        content,
                        date: order.createdAt,
                        isRead: true,
                        image,
                        status: order.status,
                        originalData: order,
                    };
                });

                const voucherNotifs = (vouchers || []).map(voucher => ({
                    id: `voucher-${voucher.id}`,
                    type: 'promotion',
                    title: 'Bạn nhận được Voucher mới',
                    content: `Mã: ${voucher.code} - Giảm: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discountAmount || 0)}`,
                    date: voucher.createdAt || new Date().toISOString(),
                    isRead: false,
                    image: null,
                    originalData: voucher,
                }));

                const allNotifs = [...orderNotifs, ...voucherNotifs].sort((a, b) => new Date(b.date) - new Date(a.date));
                setNotifications(allNotifs);
            } catch (error) {
                console.error('Error fetching notifications:', error.message || error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleItemClick = (notif) => {
        if (notif.type === 'order') {
            navigate('/orders');
        } else if (notif.type === 'promotion') {
            navigate('/checkout');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <Package size={24} color="#26aa99" />;
            case 'promotion': return <Tag size={24} color="#ee4d2d" />;
            case 'info': return <Info size={24} color="#1890ff" />;
            default: return <BellOff size={24} color="#888" />;
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải thông báo...</div>;

    return (
        <div className="notification-page">
            <div className="notification-header">
                <h3>THÔNG BÁO</h3>
                <button className="mark-all-read">Đánh dấu đã đọc tất cả</button>
            </div>

            <div className="notification-list">
                {notifications.length > 0 ? (
                    notifications.map(item => (
                        <div
                            key={item.id}
                            className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="notif-image-container">
                                {item.image ? (
                                    <img src={item.image} alt="Thumbnail" className="notif-image" />
                                ) : (
                                    getIcon(item.type)
                                )}
                            </div>
                            <div className="notif-content">
                                <div className="notif-title">{item.title}</div>
                                <div className="notif-description">{item.content}</div>
                                <div className="notif-time">{new Date(item.date).toLocaleString('vi-VN')}</div>
                            </div>
                            {item.type === 'order' && (
                                <button className="notif-action-btn">
                                    {(item.status === 'success' || item.status === 'completed' || item.status === 'delivered') ? 'Đánh giá' : 'Xem chi tiết'}
                                </button>
                            )}
                            {item.type === 'promotion' && (
                                <button className="notif-action-btn">
                                    Dùng ngay
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-notification">
                        <BellOff size={48} className="empty-icon" />
                        <p>Chưa có thông báo nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPage;
