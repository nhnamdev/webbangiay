import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from './ProductCard/ProductCard';
import './ProductCarousel.css';
import { useLanguage } from '../context/LanguageContext';

const ProductCarousel = ({ title, products, link, className = '', style = {} }) => {
    const { t } = useLanguage();
    if (!products || products.length === 0) return null;

    return (
        <section className={`section-container product-carousel-section ${className}`} style={style}>
            <div className="section-header">
                <h2 className="section-title text-left">{title}</h2>
                {link && (
                    <a href={link} className="view-all-link">
                        {t('view_all')}
                    </a>
                )}
            </div>

            <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={2.3}
                navigation={true}
                breakpoints={{
                    640: {
                        slidesPerView: 3,
                    },
                    768: {
                        slidesPerView: 4,
                    },
                    1024: {
                        slidesPerView: 5,
                    },
                }}
                className="product-swiper"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default ProductCarousel;