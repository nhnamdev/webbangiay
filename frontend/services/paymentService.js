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

    // Tách riêng customer object ra khỏi orderData để không gửi field lạ vào backend
    const { customer, ...cleanOrderData } = orderData || {};

    const newOrder = {
        ...cleanOrderData,
        status,
        paymentMethod: method,
        email: customer?.email || orderData?.email,
        customerJson: customer ? JSON.stringify(customer) : null,
        paymentInfoJson: JSON.stringify({
            method,
            status: paymentStatus,
            transaction_id: transactionId,
            paid_at: method !== 'cod' ? new Date().toISOString() : null,
        }),
    };

    try {
        return await post('/orders', newOrder);
    } catch (error) {
        console.error('Payment Service Error:', error.message);
        throw error;
    }
};
