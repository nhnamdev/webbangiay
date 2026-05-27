import { post } from './http';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const processPayment = async (orderData, method) => {
    await delay(1500);

    let status = 'pending';
    let paymentStatus = 'unpaid';

    if (method === 'cod') {
        status = 'pending';
        paymentStatus = 'cod_pending';
    } else if (method === 'momo' || method === 'vnpay') {
        status = 'processing';
        paymentStatus = 'paid';
    }

    const transactionId = method === 'vnpay'
        ? `VNP${generateRandomString(8)}`
        : (method === 'momo' ? `MOMO${generateRandomString(10)}` : null);

    const { customer, orderItems, discountAmount, couponCode, ...rest } = orderData || {};

    const newOrder = {
        ...rest,
        items: orderItems ? JSON.stringify(orderItems) : '[]',
        customer: customer ? JSON.stringify(customer) : null,
        paymentInfo: JSON.stringify({
            method,
            status: paymentStatus,
            transaction_id: transactionId,
            paid_at: method !== 'cod' ? new Date().toISOString() : null,
        }),
        status,
        paymentMethod: method,
        discount: discountAmount ?? 0,
        voucherCode: couponCode ?? null,
    };

    delete newOrder.user;
    delete newOrder.email;
    delete newOrder.shippingAddress;

    try {
        return await post('/orders', newOrder);
    } catch (error) {
        console.error('Payment Service Error:', error.message);
        throw error;
    }
};
