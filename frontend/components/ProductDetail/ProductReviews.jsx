

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProductReviews.css';
import { Star, Camera } from 'lucide-react';

const ProductReviews = () => {
    const { user } = useAuth();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');

    // Reviews list state
    const [reviews, setReviews] = useState([]);

    // Load reviews from local storage on mount
    useEffect(() => {
        const storedReviews = localStorage.getItem('productReviews');
        if (storedReviews) {
            try {
                setReviews(JSON.parse(storedReviews));
            } catch (error) {
                console.error("Failed to parse reviews:", error);
            }
        }
    }, []);

    // Pre-fill user data when user is logged in
    useEffect(() => {
        if (user) {
            let fullName = '';
            if (user.user_metadata?.full_name) {
                fullName = user.user_metadata.full_name;
            } else if (user.user_metadata?.first_name || user.user_metadata?.last_name) {
                fullName = [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(' ');
            } else {
                fullName = user.user_metadata?.username || user.email?.split('@')[0] || '';
            }

            setDisplayName(fullName);
            setEmail(user.email || '');
        }
    }, [user]);

    const toggleForm = () => {
        setIsFormVisible(!isFormVisible);
    };

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Vui lòng chọn số sao đánh giá!');
            return;
        }
        if (!title.trim() || !content.trim() || !displayName.trim()) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const newReview = {
            id: Date.now(),
            rating,
            title,
            content,
            displayName,
            email,
            date: new Date().toLocaleDateString('vi-VN'),
            avatar: user?.user_metadata?.avatar_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        };

        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem('productReviews', JSON.stringify(updatedReviews));

        // Reset form but keep user info if logged in
        setTitle('');
        setContent('');
        setRating(0);
        setIsFormVisible(false); // Close form after submit
    };

    return (
        <div className="product-reviews-container">
            <h2 className="reviews-title">ĐÁNH GIÁ TỪ KHÁCH HÀNG</h2>

            <div className="reviews-summary">
                <div className="stars-display">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`star-icon-empty ${calculateAverageRating(reviews) >= star ? 'filled-summary' : ''}`} />
                    ))}
                    <span style={{ marginLeft: '10px', fontSize: '14px', color: '#333' }}>
                        {reviews.length > 0 ? `${reviews.length} đánh giá` : 'Hãy là người đầu tiên viết đánh giá'}
                    </span>
                </div>

                <button className="cancel-review-btn-black" onClick={toggleForm}>
                    {isFormVisible ? 'Hủy đánh giá' : 'Viết đánh giá'}
                </button>
            </div>

            {isFormVisible && (
                <div className="review-form-container">
                    <div className="review-form">
                        <h3 className="form-title">Viết đánh giá</h3>
                        <p className="form-subtitle">Đánh giá</p>

                        <div className="form-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`star-icon-large ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>

                        <div className="form-group">
                            <label>Tiêu đề Đánh giá <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                placeholder="Đặt tiêu đề cho đánh giá của bạn"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nội dung đánh giá <span style={{ color: 'red' }}>*</span></label>
                            <textarea
                                placeholder="Bắt đầu viết ở đây..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Hình ảnh/Video (tùy chọn)</label>
                            <div className="media-upload-box">
                                <span className="upload-icon">?</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tên hiển thị <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                placeholder="Tên hiển thị"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ email</label>
                            <input
                                type="email"
                                placeholder="Địa chỉ email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <p className="form-disclaimer">
                            Cảm ơn bạn đã dành thời gian chia sẻ trải nghiệm của mình. Ý kiến của bạn rất quý giá với chúng tôi!
                        </p>

                        <div className="form-actions">
                            <button className="btn-cancel" onClick={toggleForm}>Hủy đánh giá</button>
                            <button className="btn-submit" onClick={handleSubmit}>Gửi Đánh giá</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
                {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                        <div className="review-header">
                            <div className="review-avatar-container">
                                <img src={review.avatar} alt="avatar" className="review-avatar-img" />
                            </div>
                            <div className="review-user-info">
                                <div className="review-author-name">{review.displayName}</div>
                                <div className="review-date">{review.date}</div>
                            </div>
                        </div>
                        <div className="review-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={16} className={star <= review.rating ? 'filled-summary' : 'star-icon-empty'} fill={star <= review.rating ? "#FFD700" : "none"} color={star <= review.rating ? "#FFD700" : "#ccc"} />
                            ))}
                        </div>
                        <h4 className="review-title">{review.title}</h4>
                        <p className="review-content">{review.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper to calculate average rating
const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(total / reviews.length);
};

export default ProductReviews;
