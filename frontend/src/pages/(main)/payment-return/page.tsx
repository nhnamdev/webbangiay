import { Suspense } from 'react';
import MainLayout from '@/components/MainLayout';
import PaymentReturn from '@/components/PaymentReturn/PaymentReturn';

export default function PaymentReturnPage() {
    return (
        <MainLayout>
            <Suspense fallback={null}>
                <PaymentReturn />
            </Suspense>
        </MainLayout>
    );
}
