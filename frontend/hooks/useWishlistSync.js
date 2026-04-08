

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setWishlist, selectWishlistItems } from '../redux/wishlistSlice';

const useWishlistSync = () => {
    const dispatch = useDispatch();
    const wishlistItems = useSelector(selectWishlistItems);

    useEffect(() => {
        localStorage.setItem('wishlist_redux', JSON.stringify(wishlistItems));
    }, [wishlistItems]);
};

export default useWishlistSync;
