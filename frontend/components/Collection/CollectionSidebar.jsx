

import React, { useState } from 'react';
import './CollectionSidebar.css';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const CollectionSidebar = ({ selectedFilters, onFilterChange }) => {
    // State to manage open/close status of each filter section
    const [openSections, setOpenSections] = useState({
        availability: true,
        price: true,
        gender: true,
        brand: true,
        size: true,

    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Static Data Mapping (Mocking the data found in the snippet)
    const filterSections = [
        {
            id: 'availability',
            title: 'TÌNH TRẠNG',
            type: 'switch',
            options: [
                { label: 'Còn hàng', value: 'available' }
            ]
        },
        {
            id: 'price',
            title: 'GIÁ BÁN',
            type: 'price',
            maxPrice: '4.519.000'
        },
        {
            id: 'gender',
            title: 'GIỚI TÍNH',
            type: 'list',
            options: [
                { label: 'Nam', count: 36, value: 'nam' },
                { label: 'Nữ', count: 20, value: 'nu' },
                { label: 'NỮ_GS', count: 5, value: 'nu_gs' },
                { label: 'Unisex', count: 2, value: 'unisex' }
            ]
        },
        {
            id: 'brand',
            title: 'THƯƠNG HIỆU',
            type: 'list',
            options: [
                { label: 'Nike', count: 63, value: 'Nike' },
                { label: 'Adidas', count: 45, value: 'Adidas' },
                { label: 'Puma', count: 20, value: 'Puma' },
                { label: 'ASICS', count: 15, value: 'ASICS' }
            ]
        },
        {
            id: 'size',
            title: 'KÍCH THƯỚC',
            type: 'list',
            options: [
                { label: 'L', count: 5, value: 'L' },
                { label: 'M', count: 7, value: 'M' },
                { label: 'M/L', count: 1, value: 'M/L' },
                { label: 'ONE SIZE', count: 3, value: 'ONE_SIZE' },
                { label: 'S', count: 5, value: 'S' },
                { label: 'US 7', count: 6, value: 'US_7' },
                { label: 'US 7.5', count: 19, value: 'US_7.5' },
                { label: 'US 8', count: 28, value: 'US_8' },
                { label: 'US 8.5', count: 28, value: 'US_8.5' },
                { label: 'US 9', count: 29, value: 'US_9' },
                { label: 'US 9.5', count: 30, value: 'US_9.5' },
                { label: 'US 10', count: 25, value: 'US_10' }
            ]
        },

    ];

    // Handlers
    const handleCheckboxChange = (sectionId, value, type = 'list') => {
        if (onFilterChange) onFilterChange(sectionId, value, type);
    };

    const handlePriceChange = (e, field) => {
        let val = Number(e.target.value.replace(/\D/g, ''));
        if (onFilterChange) {
            onFilterChange('price', { [field]: val }, 'price');
        }
    };

    if (!selectedFilters) return null; // Guard

    return (
        <aside className="collection-sidebar">
            <div className="filter-heading-wrapper">
                <div className="filter-heading">BỘ LỌC:</div>
                <div className="clear-all" onClick={() => window.location.reload()}>Xóa tất cả</div>
            </div>

            {filterSections.map((section) => (
                <div key={section.id} className="filter-item">
                    <div className="filter-summary" onClick={() => toggleSection(section.id)}>
                        <span>{section.title}</span>
                        {openSections[section.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    <div className={`filter-content ${openSections[section.id] ? 'open' : ''}`}>

                        {/* Render Switch */}
                        {section.type === 'switch' && (
                            <div className="switch-wrapper" onClick={() => handleCheckboxChange(section.id, null, 'switch')}>
                                <input
                                    type="checkbox"
                                    className="switch-input"
                                    checked={selectedFilters[section.id]}
                                    readOnly
                                />
                                <span>{section.options[0].label}</span>
                            </div>
                        )}

                        {/* Render Price */}
                        {section.type === 'price' && (
                            <div className="price-range">
                                <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Giá cao nhất là {section.maxPrice}₫</p>
                                <div className="price-range-wrapper">
                                    <div className="price-field">
                                        <label>Từ</label>
                                        <input
                                            type="text"
                                            placeholder="0"
                                            value={selectedFilters.price?.min || ''}
                                            onChange={(e) => handlePriceChange(e, 'min')}
                                        />
                                    </div>
                                    <div className="price-field">
                                        <label>Đến</label>
                                        <input
                                            type="text"
                                            placeholder={section.maxPrice}
                                            value={selectedFilters.price?.max || ''}
                                            onChange={(e) => handlePriceChange(e, 'max')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Render Checkbox List */}
                        {section.type === 'list' && (
                            <ul className="filter-list">
                                {section.options.map((opt) => {
                                    const isChecked = selectedFilters[section.id] ? selectedFilters[section.id].includes(opt.value) : false;
                                    return (
                                        <li key={opt.value} className="filter-list-item">
                                            <label className="checkbox-label" onClick={(e) => { e.preventDefault(); handleCheckboxChange(section.id, opt.value, 'list'); }}>
                                                <input
                                                    type="checkbox"
                                                    hidden
                                                    checked={isChecked}
                                                    readOnly
                                                />
                                                <div className="custom-checkbox" style={isChecked ? { background: 'black', borderColor: 'black', color: 'white' } : {}}>
                                                    {isChecked && <Check size={12} strokeWidth={3} />}
                                                </div>
                                                <span style={{ marginLeft: '10px' }}>{opt.label}</span>
                                            </label>
                                            <span className="checkbox-count">{opt.count}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* Render Color Swatches */}
                        {section.type === 'color' && (
                            <div className="swatch-list">
                                {section.options.map(opt => {
                                    const isSelected = selectedFilters[section.id] ? selectedFilters[section.id].includes(opt.value) : false;
                                    return (
                                        <div
                                            key={opt.value}
                                            className={`swatch-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleCheckboxChange(section.id, opt.value, 'list')}
                                        >
                                            <div
                                                className="swatch-circle"
                                                style={{
                                                    backgroundColor: opt.hex,
                                                    border: opt.value === 'white' ? '1px solid #ccc' : 'none'
                                                }}
                                            >
                                                {isSelected && <Check size={16} strokeWidth={3} className="swatch-check-icon" />}
                                            </div>
                                            <span className="swatch-label">{opt.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </div>
                </div>
            ))}
        </aside>
    );
};

export default CollectionSidebar;
