import { Suspense } from 'react';
import MainLayout from '@/components/MainLayout';
import PaymentGateway from '@/components/Payment/PaymentGateway';

export default function PaymentGatewayPage() {
    return (
        <MainLayout>
            <Suspense fallback={null}>
                <PaymentGateway />
            </Suspense>
        </MainLayout>
    );
}
