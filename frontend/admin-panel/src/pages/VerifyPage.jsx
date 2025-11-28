import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VerifyPage = () => {
    const [status, setStatus] = useState('Doğrulama işlemi başlatılıyor...');
    const [statusType, setStatusType] = useState('info'); // info, success, danger
    const location = useLocation();
    const navigate = useNavigate();
    const [isRequestSent, setIsRequestSent] = useState(false); 

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
            setStatus('❌ Doğrulama linki eksik veya hatalı.');
            setStatusType('danger');
            return;
        }
        
        if (isRequestSent) return; 

        const verifyAccount = async () => {
            setIsRequestSent(true); 
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/verify?token=${token}`);
                setStatus('✅ ' + response.data.message);
                setStatusType('success');
                setTimeout(() => { navigate('/login', { replace: true }); }, 3000);
            } catch (error) {
                setStatus('❌ ' + (error.response?.data?.message || 'Hata oluştu.'));
                setStatusType('danger');
            }
        };

        verifyAccount();
    }, [location.search, isRequestSent]); 

    return (
        <div className="auth-wrapper">
            <div className="card card-custom p-4 text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="card-body">
                    {statusType === 'info' && <div className="spinner-border text-primary mb-3" role="status"></div>}
                    {statusType === 'success' && <div className="display-4 text-success mb-3">🎉</div>}
                    {statusType === 'danger' && <div className="display-4 text-danger mb-3">⚠️</div>}
                    
                    <h5 className={`card-title text-${statusType}`}>Doğrulama Durumu</h5>
                    <p className="card-text mt-3">{status}</p>
                    
                    {statusType === 'success' && <p className="text-muted small">Giriş sayfasına yönlendiriliyorsunuz...</p>}
                    {statusType === 'danger' && <button onClick={() => navigate('/login')} className="btn btn-outline-secondary btn-sm mt-3">Giriş Sayfasına Dön</button>}
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;