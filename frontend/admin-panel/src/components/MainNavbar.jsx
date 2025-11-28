import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MainNavbar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Kullanıcı prop olarak gelmezse (sayfa yüklenirken), localStorage'dan okumayı dene
    const [displayUser, setDisplayUser] = useState(user);

    useEffect(() => {
        if (user) {
            setDisplayUser(user);
        } else {
            const storedUser = localStorage.getItem('hotel');
            if (storedUser) {
                setDisplayUser(JSON.parse(storedUser));
            }
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Şu an Dashboard sayfasında mıyız?
    const isDashboard = location.pathname === '/dashboard';

    return (
        <nav className="navbar navbar-expand-lg dashboard-navbar mb-4">
            <div className="container">
                {/* Logo / Marka */}
                <a 
                    className="navbar-brand brand-text" 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
                >
                    The Room
                </a>
                
                {/* Sağ Taraf Menü Öğeleri */}
                <div className="d-flex align-items-center gap-3">
                    
                    {/* --- DURUMA GÖRE DEĞİŞEN BUTONLAR --- */}

                    {!isDashboard ? (
                        // 1. Dashboard'da DEĞİLSEK: "Panele Dön" butonu göster
                        <button onClick={() => navigate('/dashboard')} className="btn btn-sm btn-outline-secondary">
                            ← Panele Dön
                        </button>
                    ) : (
                        // 2. Dashboard'da İSEK: Diğer menü linklerini göster
                        <>
                            <button onClick={() => navigate('/static-pages')} className="btn btn-link text-decoration-none text-muted d-none d-md-block">
                                📄 Statik Sayfalar
                            </button>
                            <button onClick={() => navigate('/settings')} className="btn btn-link text-decoration-none text-muted">
                                ⚙️ Ayarlar
                            </button>
                        </>
                    )}

                    {/* --- SABİT ÖĞELER --- */}
                    
                    {/* Kullanıcı Rozeti */}
                    <div className="user-badge d-none d-md-block">
                        👤 {displayUser?.name || 'Yönetici'}
                    </div>

                    {/* Çıkış Butonu */}
                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                        Çıkış
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default MainNavbar;