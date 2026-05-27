import { Suspense } from 'react';
import MainLayout from '@/components/MainLayout';
import PaymentCancel from '@/components/PaymentReturn/PaymentCancel';

export default function PaymentCancelPage() {
    return (
        <MainLayout>
            <Suspense fallback={null}>
                <PaymentCancel />
            </Suspense>
        </MainLayout>
    );
}
