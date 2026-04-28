

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';
import { AuthProvider } from '../../context/AuthContext';
import { LanguageProvider } from '../../context/LanguageContext';
import CartSyncWrapper from './CartSyncWrapper';
import WishlistSyncWrapper from './WishlistSyncWrapper';
import AosWrapper from './AosWrapper';

const Providers = ({ children }) => {
    return (
        <Provider store={store}>
            <AuthProvider>
                <LanguageProvider>
                    <CartSyncWrapper />
                    <WishlistSyncWrapper />
                    <AosWrapper />
                    {children}
                </LanguageProvider>
            </AuthProvider>
        </Provider>
    );
};

export default Providers;
