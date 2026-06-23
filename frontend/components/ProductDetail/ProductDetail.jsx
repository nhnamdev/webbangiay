// src/components/ProductDetail/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { getProductById } from '../../services/api';
import './ProductDetail.css';
import ProductReviews from './ProductReviews';
import { Truck, RefreshCw, ShieldCheck, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toggleWishlist, selectIsInWishlist } from '../../redux/wishlistSlice';
import { useAuth } from '../../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const dispatch = useDispatch();
    const { user } = useAuth();
    const isWishlisted = useSelector((state) => product ? selectIsInWishlist(state, product.id) : false);

    const sizes = ['US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11'];

    useEffect(() => {
        const fetchProduct = async() => {
            setLoading(true);
            const data = await getProductById(id);
            setProduct(data);
            setLoading(false);
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }
        if (!selectedSize) {
            alert('Vui lòng chọn size!');
            return;
        }
        dispatch(addToCart({ product, size: selectedSize, quantity: 1 }));
        alert("Đã thêm vào giỏ hàng!");
    };

    const handleBuyNow = () => {
        if (!user) {
            alert('Vui lòng đăng nhập để mua hàng!');
            return;
        }
        if (!selectedSize) {
            alert('Vui lòng chọn size!');
            return;
        }

        const buyNowItem = { product, size: selectedSize, quantity: 1 };
        dispatch(addToCart(buyNowItem));
        navigate('/checkout', {
            state: {
                fromCart: true,
                selectedItems: [buyNowItem],
            },
        });
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
    if (!product) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>Sản phẩm không tồn tại</h2></div>;

    const discount = product.isSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
    const currentPrice = product.isSale ? product.salePrice : product.price;

    return (
        <div className="product-detail-page">
            <div className="section-container">
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link> /{' '}
                    <Link to={`/collections/${product.brand?.toLowerCase()}`}>{product.brand?.toUpperCase()}</Link> /{' '}
                    <span>{product.name}</span>
                </div>

                <div className="product-main-content">
                    <div className="product-gallery">
                        <div className="main-image-wrapper">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.image} alt={product.name} className="main-image" />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', border: '1px solid #333', cursor: 'pointer' }} />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', border: '1px solid #ddd', opacity: 0.6, cursor: 'pointer' }} />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', border: '1px solid #ddd', opacity: 0.6, cursor: 'pointer' }} />
                        </div>
                    </div>

                    <div className="product-info">
                        <Link to={`/collections/${product.brand?.toLowerCase()}`} className="product-brand">
                            {product.brand}
                        </Link>
                        <h1 className="product-title">{product.name}</h1>
                        <div className="product-sku">Mã sản phẩm: {product.id}00 XYZ</div>

                        <div className="product-price-wrapper">
                            <span className="current-price">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                            </span>
                            {product.isSale && (
                                <>
                                    <span className="original-price">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </span>
                                    <span className="discount-tag text-red">-{discount}%</span>
                                </>
                            )}
                            <span className="tax-note">(Đã bao gồm VAT)</span>
                        </div>

                        <div className="size-selector">
                            <span className="size-label">Kích thước(US): {selectedSize || 'Chọn size'}</span>
                            <div className="size-grid">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}>
                                Hướng dẫn chọn size
                            </div>
                        </div>

                        <div className="product-actions">
                            <button className="action-btn add-cart-btn" onClick={handleAddToCart}>
                                THÊM VÀO GIỎ
                            </button>
                            <button
                                className="action-btn buy-now-btn"
                                onClick={handleBuyNow}
                            >
                                MUA NGAY
                            </button>

                            <button
                                className={`action-btn wishlist-btn ${product && isWishlisted ? 'active' : ''}`}
                                onClick={() => product && dispatch(toggleWishlist(product.id))}
                            >
                                <Heart className={`heart-icon ${product && isWishlisted ? 'filled' : ''}`} />
                            </button>
                        </div>

                        <div className="policy-list">
                            <div className="policy-item">
                                <Truck className="policy-icon" />
                                <span>Miễn phí vận chuyển toàn quốc cho đơn hàng từ 1.000.000 đ</span>
                            </div>
                            <div className="policy-item">
                                <RefreshCw className="policy-icon" />
                                <span>Đổi trả dễ dàng trong 7 ngày (với sản phẩm nguyên giá)</span>
                            </div>
                            <div className="policy-item">
                                <ShieldCheck className="policy-icon" />
                                <span>Hàng chính hãng 100% - Bảo hành uy tín</span>
                            </div>
                        </div>

                        <div className="product-description">
                            <h3 style={{ textTransform: 'uppercase', fontSize: '1.2rem', marginBottom: '10px' }}>Mô tả sản phẩm</h3>
                            <p style={{ lineHeight: '1.6', color: '#555' }}>
                                {product.name} là mẫu giày được yêu thích nhất năm nay với thiết kế thời thượng và công nghệ đệm êm ái.
                                Sản phẩm phù hợp cho cả đi chơi và tập luyện nhẹ nhàng.
                                <br />
                                <br />
                                Chất liệu cao cấp, độ bền vượt trội. Phối màu tinh tế dễ dàng kết hợp với nhiều trang phục.
                            </p>
                        </div>
                    </div>
                </div>

                <ProductReviews />
            </div>
        </div>
    );
};

export default ProductDetail;
