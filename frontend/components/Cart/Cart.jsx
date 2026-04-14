

// src/components/Cart/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

import { Trash2, Minus, Plus } from 'lucide-react';
import { selectCartItems, removeFromCart, updateQuantity } from '../../redux/cartSlice';
import './Cart.css';

const Cart = () => {
    const cartItems = useSelector(selectCartItems);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. State lưu các key của sản phẩm được chọn (format: "productId-size")
    const [selectedItems, setSelectedItems] = useState([]);

    // Helper: Tạo key duy nhất cho mỗi item
    const getItemKey = (item) => `${item.product.id}-${item.size}`;

    // 2. Tự động chọn tất cả khi mới vào giỏ (UX mặc định)
    useEffect(() => {
        if (cartItems.length > 0) {
            const allKeys = cartItems.map(getItemKey);
            setSelectedItems(allKeys);
        }
    }, [cartItems.length]);

    // Logic chọn/bỏ chọn từng món
    const toggleSelectItem = (key) => {
        if (selectedItems.includes(key)) {
            setSelectedItems(prev => prev.filter(k => k !== key));
        } else {
            setSelectedItems(prev => [...prev, key]);
        }
    };

    // Logic chọn tất cả
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(getItemKey));
        } else {
            setSelectedItems([]);
        }
    };

    // 3. Tính tổng tiền CHỈ cho các sản phẩm ĐÃ CHỌN
    const selectedTotal = cartItems.reduce((total, item) => {
        if (selectedItems.includes(getItemKey(item))) {
            const price = item.product.isSale ? item.product.salePrice : item.product.price;
            return total + (price * item.quantity);
        }
        return total;
    }, 0);

    // Xử lý khi bấm thanh toán
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
            return;
        }

        // Lọc ra các object sản phẩm thực tế từ danh sách key đã chọn
        const itemsToCheckout = cartItems.filter(item =>
            selectedItems.includes(getItemKey(item))
        );

        // Truyền danh sách này sang Checkout
        navigate('/checkout', {
            state: {
                fromCart: true,
                selectedItems: itemsToCheckout // <-- Quan trọng: Gửi danh sách đã chọn
            }
        });
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-container empty-cart">
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>Hãy chọn những sản phẩm yêu thích để mua sắm nhé!</p>
                <Link to="/" className="continue-shopping-btn">Tiếp tục mua sắm</Link>
            </div>
        );
    }

    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    return (
        <div className="cart-container">
            <h1 className="cart-title">Giỏ Hàng</h1>

            <div className="cart-content">
                <div className="cart-items">
                    {/* Header: Checkbox chọn tất cả */}
                    <div style={{ padding: '10px 0', borderBottom: '1px solid #eee', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="selectAll"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="selectAll" style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            Chọn tất cả ({cartItems.length} sản phẩm)
                        </label>
                    </div>

                    {cartItems.map((item) => {
                        const price = item.product.isSale ? item.product.salePrice : item.product.price;
                        const itemKey = getItemKey(item);
                        const isSelected = selectedItems.includes(itemKey);

                        return (
                            <div key={itemKey} className={`cart-item ${isSelected ? 'selected-item-bg' : ''}`} style={{ opacity: isSelected ? 1 : 0.6 }}>
                                {/* Checkbox từng item */}
                                <div style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelectItem(itemKey)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                </div>

                                <Link to={`/products/${item.product.id}`}>
                                    <img src={item.product.image} alt={item.product.name} />
                                </Link>
                                <div className="cart-item-details">
                                    <Link to={`/products/${item.product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="item-name">{item.product.name}</div>
                                    </Link>
                                    <div className="item-meta">
                                        Size: {item.size} | {item.product.brand}
                                    </div>
                                    <div className="item-price">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                                    </div>

                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button
                                                className="qty-btn"
                                                onClick={() => dispatch(updateQuantity({ productId: item.product.id, size: item.size, newQuantity: item.quantity - 1 }))}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="qty-display">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => dispatch(updateQuantity({ productId: item.product.id, size: item.size, newQuantity: item.quantity + 1 }))}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            className="remove-btn"
                                            onClick={() => dispatch(removeFromCart({ productId: item.product.id, size: item.size }))}
                                            title="Xóa sản phẩm"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="cart-summary">
                    <div className="summary-title">Tổng đơn hàng</div>
                    <div className="summary-row">
                        <span>Đã chọn</span>
                        <span>{selectedItems.length} sản phẩm</span>
                    </div>
                    <div className="summary-row">
                        <span>Tạm tính</span>
                        {/* Hiển thị selectedTotal thay vì total của cả giỏ */}
                        <span style={{ fontWeight: 'bold', color: '#333' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTotal)}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span>Vận chuyển</span>
                        <span>Miễn phí</span>
                    </div>
                    <div className="summary-total summary-row">
                        <span>Thành tiền</span>
                        <span style={{ color: '#d0021b' }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTotal)}
                        </span>
                    </div>

                    <button
                        className="pay-btn"
                        onClick={handleCheckout}
                        disabled={selectedItems.length === 0}
                        style={{
                            backgroundColor: selectedItems.length === 0 ? '#ccc' : '#000',
                            cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        MUA HÀNG ({selectedItems.length})
                    </button>

                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <Link to="/" style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'underline' }}>
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
