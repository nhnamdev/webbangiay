import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const PaymentCancel = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderCode = searchParams.get('orderCode');

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f5f5f5', padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '40px', borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px', textAlign: 'center'
            }}>
                <AlertTriangle size={80} color="#f0ad4e" />
                <h2 style={{ color: '#856404', margin: '20px 0' }}>Đã hủy thanh toán</h2>
                <p>Bạn đã hủy giao dịch thanh toán.</p>
                {orderCode && <p style={{ color: '#888', fontSize: '0.9rem' }}>Mã đơn hàng: #{orderCode}</p>}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                    <button onClick={() => navigate('/checkout')}
                        style={{ padding: '12px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Quay lại thanh toán
                    </button>
                    <button onClick={() => navigate('/')}
                        style={{ padding: '12px 30px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
