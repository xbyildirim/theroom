import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 
import '../css/dashboard.css'; 

import MainNavbar from '../components/MainNavbar';
import AdSidebar from '../components/AdSidebar';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [remainingDays, setRemainingDays] = useState(null);
    const [priceInfo, setPriceInfo] = useState({ amount: 0, currency: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('hotel');
        
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                if (parsedUser?.subscription?.trialEndsAt) {
                    const trialEnds = new Date(parsedUser.subscription.trialEndsAt);
                    const now = new Date();
                    const diffTime = trialEnds - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    setRemainingDays(diffDays);

                    if (diffDays <= 0 && parsedUser.subscription.package === 'TRIAL') {
                        setIsExpired(true);
                        fetchPrice();
                    }
                }
            } catch (error) {
                console.error("Veri hatası:", error);
                localStorage.clear();
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
        setLoading(false);
    }, [navigate]);

    const fetchPrice = async () => {
        try {
            const res = await api.get('/payment/price');
            setPriceInfo(res.data);
        } catch (error) {
            console.error("Fiyat hatası", error);
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

    return (
        <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            
            {/* 🔒 ÖDEME DUVARI POP-UP */}
            {isExpired && (
                <div className="expiry-overlay">
                    <div className="card border-0 shadow-lg p-4 text-center" style={{ maxWidth: '450px', borderRadius: '25px' }}>
                        <div className="card-body">
                            <div className="display-1 mb-3">⏳</div>
                            <h2 className="fw-bold text-dark">Süreniz Doldu</h2>
                            <p className="text-muted mb-4">Panel erişiminiz kısıtlandı. Hizmete devam etmek için aboneliğinizi başlatın.</p>
                            
                            <div className="p-3 mb-4 rounded-3" style={{ background: '#f4f7fe' }}>
                                <small className="text-uppercase text-muted fw-bold">Yıllık Plan</small>
                                <div className="display-6 fw-bold text-primary">
                                    {priceInfo.amount} {priceInfo.currency}
                                </div>
                            </div>

                            <button className="btn btn-primary w-100 btn-lg rounded-pill mb-3 disabled" style={{ background: 'var(--primary-gradient)', border: 'none' }}>
                                Ödeme Yap (Yakında)
                            </button>
                            <button onClick={() => {localStorage.clear(); navigate('/login');}} className="btn btn-link text-decoration-none text-muted">Çıkış Yap</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🏠 DASHBOARD İÇERİĞİ */}
            <div className={isExpired ? 'content-blurred' : ''}>
                
                <MainNavbar user={user} />

                <div className="container dashboard-container">
                    <div className="row">
                        <div className="col-lg-8">
                            {/* Üst Bilgi */}
                            <div className="row align-items-center mb-5">
                                <div className="col-md-7">
                                    <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>Hoş Geldin, Yönetici 👋</h2>
                                    <p className="text-muted">İşte otelinizin bugünkü durum özeti.</p>
                                </div>
                                <div className="col-md-5">
                                    <div className="days-left-widget">
                                        <span className="days-label">Deneme Süresi</span>
                                        <span className={`days-count ${remainingDays <= 5 ? 'status-danger' : 'status-safe'}`}>
                                            {remainingDays !== null ? (remainingDays > 0 ? remainingDays : 0) : '-'} <span style={{fontSize:'1rem'}}>Gün</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* İstatistik Kartları */}
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="dashboard-card p-4 border-left-primary">
                                        <div className="card-title-custom">Rezervasyonlar</div>
                                        <div className="card-value-custom">0</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="dashboard-card p-4 border-left-success">
                                        <div className="card-title-custom">Müsait Odalar</div>
                                        <div className="card-value-custom">--</div>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="dashboard-card p-4" style={{ minHeight: '300px' }}>
                                        <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Son Hareketler</h5>
                                        <div className="text-center text-muted py-5">
                                            <p>Henüz bir rezervasyon kaydı bulunmuyor.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> 

                        <div className="col-lg-4">
                            <AdSidebar />
                        </div>
                    </div> 
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;