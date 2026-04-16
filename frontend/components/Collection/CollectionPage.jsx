

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { getProductsByCollection } from '../../services/api';
import ProductCard from '../ProductCard/ProductCard';
import CollectionSidebar from './CollectionSidebar';
import './CollectionPage.css';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const CollectionPage = () => {
    const { t } = useLanguage();
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState('manual');

    // Mock Filters State (Expanded/Collapsed)
    const [filtersOpen, setFiltersOpen] = useState({
        brand: true,
        price: true,
        size: true
    });

    const toggleFilter = (key) => {
        setFiltersOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch filtered by slug
                const data = await getProductsByCollection(slug);
                setProducts(data);
            } catch (error) {
                console.error("Failed to load collection:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slug]);

    // Filter Selection State
    const [selectedFilters, setSelectedFilters] = useState({
        availability: false, // true = filtering for in-stock only
        price: { min: 0, max: 100000000 },
        gender: [],
        brand: [],
        size: [],
        color: [],
        material: [],
        category: [],
        discount: []
    });

    const handleFilterChange = (sectionId, value, type) => {
        setSelectedFilters(prev => {
            const newState = { ...prev };

            if (type === 'list' || type === 'color') {
                // Toggle value in array
                const currentList = newState[sectionId];
                if (currentList.includes(value)) {
                    newState[sectionId] = currentList.filter(item => item !== value);
                } else {
                    newState[sectionId] = [...currentList, value];
                }
            } else if (type === 'price') {
                // value is { min, max }
                newState.price = { ...newState.price, ...value };
            } else if (type === 'switch') {
                newState[sectionId] = !newState[sectionId];
            }

            return newState;
        });
    };

    // Derived State: Filtered & Sorted Products
    const processedProducts = products.filter(product => {
        if (product.price < selectedFilters.price.min || product.price > selectedFilters.price.max) return false;

        if (selectedFilters.brand.length > 0) {
            // Check if product.brand matches any selected brand (case-insensitive)
            const brandMatch = selectedFilters.brand.some(b => b.toLowerCase() === product.brand?.toLowerCase());
            if (!brandMatch) return false;
        }

        if (selectedFilters.gender.length > 0) {
            if (!selectedFilters.gender.includes(product.gender)) return false;
        }
        if (selectedFilters.category.length > 0) {
            // e.g. "shoes" vs "clothes"
            if (!selectedFilters.category.includes(product.category)) return false;
        }

        return true;
    }).sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
        if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
    });
    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 16; // 4 rows x 4 cols

    useEffect(() => {
        setCurrentPage(1);
    }, [slug, selectedFilters, sortOption]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = processedProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    return (
        <div className="collection-page">
            <header className="collection-header">
                <h1 className="collection-title">{slug ? slug.replace('-', ' ') : t('all_products')}</h1>
                <div className="breadcrumb">
                    <Link to="/">{t('home')}</Link> / <span>{slug ? slug.toUpperCase() : t('products')}</span>
                </div>
            </header>

            <div className="collection-layout">
                {/* Sidebar Filters */}
                <CollectionSidebar
                    filters={filtersOpen}
                    toggleFilter={toggleFilter}
                    selectedFilters={selectedFilters}
                    onFilterChange={handleFilterChange}
                />

                {/* Main Content */}
                <main className="collection-content">
                    <div className="toolbar">
                        <span className="product-count">{processedProducts.length} {t('product_suffix')}</span>
                        <div className="sort-wrapper">
                            <select
                                className="sort-select"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="manual">{t('sort_default')}</option>
                                <option value="price-asc">{t('sort_price_asc')}</option>
                                <option value="price-desc">{t('sort_price_desc')}</option>
                                <option value="name-asc">{t('sort_name_asc')}</option>
                                <option value="name-desc">{t('sort_name_desc')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="collection-products-grid">
                        {currentProducts.length > 0 ? (
                            currentProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p>{t('no_products_found')}</p>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &laquo;
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const page = index + 1;
                                // Show first, last, current, and adjacent pages
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    (page === currentPage - 2 && currentPage > 3) ||
                                    (page === currentPage + 2 && currentPage < totalPages - 2)
                                ) {
                                    return <span key={page} className="pagination-ellipsis">...</span>;
                                }
                                return null;
                            })}

                            <button
                                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &raquo;
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CollectionPage;
