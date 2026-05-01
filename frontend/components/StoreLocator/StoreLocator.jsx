


import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './StoreLocator.css';

const storesData = [
    {
        id: 1,
        name: "HKT Shoes Vincom Đồng Khởi",
        city: "Hồ Chí Minh",
        address: "Tầng B1, Vincom Center, 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM",
        phone: "028 3936 9999",
        hours: "10:00 - 22:00",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
        mapLink: "https://maps.google.com/?q=Vincom+Center+Đồng+Khởi"
    },
    {
        id: 2,
        name: "HKT Shoes Saigon Centre",
        city: "Hồ Chí Minh",
        address: "Tầng 3, Saigon Centre, 65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM",
        phone: "028 3829 4888",
        hours: "09:30 - 22:00",
        image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800&auto=format&fit=crop",
        mapLink: "https://maps.google.com/?q=Saigon+Centre"
    },
    {
        id: 3,
        name: "HKT Shoes Crescent Mall",
        city: "Hồ Chí Minh",
        address: "Tầng 2, Crescent Mall, 101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM",
        phone: "028 5413 3333",
        hours: "10:00 - 22:00",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=800&auto=format&fit=crop",
        mapLink: "https://maps.google.com/?q=Crescent+Mall"
    },
    {
        id: 4,
        name: "HKT Shoes Vincom Bà Triệu",
        city: "Hà Nội",
        address: "Tầng 4, Vincom Center Bà Triệu, 191 Bà Triệu, Hai Bà Trưng, Hà Nội",
        phone: "024 3974 8888",
        hours: "10:00 - 22:00",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
        mapLink: "https://maps.google.com/?q=Vincom+Center+Bà+Triệu"
    },
    {
        id: 5,
        name: "HKT Shoes Lotte Center",
        city: "Hà Nội",
        address: "Tầng 3, Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội",
        phone: "024 3333 1000",
        hours: "09:30 - 22:00",
        image: "https://images.unsplash.com/photo-1604719312566-b7cb46690f4e?q=80&w=800&auto=format&fit=crop",
        mapLink: "https://maps.google.com/?q=Lotte+Center+Hanoi"
    },
    {
        id: 6,
        name: "HKT Shoes Aeon Mall Bình Dương",
        city: "Bình Dương",
        address: "Tầng 1, Aeon Mall Bình Dương Canary, Số 1 Đại lộ Bình Dương, Thuận An",
        phone: "0274 625 9999",
        hours: "10:00 - 22:00",
        image: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?q=80&w=800&auto=format&fit=crop",
        mapLink: "https://maps.google.com/?q=Aeon+Mall+Bình+Dương+Canary"
    }
];

const StoreLocator = () => {
    const { t } = useLanguage();
    const [selectedCity, setSelectedCity] = useState('All');
    const [filteredStores, setFilteredStores] = useState(storesData);
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const cities = ['All', ...new Set(storesData.map(store => store.city))];

    useEffect(() => {
        if (selectedCity === 'All') {
            setFilteredStores(storesData);
        } else {
            setFilteredStores(storesData.filter(store => store.city === selectedCity));
        }
    }, [selectedCity]);

    return (
        <div className="store-locator-container">
            <h1 className="store-header-title" data-aos="fade-down">
                {t('stores_system') || "HỆ THỐNG CỬA HÀNG"}
            </h1>

            <div className="store-filters" data-aos="fade-up">
                {cities.map(city => (
                    <button
                        key={city}
                        className={`filter-btn ${selectedCity === city ? 'active' : ''}`}
                        onClick={() => setSelectedCity(city)}
                    >
                        {city === 'All' ? (t('filter_all') || "Tất cả") : city}
                    </button>
                ))}
            </div>

            <div className="store-grid">
                {filteredStores.map((store, index) => (
                    <div key={store.id} className="store-card" data-aos="fade-up" data-aos-delay={index * 100}>
                        <div className="store-image-wrapper">
                            <img src={store.image} alt={store.name} />
                        </div>
                        <div className="store-details">
                            <h3 className="store-name">{store.name}</h3>
                            <div className="store-info-row">
                                <MapPin size={18} className="store-icon" />
                                <span>{store.address}</span>
                            </div>
                            <div className="store-info-row">
                                <Phone size={18} className="store-icon" />
                                <span>{store.phone}</span>
                            </div>
                            <div className="store-info-row">
                                <Clock size={18} className="store-icon" />
                                <span>{store.hours}</span>
                            </div>

                            <div className="store-actions">
                                <a
                                    href={store.mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="directions-btn"
                                >
                                    <Compass size={18} />
                                    {t('get_directions') || "Chỉ đường"}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStores.length === 0 && (
                <div className="text-center mt-4">
                    <p>Không tìm thấy cửa hàng nào trong khu vực này.</p>
                </div>
            )}

            <div className="store-faq-section" data-aos="fade-up">
                <h2 className="store-faq-title">{t('store_faq_title')}</h2>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="faq-item">
                        <div
                            className="faq-question"
                            onClick={() => toggleFaq(i)}
                        >
                            <span>{t(`store_faq_${i}_q`)}</span>
                            {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        {openFaq === i && (
                            <div className="faq-answer">
                                {t(`store_faq_${i}_a`)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreLocator;
