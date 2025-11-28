import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/dashboard.css';
import MainNavbar from '../components/MainNavbar';

const ThemeListPage = () => {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    // --- YENİ TEMA MODAL STATE ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newThemeName, setNewThemeName] = useState('');

    // --- SİLME ONAY MODAL STATE (YENİ) ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [themeToDelete, setThemeToDelete] = useState(null); // Silinecek temanın ID'si

    useEffect(() => {
        const storedUser = localStorage.getItem('hotel');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        try {
            const res = await api.get('/themes');
            setThemes(res.data);
        } catch (error) {
            console.error('Temalar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTheme = async (e) => {
        e.preventDefault();
        if (!newThemeName.trim()) return;

        try {
            const res = await api.post('/themes', { name: newThemeName });
            setThemes([res.data, ...themes]); 
            setNewThemeName('');
            setShowCreateModal(false);
        } catch (error) {
            alert('Tema oluşturulamadı.');
        }
    };

    const toggleActive = async (theme) => {
        if (theme.isActive) return;
        try {
            await api.put(`/themes/${theme._id}`, { isActive: true });
            fetchThemes(); 
        } catch (error) {
            alert('Durum değiştirilemedi.');
        }
    };

    // 1. Silme Butonuna Basılınca Çalışan Fonksiyon
    const openDeleteModal = (id) => {
        setThemeToDelete(id);
        setShowDeleteModal(true);
    };

    // 2. Modaldaki "Evet, Sil" Butonuna Basılınca Çalışan Fonksiyon
    const confirmDelete = async () => {
        if (!themeToDelete) return;

        try {
            await api.delete(`/themes/${themeToDelete}`);
            setThemes(themes.filter(t => t._id !== themeToDelete));
            setShowDeleteModal(false);
            setThemeToDelete(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Silinemedi.');
            setShowDeleteModal(false); // Hata olsa da modalı kapat
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            <MainNavbar user={user} />

            <div className="container pb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold m-0" style={{ color: 'var(--text-main)' }}>Tema Yönetimi</h3>
                    <button 
                        className="btn btn-primary rounded-pill px-4 fw-bold"
                        onClick={() => setShowCreateModal(true)}
                        style={{ background: 'var(--primary-gradient)', border: 'none' }}
                    >
                        + Yeni Tema
                    </button>
                </div>

                {loading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                ) : (
                    <div className="row g-4">
                        {themes.map((theme) => (
                            <div className="col-md-6 col-lg-4" key={theme._id}>
                                <div className={`dashboard-card p-4 h-100 ${theme.isActive ? 'border-left-success' : 'border-left-primary'}`} style={{ position: 'relative' }}>
                                    
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h5 className="fw-bold mb-1">{theme.name}</h5>
                                            <span className={`badge ${theme.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                {theme.isActive ? 'Yayında' : 'Pasif'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '2rem' }}>🎨</div>
                                    </div>

                                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                                        {!theme.isActive && (
                                            <button 
                                                onClick={() => toggleActive(theme)}
                                                className="btn btn-sm btn-outline-success flex-grow-1"
                                            >
                                                Yayına Al
                                            </button>
                                        )}

                                        <button className="btn btn-sm btn-outline-primary flex-grow-1">
                                            Düzenle
                                        </button>

                                        {!theme.isActive && (
                                            <button 
                                                onClick={() => openDeleteModal(theme._id)} // Burayı değiştirdik
                                                className="btn btn-sm btn-outline-danger"
                                                title="Temayı Sil"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}
                        
                        {themes.length === 0 && (
                            <div className="col-12 text-center text-muted py-5">
                                <p>Henüz hiç temanız yok. Yeni bir tane oluşturun!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- YENİ TEMA OLUŞTURMA MODALI --- */}
            {showCreateModal && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="card shadow-lg p-4" style={{ width: '400px', borderRadius: '15px' }}>
                        <h4 className="fw-bold mb-3">Yeni Tema Oluştur</h4>
                        <form onSubmit={handleCreateTheme}>
                            <div className="mb-3">
                                <label className="form-label small text-muted fw-bold">TEMA ADI</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Örn: Yaz Konsepti" 
                                    value={newThemeName}
                                    onChange={(e) => setNewThemeName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary" disabled={!newThemeName.trim()}>Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- SİLME ONAY MODALI (YENİ) --- */}
            {showDeleteModal && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                    <div className="card shadow-lg p-4 text-center" style={{ width: '350px', borderRadius: '20px' }}>
                        <div className="mb-3 text-danger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="bi bi-exclamation-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0l-.35-3.507z"/>
                            </svg>
                        </div>
                        <h4 className="fw-bold mb-2">Emin misiniz?</h4>
                        <p className="text-muted small mb-4">
                            Bu temayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        
                        <div className="d-flex gap-2 justify-content-center">
                            <button 
                                className="btn btn-light rounded-pill px-4" 
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Vazgeç
                            </button>
                            <button 
                                className="btn btn-danger rounded-pill px-4" 
                                onClick={confirmDelete}
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ThemeListPage;