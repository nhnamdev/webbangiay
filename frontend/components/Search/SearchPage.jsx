

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import { searchProducts } from '../../services/api';
import ProductCard from '../ProductCard/ProductCard';
import CollectionSidebar from '../Collection/CollectionSidebar';
import './SearchPage.css';

const SearchPage = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
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
                const data = await searchProducts(query);
                setProducts(data);
            } catch (error) {
                console.error("Failed to search products:", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchProducts();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query]);

    // Filter Selection State
    const [selectedFilters, setSelectedFilters] = useState({
        availability: false,
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
                const currentList = newState[sectionId];
                if (currentList.includes(value)) {
                    newState[sectionId] = currentList.filter(item => item !== value);
                } else {
                    newState[sectionId] = [...currentList, value];
                }
            } else if (type === 'price') {
                newState.price = { ...newState.price, ...value };
            } else if (type === 'switch') {
                newState[sectionId] = !newState[sectionId];
            }

            return newState;
        });
    };

    // Derived State: Filtered & Sorted Products
    const processedProducts = products.filter(product => {

        // Filter by Price
        if (product.price < selectedFilters.price.min || product.price > selectedFilters.price.max) return false;

        // Filter by Brand (Array)
        if (selectedFilters.brand.length > 0) {
            const brandMatch = selectedFilters.brand.some(b => b.toLowerCase() === product.brand?.toLowerCase());
            if (!brandMatch) return false;
        }

        if (selectedFilters.gender.length > 0) {
            if (!selectedFilters.gender.includes(product.gender)) return false;
        }
        if (selectedFilters.category.length > 0) {
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

    if (loading) {
        return <div className="loading-screen"><div className="spinner"></div></div>;
    }

    return (
        <div className="collection-page search-page">
            <header className="search-header">
                <h1 className="search-title">KẾT QUẢ TÌM KIẾM</h1>
                <p>Từ khóa: "{query}"</p>
                <div className="breadcrumb">
                    <Link to="/">Trang chủ</Link> / <span>TÌM KIẾM</span>
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
                        <span className="product-count">{processedProducts.length} sản phẩm</span>
                        <div className="sort-wrapper">
                            <select
                                className="sort-select"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="manual">Tùy chọn</option>
                                <option value="price-asc">Giá: Tăng dần</option>
                                <option value="price-desc">Giá: Giảm dần</option>
                                <option value="name-asc">Tên: A-Z</option>
                                <option value="name-desc">Tên: Z-A</option>
                            </select>
                        </div>
                    </div>

                    <div className="collection-products-grid">
                        {processedProducts.length > 0 ? (
                            processedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="no-results">
                                <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}".</p>
                                <p>Vui lòng thử lại với từ khóa khác.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SearchPage;
