// frontend/admin-panel/src/pages/DashboardPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Yeni CSS dosyasını içe aktarıyoruz
import '../css/dashboard.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
            const res = await axios.get(`${API_BASE_URL}/payment/price`);
            setPriceInfo(res.data);
        } catch (error) {
            console.error("Fiyat hatası", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
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
                            <button onClick={handleLogout} className="btn btn-link text-decoration-none text-muted">Çıkış Yap</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🏠 DASHBOARD İÇERİĞİ */}
            <div className={isExpired ? 'content-blurred' : ''}>
                
                {/* Navbar */}
                <nav className="navbar navbar-expand-lg dashboard-navbar">
                    <div className="container">
                        <a className="navbar-brand brand-text" href="#">The Room</a>
                        
                        <div className="d-flex align-items-center gap-3">
                            <div className="user-badge d-none d-md-block">
                                👤 {user?.name}
                            </div>
                            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                                Çıkış
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="container dashboard-container">
                    
                    {/* Üst Bilgi Alanı: Hoşgeldin ve Süre */}
                    <div className="row align-items-center mb-5">
                        <div className="col-md-8">
                            <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>Hoş Geldin, Yönetici 👋</h2>
                            <p className="text-muted">İşte otelinizin bugünkü durum özeti.</p>
                        </div>
                        <div className="col-md-4">
                            {/* Özel Tasarım Süre Widget'ı */}
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
                        {/* Kart 1 */}
                        <div className="col-md-4">
                            <div className="dashboard-card p-4 border-left-primary">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="card-title-custom">Yeni Rezervasyonlar</div>
                                        <div className="card-value-custom">0</div>
                                        <small className="text-success fw-bold">↑ %0</small> <small className="text-muted"> geçen haftaya göre</small>
                                    </div>
                                    <div className="bg-light p-3 rounded-circle text-primary">
                                        📅
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kart 2 */}
                        <div className="col-md-4">
                            <div className="dashboard-card p-4 border-left-success">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="card-title-custom">Müsait Odalar</div>
                                        <div className="card-value-custom">--</div>
                                        <small className="text-muted">Anlık durum</small>
                                    </div>
                                    <div className="bg-light p-3 rounded-circle text-success">
                                        key
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kart 3 */}
                        <div className="col-md-4">
                            <div className="dashboard-card p-4 border-left-warning">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="card-title-custom">Domain Adresi</div>
                                        <div className="fw-bold text-dark text-truncate" style={{maxWidth: '150px'}}>
                                            {user?.customDomain || 'Bekleniyor...'}
                                        </div>
                                        <small className="text-muted">Aktif</small>
                                    </div>
                                    <div className="bg-light p-3 rounded-circle text-warning">
                                        🌐
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alt Alan (Gelecekte Tablo vs. gelecek) */}
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="dashboard-card p-4" style={{ minHeight: '300px' }}>
                                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Son Hareketler</h5>
                                <div className="text-center text-muted py-5">
                                    <p>Henüz bir rezervasyon kaydı bulunmuyor.</p>
                                    <button className="btn btn-primary rounded-pill px-4" style={{ background: 'var(--primary-gradient)', border: 'none' }}>
                                        + Manuel Rezervasyon Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;