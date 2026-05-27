

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Search, User, ShoppingBag, Menu, X, CheckCircle, Truck, CreditCard, ChevronDown, Loader2, TrendingUp, Tag } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { searchProducts } from '../../services/api';
import './Navbar.css';
import '../LogIn_SignUp/Auth.css';
import { useAuth } from '../../context/AuthContext';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../../redux/cartSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active-tab-1');

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Language Context
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const cartCount = useSelector(selectCartCount);
  const navigate = useNavigate();
  const { pathname: pathname } = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchBarRef = useRef(null);
  const debounceRef = useRef(null);

  // Highlight từ khóa trong text
  const highlightText = useCallback((text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="suggestion-highlight">{part}</mark>
        : part
    );
  }, []);

  const handleSearch = useCallback((term) => {
    const q = (term ?? searchTerm).trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setIsMenuOpen(false);
      setShowSuggestions(false);
      setActiveIndex(-1);
      setSearchTerm(q);
    }
  }, [navigate, searchTerm]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigate(`/products/${suggestions[activeIndex].id}`);
        setShowSuggestions(false);
        setActiveIndex(-1);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length > 1) {
      setIsSearchLoading(true);
      setShowSuggestions(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await searchProducts(value);
          setSuggestions(results.slice(0, 6));
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setIsSearchLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearchLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  // Xử lý click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Navigation Links with Mega Menu Data
  const navLinks = useMemo(() => [
    {
      name: t('brands'),
      path: "/collections/all",
      type: "list", // Grid/List of brands
      data: [
        { name: "TẤT CẢ", path: "/collections/all" },
        { name: "NIKE", path: "/collections/nike" },
        { name: "JORDAN", path: "/collections/jordan" },
        { name: "ADIDAS", path: "/collections/adidas" },
        { name: "NEW BALANCE", path: "/collections/new-balance" },
        { name: "ASICS", path: "/collections/asics" },
        { name: "PUMA", path: "/collections/puma" },
        { name: "CONVERSE", path: "/collections/converse" },
        { name: "CROCS", path: "/collections/crocs" },
        { name: "FILA", path: "/collections/fila" },
        { name: "PATRICK", path: "/collections/patrick" },
        { name: "STEFANO ROSSI", path: "/collections/stefano-rossi" },
        { name: "HAWKINS", path: "/collections/hawkins" },
        { name: "K-SWISS", path: "/collections/k-swiss" },
        { name: "ABC SELECT", path: "/collections/abc-select" },
        { name: "ON", path: "/collections/on" },
        { name: "WHAT IT ISNT", path: "/collections/what-it-isnt" },
      ]
    },
    {
      name: t('categories'),
      path: "/collections/all",
      type: "columns",
      data: [
        {
          title: t('women_shoes'),
          path: "/collections/giay-nu",
          items: [
            { name: t('sport_shoes'), path: "/collections/giay-the-thao-nu" },
            { name: t('sandals'), path: "/collections/giay-xang-dan-nu" },
            { name: t('slippers'), path: "/collections/dep-nu" },
            { name: t('leather_shoes'), path: "/collections/giay-da-nu" },
          ]
        },
        {
          title: t('men_shoes'),
          path: "/collections/giay-nam",
          items: [
            { name: t('sport_shoes'), path: "/collections/giay-the-thao-nam" },
            { name: t('sandals'), path: "/collections/giay-xang-dan-nam" },
            { name: t('slippers'), path: "/collections/dep-nam" },
            { name: t('leather_shoes'), path: "/collections/giay-da-nam" },
          ]
        },
        {
          title: t('apparel'),
          path: "/collections/phu-trang",
          items: [
            { name: t('tops'), path: "/collections/ao" },
            { name: t('bottoms'), path: "/collections/quan" },
            { name: t('others'), path: "/collections/phu-trang" },
          ]
        },
        {
          title: t('accessories_nav'),
          path: "/collections/phu-kien1",
          items: [
            { name: t('bags'), path: "/collections/tui" },
            { name: t('hats'), path: "/collections/non" },
            { name: t('socks'), path: "/collections/vo" },
          ]
        },
        {
          title: t('shoe_care'),
          path: "/collections/cham-soc-giay",
          items: [
            { name: t('shoe_care'), path: "/collections/cham-soc-giay" },
            { name: t('shoelaces'), path: "/collections/day-giay" },
          ]
        },
      ]
    },
    {
      name: t('new_arrivals'),
      path: "/collections/hang-moi",
      type: "tabs",
      tabs: [
        { id: 'active-tab-1', label: t('collection'), path: "/collections/puma" },
        { id: 'active-tab-2', label: t('new_arrivals'), path: "/collections/hang-moi" },
        { id: 'active-tab-3', label: t('exclusive_asics'), path: "/collections/doc-quyen" },
        { id: 'active-tab-4', label: t('ranking'), path: "/collections/xep-hang" },
      ],
      content: {
        'active-tab-1': [
          { title: "NEW BALANCE", img: "//abc-mart.com.vn/cdn/shop/collections/4_-_New_Balance_collection.jpg?v=1760514203&width=535", link: "/collections/new-balance" },
          { title: "PUMA", img: "//abc-mart.com.vn/cdn/shop/collections/PUMA.jpg?v=1763689996&width=535", link: "/collections/puma" },
          { title: "ASICS", img: "//abc-mart.com.vn/cdn/shop/collections/asics_kayano_rafflebanner_mobile.jpg?v=1764125320&width=535", link: "/collections/asics" },
        ],
        'active-tab-2': [
          { title: "ADIDAS SAMBA", img: "https://abc-mart.com.vn/cdn/shop/files/H-STREET_HERO_BANNER.jpg?v=1765601397&width=535", link: "/products/adidas-samba" },
          { title: "NIKE DUNK LOW", img: "https://abc-mart.com.vn/cdn/shop/files/12.12_EC.jpg?v=1765419048&width=535", link: "/products/nike-dunk-low" },
          { title: "FILA RAY TRACER", img: "https://abc-mart.com.vn/cdn/shop/collections/4_-_New_Balance_collection.jpg?v=1760514203&width=535", link: "/products/fila-ray" },
        ],
        'active-tab-3': [
          { title: "ABC SELECT X PUMA", img: "https://abc-mart.com.vn/cdn/shop/files/BANNER_SPEEDCAT_SMU.png?v=1763630030&width=1500", link: "/collections/abc-select" },
          { title: "ASICS GEL-1130", img: "https://abc-mart.com.vn/cdn/shop/collections/asics_kayano_rafflebanner_mobile.jpg?v=1764125320&width=535", link: "/collections/asics" },
          { title: "VANS EXCLUSIVE", img: "https://abc-mart.com.vn/cdn/shop/collections/PUMA.jpg?v=1763689996&width=535", link: "/collections/vans-exclusive" },
        ],
        'active-tab-4': [
          { title: "NO.1 BEST SELLER", img: "https://abc-mart.com.vn/cdn/shop/files/asics_life_walker.jpg?v=1765421454&width=1500", link: "/collections/best-seller" },
          { title: "NO.2 TRENDING", img: "https://abc-mart.com.vn/cdn/shop/files/12.12_EC.jpg?v=1765419048&width=535", link: "/collections/trending" },
          { title: "NO.3 RISING STAR", img: "https://abc-mart.com.vn/cdn/shop/collections/4_-_New_Balance_collection.jpg?v=1760514203&width=535", link: "/collections/rising-star" },
        ],
      }
    },
    { name: t('sale'), path: "/collections/sale", className: "text-red" },
    { name: t('blogs'), path: "/blogs/news" },
    { name: t('hunt_coin'), path: "/rewards", className: "text-green" },
  ], [t]);

  return (
    <div className="navbar-wrapper">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="top-bar-item">
            <CheckCircle size={16} className="top-bar-icon" />
            <span>{t('authentic')}</span>
          </div>
          <div className="top-bar-item">
            <Truck size={16} className="top-bar-icon" />
            <span>{t('free_ship')}</span>
          </div>
          <div className="top-bar-item">
            <CreditCard size={16} className="top-bar-icon" />
            <span>{t('member_voucher')}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-container">

          {/* Logo */}
          <Link
            to="/"
            className="logo-wrapper"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.location.reload();
              }
            }}
          >
            <img
              src="/logoHKTShoes.png"
              alt="HKT-SHOES"
              className="logo-main"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className={`desktop-nav ${isMenuOpen ? 'open' : ''}`}>
            <div className="mobile-header">
              <span>Menu</span>
              <button className="close-menu-btn" onClick={() => setIsMenuOpen(false)}>
                <X size={36} /> {/* 24 * 1.5 */}
              </button>
            </div>
            {navLinks.map((link) => (
              <div key={link.name} className="nav-item-wrapper">
                <Link
                  to={link.path}
                  className={`nav-link ${link.className || ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.prefix && <span className="text-red">{link.prefix}</span>}
                  {link.name}
                  {link.suffix && <span className="text-red">{link.suffix}</span>}
                  {link.type && <ChevronDown size={16} className="nav-arrow" />}
                </Link>

                {/* Dropdowns */}
                {link.type === 'list' && (
                  <div className="mega-menu mega-menu-list">
                    {link.data.map(item => (
                      <Link key={item.name} to={item.path} className="mega-menu-item">{item.name}</Link>
                    ))}
                  </div>
                )}

                {link.type === 'columns' && (
                  <div className="mega-menu mega-menu-columns">
                    {link.data.map(col => (
                      <div key={col.title} className="mega-menu-column">
                        <Link to={col.path} className="column-title">{col.title}</Link>
                        <div className="column-items">
                          {col.items.map(item => (
                            <Link key={item.name} to={item.path} className="column-item">{item.name}</Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {link.type === 'tabs' && (
                  <div className="mega-menu mega-menu-tabs">
                    <div className="tabs-header">
                      {link.tabs.map(tab => (
                        <span
                          key={tab.id}
                          className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
                          onMouseEnter={() => setActiveTab(tab.id)}
                        >
                          {tab.label}
                        </span>
                      ))}
                    </div>
                    <div className="tab-content">
                      {link.content[activeTab]?.map((item, idx) => (
                        <Link key={idx} to={item.link} className="tab-card">
                          <div className="img-wrapper">
                            <img src={item.img} alt={item.title} />
                          </div>
                          <span className="card-title">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </nav>

          {/* Mobile Menu Button  */}
          <div className="mobile-header-controls">

          </div>

          {/* Search Bar */}
          <div className="search-bar" ref={searchBarRef}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="search-input"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchTerm.length > 1) setShowSuggestions(true);
              }}
              autoComplete="off"
            />
            {isSearchLoading
              ? <Loader2 size={20} className="search-icon search-loading-icon" />
              : <Search size={23} className="search-icon" onClick={() => handleSearch()} style={{ cursor: 'pointer' }} />
            }

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="search-suggestions">
                {isSearchLoading ? (
                  <div className="suggestions-loading">
                    <Loader2 size={18} className="spin-icon" />
                    <span>Đang tìm kiếm...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="suggestions-label">
                      <TrendingUp size={14} />
                      <span>Gợi ý sản phẩm</span>
                    </div>
                    {suggestions.map((product, idx) => (
                      <Link
                        to={`/products/${product.id}`}
                        key={product.id}
                        className={`suggestion-item ${activeIndex === idx ? 'suggestion-active' : ''}`}
                        onClick={() => {
                          setShowSuggestions(false);
                          setActiveIndex(-1);
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <div className="suggestion-img-wrap">
                          <img src={product.image || '/placeholder.png'} alt={product.name} className="suggestion-image" />
                          {(product.isSale || (product.salePrice && product.salePrice < product.price)) && (
                            <span className="suggestion-badge-sale">SALE</span>
                          )}
                          {product.isNew && (
                            <span className="suggestion-badge-new">NEW</span>
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-name">
                            {highlightText(product.name, searchTerm)}
                          </span>
                          <span className="suggestion-brand">
                            <Tag size={11} /> {product.brand}
                          </span>
                          <div className="suggestion-prices">
                            {product.salePrice && product.salePrice < product.price ? (
                              <>
                                <span className="suggestion-price-sale">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice)}
                                </span>
                                <span className="suggestion-price-original">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="suggestion-price">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <button
                      className="suggestions-view-all"
                      onClick={() => handleSearch()}
                    >
                      <Search size={15} />
                      Xem tất cả kết quả cho "{searchTerm}"
                    </button>
                  </>
                ) : searchTerm.trim().length > 1 ? (
                  <div className="suggestions-empty">
                    <Search size={32} className="suggestions-empty-icon" />
                    <p>Không tìm thấy sản phẩm nào</p>
                    <span>cho từ khóa "{searchTerm}"</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="header-icons">
            {/* --- MỚI: Bắt đầu phần USER MENU --- */}
            <div className="icon-item user-menu-container" ref={userMenuRef}>
              <div
                className="user-icon-wrapper"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <User size={25} className="icon" />
                {/* Hiển thị tên nếu đã đăng nhập */}
                {user && <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {user.user_metadata?.last_name || user.lastName || "Khách"}
                </span>}
              </div>

              {/* Menu con thả xuống */}
              {isUserMenuOpen && (
                <div className="user-dropdown" style={{ paddingTop: '20px' }}>

                  {user ? (
                    // Giao diện KHI ĐÃ ĐĂNG NHẬP
                    <>
                      <div className="user-dropdown-item" style={{ color: '#84cc16' }}>
                        {t('hello')}, {user.user_metadata?.first_name || user.firstName} {user.user_metadata?.last_name || user.lastName}
                      </div>
                      <Link to="/profile" className="user-dropdown-item">
                        {t('account_info')}
                      </Link>
                      <Link
                        to="/favorites"
                        className="user-dropdown-item"
                      >
                        {t('favorites')}
                      </Link>

                      <Link to="/orders" className="user-dropdown-item">
                        {t('my_orders')}
                      </Link>
                      <div
                        className="user-dropdown-item"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        style={{ cursor: 'pointer', borderTop: '1px solid #eee' }}
                      >
                        {t('logout')}
                      </div>
                    </>
                  ) : (
                    // Giao diện KHI CHƯA ĐĂNG NHẬP (Cũ)
                    <>
                      <div className="user-dropdown-item">{t('track_order_msg')}</div>
                      <Link
                        to="/login"
                        className="user-dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <button className="auth-btn">{t('login')}</button>
                      </Link>
                      <Link
                        to="/register"
                        className="user-dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <button className="cancel-btn">{t('register')}</button>
                      </Link>
                    </>
                  )}

                </div>
              )}
            </div>

            <div className="icon-item cart-item" onClick={() => navigate('/cart')}>
              <ShoppingBag size={25} className="icon" />
              <span className="cart-badge">{cartCount}</span>
            </div>

            <div className="lang-select" ref={langMenuRef} onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}>
              <img
                src={language === 'VI' ? "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" : "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"}
                alt={language}
                className="flag-icon"
              />
              <span className="lang-code">{language}</span>

              {isLangMenuOpen && (
                <div className="lang-dropdown">
                  <div
                    className="lang-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageChange('VI');
                    }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="VI"
                      className="flag-icon-sm" />
                    <span>Tiếng Việt</span>
                  </div>
                  <div
                    className="lang-dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageChange('EN');
                    }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg"
                      alt="EN" className="flag-icon-sm" />
                    <span>English</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={32} />
            </button>
          </div>
        </div>
      </header>

      {/* Cart Popup */}

    </div>
  );
};

export default Navbar;

// fix loi menu mobile an hien responsive
