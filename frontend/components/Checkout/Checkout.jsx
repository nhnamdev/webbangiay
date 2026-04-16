

// src/components/Checkout/Checkout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, clearCart } from '../../redux/cartSlice';
import { processPayment } from '../../services/paymentService';
import { supabase } from '../../services/supabaseClient';
import { validateCoupon, markCouponAsUsed } from '../../services/couponService';
import './Checkout.css';
import { CreditCard, Truck, Wallet, Tag, Ticket } from 'lucide-react';
import ProvinceSelector from './ProvinceSelector';

const Checkout = () => {
    const searchParams = useSearchParams();
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);
    const dispatch = useDispatch();
    const { user } = useAuth();

    // Lấy thông tin sản phẩm từ URL search params (khi mua ngay)
    const productJson = searchParams.get('product');
    const product = productJson ? JSON.parse(decodeURIComponent(productJson)) : null;
    const size = searchParams.get('size');
    const quantity = Number(searchParams.get('quantity')) || 1;
    const fromCart = searchParams.get('fromCart') === 'true';
    const selectedItemsJson = searchParams.get('selectedItems');
    const selectedItemsFromCart = selectedItemsJson ? JSON.parse(decodeURIComponent(selectedItemsJson)) : null;

    // --- LOGIC QUAN TRỌNG: Xác định danh sách sản phẩm cần thanh toán ---
    // 1. Nếu từ Cart và có danh sách chọn -> Dùng danh sách chọn
    // 2. Nếu từ Cart nhưng không có danh sách chọn (fallback) -> Dùng toàn bộ cartItems
    // 3. Nếu mua ngay (Buy Now) -> Tạo mảng chứa 1 sản phẩm
    const checkoutItems = fromCart
        ? (selectedItemsFromCart || cartItems)
        : [{ product, size, quantity }];

    // --- TÍNH LẠI TỔNG TIỀN (SUBTOTAL) ---
    // Phải tính lại dựa trên checkoutItems vì getCartTotal() trong context sẽ tính hết cả giỏ
    const subTotal = checkoutItems.reduce((total, item) => {
        const price = item.product.isSale ? item.product.salePrice : item.product.price;
        return total + (price * item.quantity);
    }, 0);
    // -------------------------------------

    // ... PHẦN CÒN LẠI GIỮ NGUYÊN ...

    // --- LOGIC MÃ GIẢM GIÁ ---
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMsg, setCouponMsg] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null); // Store full coupon obj
    const [isCouponLoading, setIsCouponLoading] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsCouponLoading(true);
        setCouponMsg('');

        const result = await validateCoupon(couponCode, subTotal, user?.id);

        setIsCouponLoading(false);
        if (result.valid) {
            if (result.type === 'public') {
                setDiscount(result.discount);
                setCouponMsg(result.message);
                setAppliedCoupon(result.coupon);
            } else if (result.type === 'private') {
                // It's a game voucher
                setSelectedVoucher(result.voucher);
                setVoucherDiscount(result.discount);
                setVoucherMsg(result.message);
                setCouponMsg("Đã áp dụng Voucher từ mã nhập!");

                // If we want to clear the 'code' input to avoid confusion? 
                // Or leave it? Leaving it shows what was entered.
            }
        } else {
            // Only clear if we were trying to set a public coupon and it failed?
            // Actually, if it failed, it failed for both.
            // But we don't want to clear an existing valid voucher if we just typed a typo?
            // Current user flow: Type code -> Click Apply -> Result.
            // If invalid, we should probably reset the "Coupon" state if it was previously set by THIS input?
            // But maybe not the "Voucher" state if it was clicked from list?
            // Let's just show error message and not aggressively clear unless necessary.

            setCouponMsg(result.message);
        }
    };

    // --- VOUCHER SELECTION HANDLER ---
    const handleSelectVoucher = (voucher) => {
        // Validate minimum order value
        if (voucher.min_order_value && subTotal < voucher.min_order_value) {
            setVoucherMsg(`Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.min_order_value)}`);
            return;
        }

        // Validate expiry
        if (new Date(voucher.expires_at) < new Date()) {
            setVoucherMsg('Voucher đã hết hạn');
            return;
        }

        setSelectedVoucher(voucher);
        setVoucherDiscount(voucher.discount_amount);
        setVoucherMsg(`Áp dụng voucher giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discount_amount)}`);
        setShowVoucherList(false);
    };

    const handleRemoveVoucher = () => {
        setSelectedVoucher(null);
        setVoucherDiscount(0);
        setVoucherMsg('');
    };

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', phone: '', detailAddress: '', province: '', email: ''
    });
    const [shippingFee, setShippingFee] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [error, setError] = useState('');

    const [availablePoints, setAvailablePoints] = useState(0);
    const [usePoints, setUsePoints] = useState(false);

    // --- VOUCHER STATE ---
    const [userVouchers, setUserVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherMsg, setVoucherMsg] = useState('');
    const [showVoucherList, setShowVoucherList] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: (user.lastName || '') + ' ' + (user.firstName || ''),
                email: user.email || '',
            }));

            // Fetch points
            const fetchPoints = async () => {
                const { data } = await supabase.from('profiles').select('points').eq('id', user.id).single();
                if (data) setAvailablePoints(data.points);
            };
            fetchPoints();

            // Fetch user vouchers
            const fetchVouchers = async () => {
                const { data, error } = await supabase
                    .from('user_vouchers')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .gte('expires_at', new Date().toISOString())
                    .order('discount_amount', { ascending: false });

                if (data && !error) {
                    setUserVouchers(data);
                }
            };
            fetchVouchers();
        }
    }, [user]);

    if ((!product && !fromCart) || checkoutItems.length === 0) return null; // Check thêm checkoutItems.length

    // Tính toán giảm giá từ điểm
    // 1 Xu = 1000 VND
    // Logic: Dùng toàn bộ xu, nhưng không vượt quá số tiền phải thanh toán
    let pointDiscount = 0;
    if (usePoints && availablePoints > 0) {
        const amountToCover = subTotal + shippingFee - discount - voucherDiscount; // Trừ cả voucher
        const maxPointValue = availablePoints * 1000;

        pointDiscount = Math.min(maxPointValue, amountToCover);
        if (pointDiscount < 0) pointDiscount = 0;
    }

    const totalAmount = subTotal + shippingFee - discount - voucherDiscount - pointDiscount;
    const finalTotal = totalAmount > 0 ? totalAmount : 0;

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleShippingChange = useCallback((data) => {
        setFormData(prev => {
            if (prev.province === data.address) return prev;
            return { ...prev, province: data.address || '' };
        });
        setShippingFee(prevFee => {
            if (prevFee === data.shippingFee) return prevFee;
            return data.shippingFee;
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.fullName || !formData.phone || !formData.detailAddress || !formData.province) {
            setError('Vui lòng điền đầy đủ thông tin giao hàng.');
            return;
        }

        setLoading(true);
        try {
            const fullAddress = `${formData.detailAddress}, ${formData.province}`;
            const orderData = {
                customer: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    address: fullAddress
                },
                items: checkoutItems.map(item => ({
                    product_id: item.product.id,
                    product_name: item.product.name,
                    price: item.product.isSale ? item.product.salePrice : item.product.price,
                    quantity: item.quantity,
                    size: item.size,
                    image: item.product.image
                })),
                sub_total: subTotal,
                shipping_fee: shippingFee,
                discount: discount,
                voucher_discount: voucherDiscount,
                voucher_code: selectedVoucher?.code || null,
                point_discount: pointDiscount,
                total_amount: finalTotal,
                payment_method: paymentMethod,
                status: 'pending'
            };

            // ... inside checkout component ...

            if (paymentMethod === 'cod') {
                await processPayment(orderData, 'cod');

                // --- XỬ LÝ TRỪ ĐIỂM NẾU CÓ DÙNG ---
                if (usePoints && pointDiscount > 0 && user) {
                    const pointsUsed = Math.ceil(pointDiscount / 1000);
                    try {
                        const { error: deductError } = await supabase.rpc('decrement_points', {
                            // Nếu không có function RPC, dùng update tay (kém an toàn hơn chút nhưng ok cho demo)
                            // Ta dùng update tay ở bước dưới cho đơn giản vì chưa tạo RPC
                        });

                        // Update tay:
                        // 1. Get curent (again for safety? or trust local?) - Trust local for speed/demo
                        const newBalance = availablePoints - pointsUsed;
                        await supabase.from('profiles').update({ points: newBalance }).eq('id', user.id);

                        // 2. Log spend transaction
                        await supabase.from('point_transactions').insert([{
                            user_id: user.id,
                            amount: -pointsUsed,
                            reason: `Dùng Xu thanh toán đơn hàng`,
                            type: 'spend'
                        }]);

                    } catch (err) {
                        console.error("Lỗi trừ điểm:", err);
                    }
                }
                // -----------------------------------

                // --- MARK VOUCHER AS USED ---
                if (selectedVoucher && user) {
                    try {
                        await supabase
                            .from('user_vouchers')
                            .update({ status: 'used', used_at: new Date().toISOString() })
                            .eq('id', selectedVoucher.id)
                            .eq('user_id', user.id);
                    } catch (err) {
                        console.error("Lỗi cập nhật voucher:", err);
                    }
                }

                // --- MARK PUBLIC COUPON AS USED ---
                if (appliedCoupon) {
                    await markCouponAsUsed(appliedCoupon.code);
                }
                // ----------------------------

                // --- TÍCH ĐIỂM THÀNH VIÊN (NEW) ---
                if (user) {
                    try {
                        // Quy đổi điểm: 10,000 VND = 1 điểm (Tương đương 3,000,000 = 300 điểm)
                        // Công thức: total_amount / 10000
                        const pointsEarned = Math.floor(finalTotal / 10000);

                        if (pointsEarned > 0) {
                            // 1. Lấy điểm hiện tại
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('points')
                                .eq('id', user.id)
                                .single();

                            const currentPoints = profile ? profile.points : 0;
                            const newPoints = currentPoints + pointsEarned;

                            // 2. Cập nhật điểm mới
                            await supabase
                                .from('profiles')
                                .update({ points: newPoints, updated_at: new Date() })
                                .eq('id', user.id);

                            // 3. Ghi lịch sử giao dịch
                            await supabase
                                .from('point_transactions')
                                .insert([
                                    {
                                        user_id: user.id,
                                        amount: pointsEarned,
                                        reason: `Tích điểm đơn hàng #${Date.now().toString().slice(-6)}`,
                                        type: 'earn'
                                    }
                                ]);

                            console.log(`Đã tích ${pointsEarned} điểm cho user ${user.id}`);
                        }
                    } catch (pointError) {
                        console.error("Lỗi tích điểm:", pointError);
                        // Không chặn luồng thanh toán chính nếu lỗi tích điểm
                    }
                }
                // ------------------------------------

                // LƯU Ý: Nếu chỉ thanh toán 1 phần, ta không nên clearCart() toàn bộ.
                // Tuy nhiên, context hiện tại của bạn chỉ có clearCart().
                // Để đơn giản, nếu mua từ giỏ (dù chọn ít hay nhiều), tạm thời ta vẫn clearCart()
                // (Hoặc bạn cần viết thêm hàm removeMultipleFromCart trong Context để chỉ xóa món đã mua)
                if (fromCart) dispatch(clearCart());

                setSuccess(true);
            } else {
                navigate(`/payment-gateway/${paymentMethod}?amount=${finalTotal}&orderId=${Date.now()}&orderInfo=${encodeURIComponent(`Thanh toan don hang ${formData.phone}`)}&fromCart=${fromCart}`);
            }
        } catch (err) {
            console.error("Checkout Error:", err);
            setError(`Có lỗi xảy ra: ${err.message || 'Vui lòng thử lại.'}`);
            // Check if it might be a connection error
            if (err.message && err.message.includes('Failed to fetch')) {
                setError('Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền.');
            }
        } finally {
            if (paymentMethod === 'cod') setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="checkout-container success-message">
                <div>
                    <h2 style={{ color: 'green' }}>Đặt hàng thành công!</h2>
                    <p>Cảm ơn bạn đã mua hàng.</p>
                    <button className="pay-btn" onClick={() => navigate('/')} style={{ marginTop: '20px', width: 'auto' }}>Tiếp tục mua sắm</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-form">
                <h2>Thông tin giao hàng</h2>
                <form id="checkoutForm" onSubmit={handleSubmit}>
                    <div className="form-group"><label>Họ và tên</label><input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleInputChange} /></div>
                    <div className="form-group"><label>Số điện thoại</label><input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} /></div>
                    <div className="form-group"><label>Email</label><input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} /></div>
                    <div className="form-group"><label>Địa chỉ chi tiết</label><input type="text" name="detailAddress" className="form-control" value={formData.detailAddress} onChange={handleInputChange} placeholder="Số nhà, đường, phường/xã..." /></div>

                    <ProvinceSelector
                        onShippingChange={handleShippingChange}
                        orderTotal={subTotal}
                        selectedProvince={formData.province}
                    />

                    <h2>Phương thức thanh toán</h2>
                    <div className="payment-methods">
                        <div className={`payment-method-item ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                            <Truck size={20} style={{ marginRight: '10px' }} /><span>COD</span>
                        </div>
                        <div className={`payment-method-item ${paymentMethod === 'momo' ? 'active' : ''}`} onClick={() => setPaymentMethod('momo')}>
                            <Wallet size={20} style={{ marginRight: '10px', color: '#af2070' }} /><span>Ví MoMo</span>
                        </div>
                        <div className={`payment-method-item ${paymentMethod === 'vnpay' ? 'active' : ''}`} onClick={() => setPaymentMethod('vnpay')}>
                            <CreditCard size={20} style={{ marginRight: '10px', color: '#005ba3' }} /><span>VNPAY-QR</span>
                        </div>
                    </div>
                </form>
            </div>

            <div className="checkout-summary">
                <h2>Đơn hàng ({checkoutItems.length} món)</h2>
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                    {checkoutItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                            <img src={item.product.image} alt={item.product.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                            <div>
                                <div style={{ fontWeight: '500' }}>{item.product.name}</div>
                                <div style={{ color: '#777', fontSize: '0.85rem' }}>Size: {item.size} x {item.quantity}</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                        (item.product.isSale ? item.product.salePrice : item.product.price) * item.quantity
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-group" style={{ marginBottom: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}><Tag size={16} /> Mã giảm giá</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập: HKTSHOES hoặc GIAM50K"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isCouponLoading}
                            style={{ whiteSpace: 'nowrap', padding: '0 15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: isCouponLoading ? 0.7 : 1 }}
                        >
                            {isCouponLoading ? 'Đang kt...' : 'Áp dụng'}
                        </button>
                    </div>
                    {couponMsg && <div style={{ fontSize: '0.85rem', marginTop: '8px', color: discount > 0 ? 'green' : 'red' }}>{couponMsg}</div>}
                </div>

                {/* Voucher from Games Section */}
                {user && userVouchers.length > 0 && (
                    <div className="form-group" style={{ marginBottom: '15px', padding: '15px', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffc107' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#856404' }}>
                            <Ticket size={16} /> Voucher từ trò chơi ({userVouchers.length})
                        </label>

                        {selectedVoucher ? (
                            <div style={{ marginTop: '10px' }}>
                                <div style={{
                                    padding: '12px',
                                    background: 'white',
                                    borderRadius: '6px',
                                    border: '2px solid #28a745',
                                    position: 'relative'
                                }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '5px' }}>
                                        {selectedVoucher.code}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        Giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedVoucher.discount_amount)}
                                    </div>
                                    {selectedVoucher.min_order_value > 0 && (
                                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '3px' }}>
                                            Đơn tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedVoucher.min_order_value)}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleRemoveVoucher}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                                {voucherMsg && <div style={{ fontSize: '0.85rem', marginTop: '8px', color: 'green' }}>{voucherMsg}</div>}
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowVoucherList(!showVoucherList)}
                                    style={{
                                        marginTop: '10px',
                                        width: '100%',
                                        padding: '10px',
                                        background: '#ffc107',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showVoucherList ? 'Ẩn danh sách' : 'Chọn voucher'}
                                </button>

                                {showVoucherList && (
                                    <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {userVouchers.map((voucher) => {
                                            const isExpired = new Date(voucher.expires_at) < new Date();
                                            const meetsMinOrder = !voucher.min_order_value || subTotal >= voucher.min_order_value;
                                            const canUse = !isExpired && meetsMinOrder;

                                            return (
                                                <div
                                                    key={voucher.id}
                                                    onClick={() => canUse && handleSelectVoucher(voucher)}
                                                    style={{
                                                        padding: '10px',
                                                        background: canUse ? 'white' : '#f0f0f0',
                                                        borderRadius: '6px',
                                                        marginBottom: '8px',
                                                        cursor: canUse ? 'pointer' : 'not-allowed',
                                                        border: canUse ? '1px solid #ddd' : '1px solid #ccc',
                                                        opacity: canUse ? 1 : 0.6,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => canUse && (e.currentTarget.style.borderColor = '#ffc107')}
                                                    onMouseLeave={(e) => canUse && (e.currentTarget.style.borderColor = '#ddd')}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                        {voucher.code}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#28a745', fontWeight: 'bold' }}>
                                                        Giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discount_amount)}
                                                    </div>
                                                    {voucher.min_order_value > 0 && (
                                                        <div style={{ fontSize: '0.75rem', color: meetsMinOrder ? '#666' : '#dc3545', marginTop: '3px' }}>
                                                            Đơn tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.min_order_value)}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '3px' }}>
                                                        HSD: {new Date(voucher.expires_at).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    {!canUse && (
                                                        <div style={{ fontSize: '0.75rem', color: '#dc3545', marginTop: '5px', fontWeight: 'bold' }}>
                                                            {isExpired ? '❌ Đã hết hạn' : '❌ Chưa đủ điều kiện'}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {voucherMsg && !selectedVoucher && <div style={{ fontSize: '0.85rem', marginTop: '8px', color: 'red' }}>{voucherMsg}</div>}
                            </>
                        )}
                    </div>
                )}

                {/* Point Redemption UI */}
                {user && (
                    <div className="form-group" style={{ marginBottom: '15px', padding: '15px', background: '#fffde7', borderRadius: '6px', border: '1px solid #FFEB3B' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#FBC02D' }}>
                                <div style={{ width: '20px', height: '20px', background: '#FBC02D', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>$</div>
                                Dùng Xu tích lũy
                            </label>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={usePoints}
                                    onChange={() => setUsePoints(!usePoints)}
                                    disabled={availablePoints <= 0}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                            Bạn có: <strong>{availablePoints} Xu</strong>
                        </div>
                        {usePoints && availablePoints > 0 && (
                            <div style={{ marginTop: '5px', fontSize: '0.85rem', color: 'green' }}>
                                Đã dùng {Math.min(availablePoints, Math.ceil((subTotal + shippingFee - discount) / 1000))} Xu
                                (-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.min(availablePoints * 1000, subTotal + shippingFee - discount))})
                            </div>
                        )}
                    </div>
                )}

                <div className="summary-row"><span>Tạm tính: </span><span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subTotal)}</span></div>

                <div className="summary-row">
                    <span>Phí vận chuyển: </span>
                    <span style={{ color: shippingFee === 0 ? 'green' : 'black', fontWeight: shippingFee === 0 ? 'bold' : 'normal' }}>
                        {shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                    </span>
                </div>

                {discount > 0 && (
                    <div className="summary-row" style={{ color: 'green' }}>
                        <span>Giảm giá (Coupon)</span>
                        <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</span>
                    </div>
                )}
                {voucherDiscount > 0 && (
                    <div className="summary-row" style={{ color: '#ff9800', fontWeight: 'bold' }}>
                        <span>Giảm giá (Voucher Game)</span>
                        <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucherDiscount)}</span>
                    </div>
                )}
                {pointDiscount > 0 && (
                    <div className="summary-row" style={{ color: '#FBC02D', fontWeight: 'bold' }}>
                        <span>Giảm giá (Xu)</span>
                        <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointDiscount)}</span>
                    </div>
                )}

                <div className="summary-total summary-row">
                    <span>Tổng cộng:</span>
                    <span style={{ color: '#d0021b' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}</span>
                </div>

                {error && <div className="error-msg">{error}</div>}
                <button type="submit" form="checkoutForm" className="pay-btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
            </div>
        </div>
    );
};

export default Checkout;