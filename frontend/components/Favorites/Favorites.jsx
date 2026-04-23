

// src/components/Favorites/Favorites.jsx
import React, { useState, useEffect } from 'react';
// import { useWishlist } from '../../context/WishlistContext';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist, selectWishlistItems } from '../../redux/wishlistSlice';
import { addToCart } from '../../redux/cartSlice';
import { useAuth } from '../../context/AuthContext';
import { getAllProducts } from '../../services/api';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import './Favorites.css';

const Favorites = () => {
    // const { wishlist, removeFromWishlist } = useWishlist();
    const wishlist = useSelector(selectWishlistItems);
    const dispatch = useDispatch();
    const { user } = useAuth(); // Needed for login check
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavoriteProducts = async () => {
            if (wishlist.length === 0) {
                setFavoriteProducts([]);
                setLoading(false);
                return;
            }

            try {
                // Fetch all products
                const allProducts = await getAllProducts();

                // Filter products that are in wishlist
                const favorites = allProducts.filter(product =>
                    wishlist.includes(product.id)
                );

                setFavoriteProducts(favorites);
            } catch (error) {
                console.error('Error fetching favorite products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteProducts();
    }, [wishlist]);

    const handleAddToCart = (product) => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }
        // Default to first available size
        const defaultSize = product.sizes?.[0] || '40';
        dispatch(addToCart({ product, size: defaultSize, quantity: 1 }));
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    const handleRemoveFavorite = (productId) => {
        if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) {
            dispatch(toggleWishlist(productId));
        }
    };

    if (loading) {
        return (
            <div className="favorites-container">
                <div className="favorites-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    if (favoriteProducts.length === 0) {
        return (
            <div className="favorites-container">
                <div className="favorites-empty">
                    <Heart size={80} className="empty-heart-icon" />
                    <h2>Chưa có sản phẩm yêu thích</h2>
                    <p>Hãy thêm những sản phẩm bạn yêu thích để dễ dàng theo dõi và mua sắm sau!</p>
                    <Link to="/" className="continue-shopping-btn">
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-container">
            <div className="favorites-header">
                <h1>Sản phẩm yêu thích</h1>
                <p className="favorites-count">{favoriteProducts.length} sản phẩm</p>
            </div>

            <div className="favorites-grid">
                {favoriteProducts.map((product) => (
                    <div key={product.id} className="favorite-card">
                        <button
                            className="remove-favorite-btn"
                            onClick={() => handleRemoveFavorite(product.id)}
                            title="Xóa khỏi yêu thích"
                        >
                            <Trash2 size={18} />
                        </button>

                        <Link to={`/products/${product.id}`} className="favorite-image-link">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="favorite-image"
                            />
                            {product.isSale && (
                                <span className="sale-badge">SALE</span>
                            )}
                        </Link>

                        <div className="favorite-info">
                            <Link to={`/products/${product.id}`} className="favorite-name">
                                {product.name}
                            </Link>
                            <div className="favorite-brand">{product.brand}</div>

                            <div className="favorite-price">
                                {product.isSale ? (
                                    <>
                                        <span className="price-sale">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(product.salePrice)}
                                        </span>
                                        <span className="price-original">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(product.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="price-regular">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(product.price)}
                                    </span>
                                )}
                            </div>

                            <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(product)}
                            >
                                <ShoppingCart size={18} />
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Favorites;

// fix bug them bot san pham yeu thich
