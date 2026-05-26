import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { formatCurrency } from '../../utils/format.js';
import { useLanguage } from '../../context/LanguageContext';

const ProductCard = ({ product }) => {
    const { t } = useLanguage();
    return (
        <Link
            href={`/products/${product.id}`}
            className="product-card"
            data-aos="fade-up"
        >
            <div className="product-image-container">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                />

                {/* 12.12 Overlay if needed - user sample had it */}

                <div className="badge-container">
                    {Array.isArray(product.badges) && product.badges.map((b, i) => (
                        <span key={i} className={`badge ${String(b).toLowerCase()}`}>{b}</span>
                    ))}
                    {!Array.isArray(product.badges) && product.isNew && <span className="badge new">{t('new')}</span>}
                    {!Array.isArray(product.badges) && product.isSale && <span className="badge sale">{t('sale_badge')}</span>}
                </div>
            </div>
            <div className="product-info">
                <h4 className="product-brand">
                    {product.brand} {product.gender && `| ${product.gender === 'men' ? 'Nam' : product.gender === 'women' ? 'Nữ' : 'Unisex'}`}
                </h4>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                    {product.salePrice ? (
                        <>
                            <span className="price-current">{formatCurrency(product.salePrice)}</span>
                            <span className="price-old">{formatCurrency(product.price)}</span>
                        </>
                    ) : (
                        <span className="price-current">{formatCurrency(product.price)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;