// frontend/admin-panel/src/pages/DashboardPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // LocalStorage'dan kullanıcı bilgisini çek
        const storedUser = localStorage.getItem('hotel');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        // 1. Token ve kullanıcı verisini temizle
        localStorage.removeItem('token');
        localStorage.removeItem('hotel');
        
        // 2. Login sayfasına yönlendir
        navigate('/login');
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">The Room Panel</a>
                    <div className="d-flex">
                        <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </nav>

            {/* İçerik */}
            <div className="container mt-5">
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title">Hoş Geldiniz, {user ? user.name : 'Yönetici'}!</h2>
                        <p className="card-text text-muted">
                            Domain: <strong>{user?.customDomain || 'Henüz ayarlanmadı'}</strong>
                        </p>
                        <hr />
                        <div className="alert alert-info">
                            <h4 className="alert-heading">Panel Başlangıcı</h4>
                            <p>Burası otel yönetim panelinizin ana sayfasıdır. Sol tarafa menüler, buraya da istatistikler gelecek.</p>
                        </div>
                        
                        <div className="row mt-4">
                            <div className="col-md-4">
                                <div className="card text-white bg-primary mb-3">
                                    <div className="card-header">Rezervasyonlar</div>
                                    <div className="card-body">
                                        <h5 className="card-title">0 Yeni</h5>
                                        <p className="card-text">Bugün gelen rezervasyonlar.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-white bg-success mb-3">
                                    <div className="card-header">Müsait Odalar</div>
                                    <div className="card-body">
                                        <h5 className="card-title">12 Oda</h5>
                                        <p className="card-text">Şu an kiralanabilir odalar.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card text-white bg-warning mb-3">
                                    <div className="card-header">Temizlik</div>
                                    <div className="card-body">
                                        <h5 className="card-title">3 Oda</h5>
                                        <p className="card-text">Temizlik bekleyen odalar.</p>
                                    </div>
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