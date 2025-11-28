// frontend/admin-panel/src/pages/DashboardPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdSidebar from '../components/AdSidebar';
import api from '../api';

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
            // api.get kullanıyoruz
            const res = await api.get('/payment/price');
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
            
            {/* ... Pop-up kodları (Aynı kalacak) ... */}

            <div className={isExpired ? 'content-blurred' : ''}>
                
                {/* Navbar (Ayarlar Linki Eklendi) */}
                <nav className="navbar navbar-expand-lg dashboard-navbar">
                    <div className="container">
                        <a className="navbar-brand brand-text" href="#">The Room</a>
                        <div className="d-flex align-items-center gap-3">
                            {/* Ayarlar Butonu */}
                            <button onClick={() => navigate('/settings')} className="btn btn-link text-decoration-none text-muted">
                                ⚙️ Ayarlar
                            </button>
                            <div className="user-badge d-none d-md-block">👤 {user?.name}</div>
                            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">Çıkış</button>
                        </div>
                    </div>
                </nav>

                <div className="container dashboard-container">
                    
                    {/* GRID SİSTEMİ BAŞLIYOR */}
                    <div className="row">
                        
                        {/* SOL TARA (ANA İÇERİK) - Genişlik: 8 birim */}
                        <div className="col-lg-12">
                            
                            {/* Üst Bilgi ve İstatistikler (Eski kodunuzdaki içerik buraya) */}
                            <div className="row align-items-center mb-5">
                                <div className="col-md-7">
                                    <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>Hoş Geldin, Yönetici 👋</h2>
                                    <p className="text-muted">İşte otelinizin bugünkü durum özeti.</p>
                                </div>
                                <div className="col-md-5">
                                     {/* Eski Widget Kodu */}
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
                                {/* Kartlar (Kod tekrarı olmasın diye kısa yazıyorum, eski kartlarınızı buraya koyun) */}
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

                            {/* Alt Alan */}
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="dashboard-card p-4" style={{ minHeight: '300px' }}>
                                        <h5 className="fw-bold mb-4">Son Hareketler</h5>
                                        <div className="text-center text-muted py-5">
                                            <p>Kayıt bulunamadı.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div> {/* SOL TARA BİTİŞ */}


                        {/* SAĞ TARAF (REKLAM ALANI) - Genişlik: 4 birim */}
                        <div className="col-lg-4 d-none">
                            <AdSidebar />
                        </div>

                    </div> {/* ROW BİTİŞ */}

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;