import { supabase } from './supabaseClient';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm helper tạo chuỗi ngẫu nhiên (giả lập mã giao dịch)
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

    // 1. Giả lập xác suất lỗi (Demo thì comment lại)
    let status = 'pending'; // Mặc định
    let paymentStatus = 'unpaid';

    // Logic giả lập phản hồi từ cổng thanh toán
    if (method === 'cod') {
        status = 'pending'; // Đơn hàng tạo xong, chờ giao
        paymentStatus = 'cod_pending';
    }
    else if (method === 'momo' || method === 'vnpay') {
        // Giả sử callback trả về thành công
        status = 'processing'; // Đang xử lý đóng gói
        paymentStatus = 'paid';
    }

    // Tạo mã giao dịch giả cho đẹp
    const transactionId = method === 'vnpay' ? `VNP${generateRandomString(8)}` : (method === 'momo' ? `MOMO${generateRandomString(10)}` : null);

    // Chuẩn bị dữ liệu order để lưu vào Supabase
    const newOrder = {
        ...orderData, // customer, items, sub_total, shipping_fee, total_amount...
        status: status, // pending | processing
        payment_method: method, // cod | momo | vnpay

        payment_info: {
            method: method,
            status: paymentStatus,
            transaction_id: transactionId,
            paid_at: method !== 'cod' ? new Date().toISOString() : null
        }
    };


    try {
        console.log("Saving order to Supabase...");

        const { data, error } = await supabase
            .from('orders')
            .insert(newOrder)
            .select() // Trả về dòng vừa insert
            .single();

        if (error) {
            throw new Error(`Supabase Error: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Payment Service Error:", error);
        throw error;
    }
};