

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import './TrendSection.css';
import { useLanguage } from '../../context/LanguageContext';

const TrendSection = ({ trendingProducts, title, viewAllLink, titleClassName, gridClassName }) => {
    const { t } = useLanguage();
    return (
        <section className="section-container trend-section">
            <div className="section-header">
                <h2 className={`section-title ${titleClassName || ''}`}>
                    {title || t('trending_week')}
                </h2>
                <div className="collection__view-all">
                    <Link to={viewAllLink || "/collections/puma"} className="link underlined-link" aria-label={t('view_all')}>
                        <span>{t('view_all')}</span>
                    </Link>
                </div>
            </div>

            <div className="product-grid-container">
                <div className="collection">
                    <div className="loading-overlay gradient"></div>
                    <ul className={`product-grid ${gridClassName || 'grid--5-col-desktop'}`}>
                        {trendingProducts.map((product) => (
                            <li className="grid__item" key={product.id}>
                                <ProductCard product={product} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default TrendSection;
