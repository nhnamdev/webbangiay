

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';
import { AuthProvider } from '../../context/AuthContext';
import { LanguageProvider } from '../../context/LanguageContext';
import CartSyncWrapper from './CartSyncWrapper';
import WishlistSyncWrapper from './WishlistSyncWrapper';
import AosWrapper from './AosWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Tránh refetch tự động khi quay lại tab
            staleTime: 5 * 60 * 1000,    // Cân nhắc dữ liệu mới trong vòng 5 phút
        },
    },
});

const Providers = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    );
};

export default Providers;
