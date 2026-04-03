import { createSlice } from '@reduxjs/toolkit';

const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem('wishlist_redux');
        if (stored) return JSON.parse(stored);

        // Migration fallback
        const oldStored = localStorage.getItem('wishlist');
        if (oldStored) return JSON.parse(oldStored);
    } catch (e) {
        console.error("Could not load wishlist", e);
    }
    return [];
};

const initialState = {
    wishlistItems: loadFromLocalStorage(),
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlist: (state, action) => {
            state.wishlistItems = action.payload;
        },
        toggleWishlist: (state, action) => {
            const productId = action.payload;
            const index = state.wishlistItems.indexOf(productId);
            if (index >= 0) {
                // Remove
                state.wishlistItems.splice(index, 1);
            } else {
                // Add
                state.wishlistItems.push(productId);
            }
        },
        clearWishlist: (state) => {
            state.wishlistItems = [];
        }
    },
});

export const { setWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.wishlistItems;

export const selectIsInWishlist = (state, productId) => state.wishlist.wishlistItems.includes(productId);

export default wishlistSlice.reducer;
