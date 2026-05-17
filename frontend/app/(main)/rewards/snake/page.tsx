
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import SnakeGame from '@/components/Rewards/SnakeGame';

export default function SnakePage() {
    const navigate = useNavigate();
    return (
        <MainLayout>
            <SnakeGame onClose={() => navigate(-1)} />
        </MainLayout>
    );
}
