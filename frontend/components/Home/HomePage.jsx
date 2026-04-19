

import React, { useEffect, useState } from 'react';
import BannerCarousel from '../Banner/BannerCarousel';
import ProductCard from '../ProductCard/ProductCard';
import ProductCarousel from '../ProductCarousel';
import SocialNewsSection from '../SocialNews/SocialNewsSection';
import { getBrands, getNewArrivals, getSaleProducts, getAsicsProducts, getTrendingProducts } from '../../services/api';
import TrendSection from './TrendSection';
import ScrollingLogos from './ScrollingLogos';
import ScrollingPromotion from './ScrollingPromotion';
import './HomePage.css';

import { useLanguage } from '../../context/LanguageContext';

const HomePage = () => {
    const { t } = useLanguage();
    const [brands, setBrands] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [saleProducts, setSaleProducts] = useState([]);
    const [asicsProducts, setAsicsProducts] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel for efficiency
                const [brandsData, newData, saleData, asicsData, trendingData] = await Promise.all([
                    getBrands(),
                    getNewArrivals(),
                    getSaleProducts(),
                    getAsicsProducts(),
                    getTrendingProducts()
                ]);

                setBrands(brandsData);
                setNewArrivals(newData);
                setSaleProducts(saleData);
                setAsicsProducts(asicsData);
                setTrendingProducts(trendingData);
            } catch (error) {
                console.error("Failed to fetch home page data:", error);
            }
        };

        fetchData();
    }, []);


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
