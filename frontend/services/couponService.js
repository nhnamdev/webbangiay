import { supabase } from './supabaseClient';

export const validateCoupon = async (code, orderTotal, userId = null) => {
    try {
        const upperCode = code.toUpperCase().trim();
        let result = { valid: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' };

        // 1. Check Public Coupon First
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', upperCode)
            .eq('is_active', true)
            .single();

        if (coupon && !error) {
            // Check Expiry (Public)
            const now = new Date();
            if (coupon.start_date && new Date(coupon.start_date) > now) {
                return { valid: false, message: 'Mã giảm giá chưa đến đợt áp dụng.' };
            }
            if (coupon.end_date && new Date(coupon.end_date) < now) {
                return { valid: false, message: 'Mã giảm giá đã hết hạn.' };
            }
            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                return { valid: false, message: 'Mã giảm giá đã hết số lượng.' };
            }
            if (orderTotal < (coupon.min_order_value || 0)) {
                return {
                    valid: false,
                    message: `Đơn hàng tối thiểu để dùng mã này là ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.min_order_value)}`
                };
            }

            let discountAmount = 0;
            if (coupon.discount_type === 'fixed') {
                discountAmount = coupon.discount_value;
            } else if (coupon.discount_type === 'percent') {
                discountAmount = (orderTotal * coupon.discount_value) / 100;
                if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                    discountAmount = coupon.max_discount_amount;
                }
            }

            return {
                valid: true,
                type: 'public',
                discount: discountAmount,
                message: `Áp dụng Coupon thành công! -${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}`,
                coupon: coupon
            };
        }

        // 2. If not public, check User Vouchers (Private)
        if (userId) {
            const { data: voucher, error: voucherError } = await supabase
                .from('user_vouchers')
                .select('*')
                .eq('code', upperCode)
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();

            if (voucher && !voucherError) {
                // Check Expiry (Private)
                if (new Date(voucher.expires_at) < new Date()) {
                    return { valid: false, message: 'Voucher đã hết hạn.' };
                }
                if (orderTotal < (voucher.min_order_value || 0)) {
                    return {
                        valid: false,
                        message: `Đơn hàng tối thiểu để dùng voucher này là ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.min_order_value)}`
                    };
                }

                // User vouchers are usually fixed amount in this system
                const discountAmount = voucher.discount_amount;

                return {
                    valid: true,
                    type: 'private',
                    discount: discountAmount,
                    message: `Áp dụng Voucher thành công! -${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}`,
                    voucher: voucher
                };
            }
        }

        return result;

    } catch (error) {
        console.error("Coupon Validation Error:", error);
        return { valid: false, message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá.' };
    }
};

export const markCouponAsUsed = async (couponCode) => {
    if (!couponCode) return;

    try {
        const { data: coupon } = await supabase.from('coupons').select('used_count').eq('code', couponCode).single();
        if (coupon) {
            await supabase
                .from('coupons')
                .update({ used_count: (coupon.used_count || 0) + 1 })
                .eq('code', couponCode);
        }
    } catch (err) {
        console.error("Error marking coupon used:", err);
    }
};
