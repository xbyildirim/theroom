import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/dashboard.css';
import MainNavbar from '../components/MainNavbar';
import LanguageTabs from '../components/LanguageTabs';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';

const ThemeSettingsPage = () => {
    const [user, setUser] = useState(null);
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANGUAGE);
    
    // --- VERİ STATE'LERİ ---
    const [siteSettings, setSiteSettings] = useState({
        siteTitle: {}, description: {}, keywords: {},
        logo: '', favicon: ''
    });
    const [pages, setPages] = useState([]);
    const [pageMappings, setPageMappings] = useState({
        homePage: '', contactPage: '', roomsPage: '', aboutPage: ''
    });

    // --- MODAL KONTROL STATE'LERİ ---
    const [showSeoModal, setShowSeoModal] = useState(false);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [showAddPageModal, setShowAddPageModal] = useState(false);
    
    // 🗑️ SİLME ONAY MODALI İÇİN STATE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pageToDelete, setPageToDelete] = useState(null);

    // --- FORM STATE'LERİ ---
    const [newPageName, setNewPageName] = useState('');
    const [newPageSlug, setNewPageSlug] = useState('');
    
    // --- BİLDİRİM STATE ---
    const [status, setStatus] = useState({ show: false, msg: '', type: 'success' });

    useEffect(() => {
        const storedUser = localStorage.getItem('hotel');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (parsed.siteSettings) {
                setSiteSettings(prev => ({ ...prev, ...parsed.siteSettings }));
                if (parsed.siteSettings.pageMappings) {
                    setPageMappings(parsed.siteSettings.pageMappings);
                }
            }
        }
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await api.get('/website-pages');
            setPages(res.data);
        } catch (error) { console.error('Sayfalar yüklenemedi'); }
    };

    const showMsg = (msg, type = 'success') => {
        setStatus({ show: true, msg, type });
        setTimeout(() => setStatus({ show: false, msg: '', type: 'success' }), 2500);
    };

    // --- HANDLERS ---

    const handleSeoChange = (field, value) => {
        setSiteSettings(prev => ({
            ...prev,
            [field]: { ...prev[field], [currentLang]: value }
        }));
    };

    // SEO & Genel Ayarları Kaydet
    const handleSaveGeneral = async () => {
        try {
            const updateData = { 
                siteSettings: {
                    ...siteSettings,
                    pageMappings: pageMappings
                }
            };
            const res = await api.put('/auth/update-site-settings', updateData);
            
            // LocalStorage güncelle
            const updatedUser = { ...user, siteSettings: res.data.hotel.siteSettings };
            localStorage.setItem('hotel', JSON.stringify(updatedUser));
            setUser(updatedUser);

            showMsg('Ayarlar başarıyla kaydedildi.');
            setShowSeoModal(false);
            setShowMappingModal(false);
        } catch (error) {
            showMsg('Kaydedilemedi.', 'error');
        }
    };

    // Yeni Sayfa Ekle
    const handleAddPage = async (e) => {
        e.preventDefault();
        if (!newPageName || !newPageSlug) return;
        try {
            const res = await api.post('/website-pages', { name: newPageName, slug: newPageSlug });
            setPages([...pages, res.data]);
            setNewPageName('');
            setNewPageSlug('');
            setShowAddPageModal(false);
            showMsg('Yeni sayfa oluşturuldu.');
        } catch (error) {
            showMsg(error.response?.data?.message || 'Hata.', 'error');
        }
    };

    // 1. Silme İsteği (Butona basınca)
    const requestDelete = (id) => {
        setPageToDelete(id);
        setShowDeleteModal(true);
    };

    // 2. Silme Onayı (Modal'daki "Evet" butonuna basınca)
    const confirmDelete = async () => {
        if (!pageToDelete) return;

        try {
            await api.delete(`/website-pages/${pageToDelete}`);
            setPages(pages.filter(p => p._id !== pageToDelete));
            showMsg('Sayfa başarıyla silindi.');
        } catch (error) { 
            showMsg('Silme işlemi başarısız oldu.', 'error'); 
        } finally {
            setShowDeleteModal(false);
            setPageToDelete(null);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            <MainNavbar user={user} />

            <div className="container pb-5">
                <h3 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Tema ve Site Ayarları</h3>

                {/* --- ÜST BUTONLAR ALANI --- */}
                <div className="row g-4 mb-5">
                    {/* SEO BUTONU */}
                    <div className="col-md-6">
                        <div className="dashboard-card p-4 h-100 d-flex flex-column align-items-center justify-content-center text-center cursor-pointer hover-scale"
                             onClick={() => setShowSeoModal(true)}
                             style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div className="bg-primary text-white rounded-circle p-3 mb-3" style={{ width: '60px', height: '60px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>
                                🌐
                            </div>
                            <h5 className="fw-bold">Genel Site Bilgileri (SEO)</h5>
                            <p className="text-muted small">Site başlığı, logo, anahtar kelimeler ve açıklamaları düzenleyin.</p>
                            <button className="btn btn-outline-primary rounded-pill px-4 btn-sm mt-2">Düzenle</button>
                        </div>
                    </div>

                    {/* EŞLEŞTİRME BUTONU */}
                    <div className="col-md-6">
                        <div className="dashboard-card p-4 h-100 d-flex flex-column align-items-center justify-content-center text-center cursor-pointer hover-scale"
                             onClick={() => setShowMappingModal(true)}
                             style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div className="bg-success text-white rounded-circle p-3 mb-3" style={{ width: '60px', height: '60px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>
                                🔗
                            </div>
                            <h5 className="fw-bold">Sayfa Eşleştirmeleri</h5>
                            <p className="text-muted small">Anasayfa, İletişim gibi sistem sayfalarını belirleyin.</p>
                            <button className="btn btn-outline-success rounded-pill px-4 btn-sm mt-2">Eşleştir</button>
                        </div>
                    </div>
                </div>

                {/* --- SAYFA LİSTESİ ALANI --- */}
                <div className="dashboard-card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <div>
                            <h5 className="fw-bold m-0">Sayfa Listesi</h5>
                            <small className="text-muted">Sitenizde bulunan tüm sayfalar</small>
                        </div>
                        <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => setShowAddPageModal(true)}>
                            + Yeni Sayfa Ekle
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Sayfa Adı</th>
                                    <th>URL (Slug)</th>
                                    <th className="text-end">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.length > 0 ? pages.map(page => (
                                    <tr key={page._id}>
                                        <td className="fw-bold">{page.name}</td>
                                        <td><span className="badge bg-light text-dark border">{page.slug}</span></td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-outline-primary me-2 rounded-pill">
                                                İçerik Düzenle ✏️
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger rounded-pill" 
                                                onClick={() => requestDelete(page._id)}
                                            >
                                                Sil 🗑️
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-muted">Henüz sayfa oluşturulmadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODAL 1: SEO DÜZENLEME --- */}
            {showSeoModal && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="card shadow-lg p-4" style={{ width: '600px', borderRadius: '15px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between mb-3">
                            <h5 className="fw-bold">Genel Site Bilgileri (SEO)</h5>
                            <button className="btn btn-sm btn-light" onClick={() => setShowSeoModal(false)}>X</button>
                        </div>
                        
                        <div className="alert alert-info py-2 d-flex align-items-center justify-content-between mb-3">
                            <small className="fw-bold">Dil Seçimi:</small>
                            <LanguageTabs activeLang={currentLang} setActiveLang={setCurrentLang} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">SİTE BAŞLIĞI ({currentLang})</label>
                            <input type="text" className="form-control" 
                                value={siteSettings.siteTitle[currentLang] || ''} 
                                onChange={e => handleSeoChange('siteTitle', e.target.value)} 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">AÇIKLAMA ({currentLang})</label>
                            <textarea className="form-control" rows="3"
                                value={siteSettings.description[currentLang] || ''} 
                                onChange={e => handleSeoChange('description', e.target.value)} 
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted">ANAHTAR KELİMELER</label>
                            <input type="text" className="form-control" 
                                value={siteSettings.keywords[currentLang] || ''} 
                                onChange={e => handleSeoChange('keywords', e.target.value)} 
                            />
                        </div>
                        
                        <div className="row mt-3">
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted">LOGO</label>
                                <input type="file" className="form-control form-control-sm" />
                            </div>
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted">FAVICON</label>
                                <input type="file" className="form-control form-control-sm" />
                            </div>
                        </div>

                        <div className="text-end mt-4 pt-3 border-top">
                            <button className="btn btn-success px-4 rounded-pill" onClick={handleSaveGeneral}>Kaydet</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: SAYFA EŞLEŞTİRME --- */}
            {showMappingModal && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="card shadow-lg p-4" style={{ width: '500px', borderRadius: '15px' }}>
                        <div className="d-flex justify-content-between mb-3">
                            <h5 className="fw-bold">Sayfa Eşleştirmeleri</h5>
                            <button className="btn btn-sm btn-light" onClick={() => setShowMappingModal(false)}>X</button>
                        </div>
                        <p className="text-muted small mb-4">Sistem linklerinin hangi sayfaları açacağını belirleyin.</p>

                        <div className="mb-3">
                            <label className="form-label small fw-bold">ANASAYFA</label>
                            <select className="form-select" value={pageMappings.homePage || ''} onChange={e => setPageMappings({...pageMappings, homePage: e.target.value})}>
                                <option value="">Seçiniz</option>
                                {pages.map(p => <option key={p._id} value={p._id}>{p.name} ({p.slug})</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">İLETİŞİM SAYFASI</label>
                            <select className="form-select" value={pageMappings.contactPage || ''} onChange={e => setPageMappings({...pageMappings, contactPage: e.target.value})}>
                                <option value="">Seçiniz</option>
                                {pages.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">ODALAR SAYFASI</label>
                            <select className="form-select" value={pageMappings.roomsPage || ''} onChange={e => setPageMappings({...pageMappings, roomsPage: e.target.value})}>
                                <option value="">Seçiniz</option>
                                {pages.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="text-end mt-4 pt-3 border-top">
                            <button className="btn btn-success px-4 rounded-pill" onClick={handleSaveGeneral}>Kaydet</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 3: YENİ SAYFA EKLE --- */}
            {showAddPageModal && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="card shadow-lg p-4" style={{ width: '400px', borderRadius: '15px' }}>
                        <h5 className="fw-bold mb-3">Yeni Sayfa Oluştur</h5>
                        <form onSubmit={handleAddPage}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">SAYFA ADI</label>
                                <input type="text" className="form-control" placeholder="Örn: Hakkımızda" required 
                                    value={newPageName} onChange={e => setNewPageName(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">URL (SLUG)</label>
                                <input type="text" className="form-control" placeholder="Örn: /hakkimizda" required 
                                    value={newPageSlug} onChange={e => setNewPageSlug(e.target.value)} />
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="btn btn-light" onClick={() => setShowAddPageModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary px-4">Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 4: SİLME ONAYI --- */}
            {showDeleteModal && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
                    <div className="card shadow-lg p-4 text-center" style={{ width: '350px', borderRadius: '20px' }}>
                        <div className="mb-3 text-danger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="bi bi-exclamation-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0l-.35-3.507z"/>
                            </svg>
                        </div>
                        <h4 className="fw-bold mb-2">Emin misiniz?</h4>
                        <p className="text-muted small mb-4">
                            Bu sayfayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-light rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>Vazgeç</button>
                            <button className="btn btn-danger rounded-pill px-4" onClick={confirmDelete}>Evet, Sil</button>
                        </div>
                    </div>
                </div>
            )}

            {/* BİLDİRİM TOAST */}
            {status.show && (
                <div className="expiry-overlay" style={{ background: 'transparent', pointerEvents: 'none', zIndex: 2000 }}>
                    <div className={`card shadow-lg p-3 text-white border-0 ${status.type === 'error' ? 'bg-danger' : 'bg-success'}`} style={{ borderRadius: '50px' }}>
                        <span className="fw-bold px-3">{status.msg}</span>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ThemeSettingsPage;