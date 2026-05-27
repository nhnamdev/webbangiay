
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import TetrisGame from '@/components/Rewards/TetrisGame';

export default function TetrisPage() {
    const navigate = useNavigate();
    return (
        <MainLayout>
            <TetrisGame onClose={() => navigate(-1)} />
        </MainLayout>
    );
}
