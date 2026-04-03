import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.cartItems = action.payload;
        },
        addToCart: (state, action) => {
            const { product, size, quantity = 1 } = action.payload;
            const existingItemIndex = state.cartItems.findIndex(
                (item) => item.product.id === product.id && item.size === size
            );

            if (existingItemIndex > -1) {
                state.cartItems[existingItemIndex].quantity += quantity;
            } else {
                state.cartItems.push({ product, size, quantity });
            }
        },
        removeFromCart: (state, action) => {
            const { productId, size } = action.payload;
            state.cartItems = state.cartItems.filter(
                (item) => !(item.product.id === productId && item.size === size)
            );
        },
        updateQuantity: (state, action) => {
            const { productId, size, newQuantity } = action.payload;
            if (newQuantity < 1) return;
            const item = state.cartItems.find(
                (item) => item.product.id === productId && item.size === size
            );
            if (item) {
                item.quantity = newQuantity;
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
        },
    },
});

export const { setCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;

export const selectCartTotal = (state) => {
    return state.cart.cartItems.reduce((total, item) => {
        const price = item.product.isSale ? item.product.salePrice : item.product.price;
        return total + price * item.quantity;
    }, 0);
};

export const selectCartCount = (state) => {
    return state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
};

export default cartSlice.reducer;
