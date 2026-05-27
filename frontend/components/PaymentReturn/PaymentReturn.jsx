import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPayOSStatus } from '../../services/paymentService';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const PaymentReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderCode = searchParams.get('orderCode');
    const [status, setStatus] = useState('checking');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderCode) {
            setStatus('fail');
            setError('Không tìm thấy mã đơn hàng');
            return;
        }

        const checkStatus = async () => {
            try {
                const result = await getPayOSStatus(orderCode);
                if (result.success && result.status === 'PAID') {
                    setStatus('success');
                } else if (result.success && result.status === 'CANCELLED') {
                    setStatus('fail');
                    setError('Đơn hàng đã bị hủy');
                } else {
                    setStatus('pending');
                }
            } catch (err) {
                setStatus('fail');
                setError('Không thể kiểm tra trạng thái thanh toán');
            }
        };

        checkStatus();
    }, [orderCode]);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f5f5f5', padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '40px', borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px', textAlign: 'center'
            }}>
                {status === 'checking' && (
                    <div>
                        <Loader2 size={60} color="#008000" style={{ animation: 'spin 1s linear infinite' }} />
                        <h3 style={{ marginTop: '20px', color: '#555' }}>Đang kiểm tra thanh toán...</h3>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <CheckCircle size={80} color="green" />
                        <h2 style={{ color: 'green', margin: '20px 0' }}>Thanh toán thành công!</h2>
                        <p>Mã đơn hàng: #{orderCode}</p>
                        <button onClick={() => navigate(`/orders/${orderCode}`)}
                            style={{ marginTop: '20px', padding: '12px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Xem chi tiết đơn hàng
                        </button>
                    </div>
                )}

                {status === 'fail' && (
                    <div>
                        <AlertTriangle size={80} color="red" />
                        <h2 style={{ color: 'red', margin: '20px 0' }}>Thanh toán thất bại</h2>
                        <p>{error}</p>
                        <button onClick={() => navigate('/checkout')}
                            style={{ marginTop: '20px', padding: '12px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Thử lại
                        </button>
                    </div>
                )}

                {status === 'pending' && (
                    <div>
                        <Loader2 size={60} color="#f0ad4e" style={{ animation: 'spin 1s linear infinite' }} />
                        <h3 style={{ marginTop: '20px', color: '#856404' }}>Đơn hàng đang chờ xử lý</h3>
                        <p>Vui lòng chờ trong giây lát...</p>
                        <button onClick={() => navigate(`/orders/${orderCode}`)}
                            style={{ marginTop: '20px', padding: '12px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            Kiểm tra đơn hàng
                        </button>
                    </div>
                )}

                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </div>
    );
};

export default PaymentReturn;
