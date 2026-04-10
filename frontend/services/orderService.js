
import { supabase } from './supabaseClient';

const orderService = {
    getOrdersByUser: async (email) => {
        try {
            // Using the new 'email' column for filtering
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                // Fallback: Filter using JSONB containment since 'email' column might be missing
                .contains('customer', { email: email })
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    createOrder: async (orderData) => {
        try {
            // Ensure email is extracted from customer data and added to the top-level column
            const orderPayload = {
                ...orderData,
                email: orderData.customer?.email
            };

            const { data, error } = await supabase.from('orders').insert([orderPayload]).select();
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    cancelOrder: async (id, reason) => {
        try {
            // First get the current payment_info to avoid overwriting it
            const { data: currentOrder, error: fetchError } = await supabase
                .from('orders')
                .select('payment_info')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            const updatedPaymentInfo = {
                ...currentOrder.payment_info,
                cancellation_reason: reason,
                cancelled_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('orders')
                .update({
                    status: 'cancelled',
                    payment_info: updatedPaymentInfo
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error(`Error cancelling order ${id}:`, error);
            throw error;
        }
    }
};

export default orderService;
