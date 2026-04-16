

// src/components/Checkout/ProvinceSelector.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getProvinces, calculateShipping } from '../../services/mapService';
import { MapPin, Truck } from 'lucide-react';

const ProvinceSelector = ({ onShippingChange, orderTotal, selectedProvince: initialProvince }) => {
    const [provinces, setProvinces] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(initialProvince || '');
    const [loading, setLoading] = useState(false);

    // New State for options
    const [shippingData, setShippingData] = useState(null); // { distance, options }
    const [selectedOptionId, setSelectedOptionId] = useState('standard');

    useEffect(() => {
        getProvinces().then(data => setProvinces(data));
    }, []);

    useEffect(() => {
        if (initialProvince && initialProvince !== selectedProvince) {
            setSelectedProvince(initialProvince);
        }
    }, [initialProvince]);

    const fetchShippingFee = useCallback(async (provinceName, total) => {
        if (!provinceName) {
            setShippingData(null);
            onShippingChange({ address: '', shippingFee: 0, distance: 0 });
            return;
        }

        setLoading(true);
        try {
            const info = await calculateShipping(provinceName, total);

            // info = { distance: 123, options: [...] }
            setShippingData(info);

            // Tự động chọn option đầu tiên (thường là standard) hoặc giữ lại option cũ nếu vẫn valid?
            // Đơn giản nhất: Reset về standard mỗi khi đổi địa chỉ hoặc tính lại giá
            const defaultOpt = info.options.find(o => o.id === 'standard') || info.options[0];
            setSelectedOptionId(defaultOpt.id);

            onShippingChange({
                address: provinceName,
                shippingFee: defaultOpt.fee,
                distance: info.distance
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [onShippingChange]);

    const handleSelectChange = (e) => {
        const provinceName = e.target.value;
        setSelectedProvince(provinceName);
    };

    // Khi người dùng chọn phương thức vận chuyển khác (Standard / Express)
    const handleOptionChange = (optId) => {
        if (!shippingData) return;

        setSelectedOptionId(optId);
        const opt = shippingData.options.find(o => o.id === optId);
        if (opt) {
            onShippingChange({
                address: selectedProvince,
                shippingFee: opt.fee,
                distance: shippingData.distance
            });
        }
    };

    useEffect(() => {
        if (selectedProvince) {
            const timer = setTimeout(() => {
                fetchShippingFee(selectedProvince, orderTotal);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [orderTotal, selectedProvince, fetchShippingFee]);

    return (
        <div className="form-group">
            <label>Tỉnh / Thành phố (Tính phí vận chuyển)</label>
            <div style={{ position: 'relative' }}>
                <select
                    className="form-control"
                    value={selectedProvince}
                    onChange={handleSelectChange}
                >
                    <option value="">-- Chọn Tỉnh/Thành --</option>
                    {provinces.map((p, index) => (
                        <option key={p.name || index} value={p.name}>{p.name}</option>
                    ))}
                </select>
                <MapPin size={18} style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            </div>

            {loading && <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>Đang tính lại phí vận chuyển...</div>}

            {!loading && shippingData && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}>
                    <div style={{ marginBottom: '5px', fontSize: '0.85rem', color: '#555' }}>
                        Khoảng cách: {shippingData.distance}km (Từ kho Linh Xuân)
                    </div>

                    {shippingData.options.map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => handleOptionChange(opt.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px',
                                marginBottom: '5px',
                                border: selectedOptionId === opt.id ? '1px solid #0050b3' : '1px solid #eee',
                                backgroundColor: selectedOptionId === opt.id ? '#e6f7ff' : '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="radio"
                                    checked={selectedOptionId === opt.id}
                                    onChange={() => handleOptionChange(opt.id)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>
                                        {opt.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                        Dự kiến: {opt.estimatedDays}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: opt.fee === 0 ? 'green' : '#d0021b' }}>
                                {opt.fee === 0
                                    ? 'MIỄN PHÍ'
                                    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(opt.fee)
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProvinceSelector;