import { get, post } from './http';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const processPayment = async (orderData, method) => {
    await delay(1500);

    let status = 'pending';
    let paymentStatus = 'unpaid';

    if (method === 'cod') {
        status = 'pending';
        paymentStatus = 'cod_pending';
    } else if (method === 'payos') {
        status = 'pending';
        paymentStatus = 'pending';
    }

    const transactionId = null;

    const { customer, orderItems, couponCode, subTotal, shippingFee, totalAmount, discount: discountAmt, voucherDiscount: vd, pointDiscount: pd, ..._rest } = orderData || {};

    const newOrder = {
        ..._rest,
        sub_total: Number(subTotal) || 0,
        shipping_fee: Number(shippingFee) || 0,
        total_amount: Number(totalAmount) || 0,
        items: orderItems ? JSON.stringify(orderItems) : '[]',
        customer: customer ? JSON.stringify(customer) : null,
        payment_info: JSON.stringify({
            method,
            status: paymentStatus,
            transaction_id: transactionId,
            paid_at: method !== 'cod' ? new Date().toISOString() : null,
        }),
        payment_method: method,
        discount: Number(discountAmt) || 0,
        voucher_code: couponCode ?? null,
        voucher_discount: Number(vd) || 0,
        point_discount: Number(pd) || 0,
    };

    try {
        return await post('/orders', newOrder);
    } catch (error) {
        console.error('Payment Service Error:', error.message);
        throw error;
    }
};

export const createPayOSPayment = async (orderId) => {
    try {
        return await post('/payments/payos/create', { orderId });
    } catch (error) {
        console.error('PayOS Create Error:', error.message);
        throw error;
    }
};

export const getPayOSStatus = async (orderCode) => {
    try {
        return await get(`/payments/payos/status/${orderCode}`);
    } catch (error) {
        console.error('PayOS Status Error:', error.message);
        throw error;
    }
};
