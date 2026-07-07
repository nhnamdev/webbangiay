import { post } from './http';

export const validateCoupon = async (code, orderTotal, userId = null) => {
    try {
        const data = await post('/coupons/validations', { code, orderTotal, userId });
        return data;
    } catch (error) {
        console.error('Coupon Validation Error:', error.message);
        return { valid: false, message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá.' };
    }
};

export const markCouponAsUsed = async (couponCode) => {
    if (!couponCode) return;
    try {
        await post(`/coupons/${couponCode}/usages`);
    } catch (err) {
        console.error('Error marking coupon used:', err.message);
    }
};
