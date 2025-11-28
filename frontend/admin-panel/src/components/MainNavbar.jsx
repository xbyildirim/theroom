import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages'; // Dil sabitleri

const MainNavbar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [displayUser, setDisplayUser] = useState(user);

    // Navbar'da göstermek için Admin paneli dili (Şimdilik Türkçe sabit ama yapı hazır)
    const [uiLang, setUiLang] = useState(DEFAULT_LANGUAGE); 

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

    const isDashboard = location.pathname === '/dashboard';

    return (
        <nav className="navbar navbar-expand-lg dashboard-navbar mb-4">
            <div className="container">
                <a className="navbar-brand brand-text" href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                    The Room
                </a>
                
                <div className="d-flex align-items-center gap-3">
                    
                    {!isDashboard ? (
                        <button onClick={() => navigate('/dashboard')} className="btn btn-sm btn-outline-secondary">
                            ← Panele Dön
                        </button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/static-pages')} className="btn btn-link text-decoration-none text-muted d-none d-md-block">📄 Sayfalar</button>
                            <button onClick={() => navigate('/hotel-data')} className="btn btn-link text-decoration-none text-muted">🏨 Oda ve Otel</button>
                            <button onClick={() => navigate('/themes')} className="btn btn-link text-decoration-none text-muted">🎨 Temalar</button>
                            <button onClick={() => navigate('/settings')} className="btn btn-link text-decoration-none text-muted">⚙️ Ayarlar</button>
                        </>
                    )}

                    {/* 🌍 DİL SEÇİMİ (DROPDOWN) */}
                    <div className="dropdown">
                        <button className="btn btn-light btn-sm rounded-pill dropdown-toggle d-flex align-items-center gap-1 border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <span>{LANGUAGES.find(l => l.code === uiLang)?.flag}</span>
                            <span className="d-none d-md-inline">{uiLang.toUpperCase()}</span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                            {LANGUAGES.map(lang => (
                                <li key={lang.code}>
                                    <button 
                                        className={`dropdown-item d-flex align-items-center gap-2 ${uiLang === lang.code ? 'active' : ''}`}
                                        onClick={() => setUiLang(lang.code)}
                                    >
                                        <span>{lang.flag}</span>
                                        {lang.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="user-badge d-none d-md-block">
                        👤 {displayUser?.name || 'Yönetici'}
                    </div>

                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                        Çıkış
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default MainNavbar;