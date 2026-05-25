

import React, { useState, useEffect } from 'react';
import { Package, Tag, Info, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NotificationPage.css';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { supabase } from '../../services/supabaseClient';

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

                // 1. Fetch Orders
                // Note: orderService.getOrdersByUser returns a promise
                const orders = await orderService.getOrdersByUser(user.email);

                // 2. Fetch Vouchers (from games/rewards)
                const { data: vouchers } = await supabase
                    .from('user_vouchers')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                // 3. Transform Orders to Notifications
                const orderNotifs = (orders || []).map(order => {
                    let title, content;
                    // Logic to text
                    switch (order.status) {
                        case 'pending':
                            title = 'Đơn hàng đang chờ xử lý';
                            content = `Đơn hàng #${order.id} đang được xử lý.`;
                            break;
                        case 'processing':
                        case 'shipping':
                            title = 'Đơn hàng đang vận chuyển';
                            content = `Đơn hàng #${order.id} đã được giao cho đơn vị vận chuyển.`;
                            break;
                        case 'success':
                        case 'completed':
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

                    // Get first image
                    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                    const image = firstItem ? firstItem.image : null;

                    return {
                        id: `order-${order.id}`,
                        type: 'order',
                        title,
                        content,
                        date: order.created_at, // ISO string
                        isRead: true, // Assuming read for now, or could implementing local storage tracking
                        image,
                        status: order.status,
                        originalData: order
                    };
                });

                // 4. Transform Vouchers to Notifications
                const voucherNotifs = (vouchers || []).map(voucher => {
                    return {
                        id: `voucher-${voucher.id}`,
                        type: 'promotion',
                        title: 'Bạn nhận được Voucher mới',
                        content: `Mã: ${voucher.code} - Giảm: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discount_amount)}`,
                        date: voucher.created_at || new Date().toISOString(), // Fallback if created_at missing
                        isRead: false,
                        image: null,
                        originalData: voucher
                    };
                });

                // 5. Merge and Sort
                const allNotifs = [...orderNotifs, ...voucherNotifs].sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });

                setNotifications(allNotifs);

            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleItemClick = (notif) => {
        if (notif.type === 'order') {
            navigate('/orders'); // Or /orders/:id
        } else if (notif.type === 'promotion') {
            navigate('/checkout'); // Or wherever vouchers are useful
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
                                    {(item.status === 'success' || item.status === 'completed') ? 'Đánh giá' : 'Xem chi tiết'}
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
