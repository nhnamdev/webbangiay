import { Suspense } from 'react';
import MainLayout from '@/components/MainLayout';
import SearchPage from '@/components/Search/SearchPage';

export default function SearchResultPage() {
    return (
        <MainLayout>
            <Suspense fallback={null}>
                <SearchPage />
            </Suspense>
        </MainLayout>
    );
}
