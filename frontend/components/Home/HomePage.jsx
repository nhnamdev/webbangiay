

import React from 'react';
import BannerCarousel from '../Banner/BannerCarousel';
import ProductCard from '../ProductCard/ProductCard';
import ProductCarousel from '../ProductCarousel';
import SocialNewsSection from '../SocialNews/SocialNewsSection';
import { getBrands, getNewArrivals, getSaleProducts, getAsicsProducts, getTrendingProducts } from '../../services/api';
import TrendSection from './TrendSection';
import ScrollingLogos from './ScrollingLogos';
import ScrollingPromotion from './ScrollingPromotion';
import './HomePage.css';
import { useQuery } from '@tanstack/react-query';

import { useLanguage } from '../../context/LanguageContext';

const HomePage = () => {
    const { t } = useLanguage();

    // Sử dụng React Query để fetch và cache dữ liệu song song
    const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: getBrands });
    const { data: newArrivals = [] } = useQuery({ queryKey: ['newArrivals'], queryFn: getNewArrivals });
    const { data: saleProducts = [] } = useQuery({ queryKey: ['saleProducts'], queryFn: getSaleProducts });
    const { data: asicsProducts = [] } = useQuery({ queryKey: ['asicsProducts'], queryFn: getAsicsProducts });
    const { data: trendingProducts = [] } = useQuery({ queryKey: ['trendingProducts'], queryFn: getTrendingProducts });



    return (
        <>
            {/* Hero Carousel */}
            <BannerCarousel />

            <main>
                {/* Brand Section */}
                <section className="section-container" data-aos="fade-up">
                    <div className="section-header">
                        <h2 className="section-title">{t('featured_brands')}</h2>
                    </div>
                    <div className="brand-grid">
                        {brands.map((brand) => (
                            <div key={brand.name} className="brand-card">
                                <img src={brand.logo} alt={brand.name} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Exclusive ASICS Section */}
                <div data-aos="fade-right">
                    <ProductCarousel
                        title={t('exclusive_asics')}
                        products={asicsProducts}
                        link="/collections/asics"
                        style={{ paddingBottom: '0' }}
                    />
                </div>

                {/* Scrolling Logos Section */}
                <div data-aos="fade-in">
                    <ScrollingLogos />
                </div>

                {/* Trending Section - NEW */}
                <div data-aos="zoom-in">
                    <TrendSection trendingProducts={trendingProducts.slice(0, 10)} />
                </div>

                {/* Scrolling Promotion Section (Green) */}
                <div data-aos="flip-up">
                    <ScrollingPromotion />
                </div>

                {/* New Arrivals - Reusing TrendSection Component */}
                <div data-aos="fade-up">
                    <TrendSection
                        trendingProducts={newArrivals}
                        title={t('new_products')}
                        viewAllLink="/collections/new-arrivals"
                    />
                </div>

                {/* Sale Section */}
                {/* Sale Section - Sorted by Discount */}
                <div data-aos="fade-up">
                    <TrendSection
                        trendingProducts={saleProducts
                            .sort((a, b) => {
                                const da = a.salePrice ? ((a.price - a.salePrice) / a.price) : 0;
                                const db = b.salePrice ? ((b.price - b.salePrice) / b.price) : 0;
                                return db - da;
                            })
                            .slice(0, 12)
                        }
                        title={t('sale_products')}
                        viewAllLink="/collections/sale"
                        titleClassName="text-red"
                    />
                </div>

                {/* Social & News Section */}
                <div data-aos="fade-left">
                    <SocialNewsSection />
                </div>

            </main>
        </>
    );
};

export default HomePage;
