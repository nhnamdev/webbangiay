import { get, post, patch } from './http';

const orderService = {
    getOrdersByUser: async (email) => {
        try {
            return await get('/orders/by-email', { params: { email } });
        } catch (error) {
            console.error('Error fetching orders:', error.message);
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            return await get(`/orders/${id}`);
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error.message);
            throw error;
        }
    },

    createOrder: async (orderData) => {
        try {
            return await post('/orders', orderData);
        } catch (error) {
            console.error('Error creating order:', error.message);
            throw error;
        }
    },

    cancelOrder: async (id, reason) => {
        try {
            return await patch(`/orders/${id}/status`, { status: 'cancelled', reason });
        } catch (error) {
            console.error(`Error cancelling order ${id}:`, error.message);
            throw error;
        }
    },
};

export default orderService;
