import { Suspense } from 'react';
import MainLayout from '@/components/MainLayout';
import Checkout from '@/components/Checkout/Checkout';

export default function CheckoutPage() {
    return (
        <MainLayout>
            <Suspense fallback={null}>
                <Checkout />
            </Suspense>
        </MainLayout>
    );
}
