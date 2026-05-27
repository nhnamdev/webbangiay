
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import LuckyWheel from '@/components/Rewards/LuckyWheel';

export default function LuckyWheelPage() {
    const navigate = useNavigate();
    return (
        <MainLayout>
            <LuckyWheel onClose={() => navigate(-1)} onSpinComplete={() => {}} />
        </MainLayout>
    );
}
