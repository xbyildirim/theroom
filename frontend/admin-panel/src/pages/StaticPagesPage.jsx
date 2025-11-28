import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/dashboard.css';
import MainNavbar from '../components/MainNavbar';
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css';
import LanguageTabs from '../components/LanguageTabs'; // Dil Sekmeleri
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages'; // Sabitler

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', ''); 

const PAGE_TYPES = [
    { id: 'kvkk', label: 'KVKK Aydınlatma Metni' },
    { id: 'privacy', label: 'Gizlilik Politikası' },
    { id: 'cookie', label: 'Çerez Politikası' },
    { id: 'terms', label: 'Kullanım Koşulları' },
    { id: 'contact', label: 'İletişim / Künye' },
];

const StaticPagesPage = () => {
    const [selectedType, setSelectedType] = useState('kvkk');
    
    // 🌍 ÇOKLU DİL STATE YAPISI
    const [formData, setFormData] = useState({ title: {}, content: {} });
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANGUAGE);
    
    const [currentImage, setCurrentImage] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('hotel');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        fetchPageData(selectedType);
    }, [selectedType]);

    const fetchPageData = async (type) => {
        setLoading(true);
        setMessage('');
        setNewImage(null);
        try {
            const res = await api.get(`/pages/${type}`);
            
            // Gelen veri string ise (eski veri) objeye çevir, yoksa olduğu gibi al
            const safeTitle = typeof res.data.title === 'string' 
                ? { [DEFAULT_LANGUAGE]: res.data.title } 
                : (res.data.title || {});

            const safeContent = typeof res.data.content === 'string' 
                ? { [DEFAULT_LANGUAGE]: res.data.content } 
                : (res.data.content || {});

            setFormData({
                title: safeTitle,
                content: safeContent
            });
            setCurrentImage(res.data.imageUrl || '');
        } catch (error) {
            console.error('Sayfa verisi çekilemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                alert('Dosya boyutu 3MB\'dan büyük olamaz!');
                return;
            }
            setNewImage(file);
        }
    };

    // Çoklu Dil İçerik Güncelleme Helper'ı
    const handleMultiLangChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [currentLang]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const data = new FormData();
        // 🛠️ Nesneleri JSON string olarak gönderiyoruz (Backend parse edecek)
        data.append('title', JSON.stringify(formData.title));
        data.append('content', JSON.stringify(formData.content));
        
        if (newImage) {
            data.append('image', newImage);
        }

        try {
            const res = await api.put(`/pages/${selectedType}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('✅ ' + res.data.message);
            if (res.data.page.imageUrl) {
                setCurrentImage(res.data.page.imageUrl);
                setNewImage(null);
            }
        } catch (error) {
            setMessage('❌ Hata: ' + (error.response?.data?.message || 'Güncellenemedi.'));
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link'],
            ['clean']
        ],
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            <MainNavbar user={user} />

            <div className="container pb-5">
                <h3 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Statik Sayfa Ayarları</h3>

                <div className="row">
                    <div className="col-lg-3 mb-4">
                        <div className="list-group shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                            {PAGE_TYPES.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => setSelectedType(page.id)}
                                    className={`list-group-item list-group-item-action py-3 px-4 fw-bold ${selectedType === page.id ? 'active' : ''}`}
                                    style={selectedType === page.id ? { background: 'var(--primary-gradient)', border: 'none' } : { color: 'var(--text-main)' }}
                                >
                                    {page.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-9">
                        <div className="dashboard-card p-4 p-md-5">
                            {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

                            {/* 🌍 DİL SEÇİMİ */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold m-0">İçerik Düzenle</h5>
                                <LanguageTabs activeLang={currentLang} setActiveLang={setCurrentLang} />
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">
                                        SAYFA BAŞLIĞI ({LANGUAGES.find(l=>l.code===currentLang).label})
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">{LANGUAGES.find(l=>l.code===currentLang).flag}</span>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg bg-light border-0"
                                            value={formData.title[currentLang] || ''}
                                            onChange={(e) => handleMultiLangChange('title', e.target.value)}
                                            placeholder={`${LANGUAGES.find(l=>l.code===currentLang).label} başlığı giriniz...`}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">
                                        SAYFA İÇERİĞİ ({LANGUAGES.find(l=>l.code===currentLang).label})
                                    </label>
                                    <div style={{ height: '350px', marginBottom: '50px' }}>
                                        <ReactQuill 
                                            theme="snow"
                                            value={formData.content[currentLang] || ''}
                                            onChange={(val) => handleMultiLangChange('content', val)}
                                            modules={modules}
                                            style={{ height: '300px', backgroundColor: '#fff' }}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">SAYFA GÖRSELİ (Tüm Diller İçin Ortak)</label>
                                    <div className="d-flex align-items-center gap-4">
                                        <div style={{ width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', background: '#eee', border: '1px solid #ddd' }}>
                                            {(newImage || currentImage) ? (
                                                <img src={newImage ? URL.createObjectURL(newImage) : `${API_BASE_URL}${currentImage}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center h-100 text-muted small">Yok</div>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end mt-4">
                                    <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill fw-bold" disabled={loading} style={{ background: 'var(--primary-gradient)', border: 'none' }}>
                                        {loading ? 'Kaydediliyor...' : 'Kaydet ve Yayınla'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaticPagesPage;