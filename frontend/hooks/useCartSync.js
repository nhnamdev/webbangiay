

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { setCart, selectCartItems } from '../redux/cartSlice';

const useCartSync = () => {
    const { user } = useAuth();
    const cartItems = useSelector(selectCartItems);
    const dispatch = useDispatch();

    // Load cart when user changes
    useEffect(() => {
        if (user) {
            try {
                const userCartKey = `cartItems_${user.email || user.id}`;
                const storedCart = localStorage.getItem(userCartKey);
                if (storedCart) {
                    dispatch(setCart(JSON.parse(storedCart)));
                } else {
                    dispatch(setCart([]));
                }
            } catch (error) {
                console.error("Failed to load cart", error);
                dispatch(setCart([]));
            }
        } else {
            dispatch(setCart([]));
        }
    }, [user, dispatch]);

    // Save cart when cartItems changes
    useEffect(() => {
        if (user && cartItems.length >= 0) {
            const userCartKey = `cartItems_${user.email || user.id}`;
            localStorage.setItem(userCartKey, JSON.stringify(cartItems));
        }
    }, [cartItems, user]);
};

export default useCartSync;
