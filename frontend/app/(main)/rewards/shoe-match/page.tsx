
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import ShoeMatchGame from '@/components/Rewards/ShoeMatchGame';

export default function ShoeMatchPage() {
    const navigate = useNavigate();
    return (
        <MainLayout>
            <ShoeMatchGame onClose={() => navigate(-1)} />
        </MainLayout>
    );
}
