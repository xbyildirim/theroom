import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/dashboard.css';
import MainNavbar from '../components/MainNavbar';
// 👇 YENİ BİLEŞENLER
import LanguageTabs from '../components/LanguageTabs';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';

const RoomHotelPage = () => {
    const [activeTab, setActiveTab] = useState('rooms'); 
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    
    // 🌍 AKTİF DİL STATE (Varsayılan: Türkçe)
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANGUAGE);

    // Otel Detayları
    const [hotelDetails, setHotelDetails] = useState({ description: {}, address: '', phone: '', stars: 0 }); // Desc artık obje
    const [selectedFacilities, setSelectedFacilities] = useState([]);

    // Oda Form State (Başlangıç Değerleri Obje Olarak)
    const initialRoomState = {
        title: {}, // { tr: '', en: '' } şeklinde olacak
        type: 'Standart', price: 0, size: 0, capacity: 2,
        bedType: '', floor: '', isAccessible: false,
        features: {
            tv: false, tvType: '', ac: false, heatingType: '', 
            minibar: false, safe: false, phone: false, 
            wifi: true, wifiSpeed: '', roomService: false
        },
        bathroom: { type: 'Duş', hairDryer: true, toiletries: true, cleaningFreq: 'Günlük' },
        balcony: false, view: {}, // Obje
        smokingAllowed: false, petFriendly: false, cancellationPolicy: {} // Obje
    };

    const [showRoomForm, setShowRoomForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [newRoom, setNewRoom] = useState(initialRoomState);

    useEffect(() => {
        const storedUser = localStorage.getItem('hotel');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (parsed.details) setHotelDetails(parsed.details);
            if (parsed.facilities) setSelectedFacilities(parsed.facilities);
        }
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
        } catch (error) {
            console.error("Odalar çekilemedi");
        }
    };

    // --- HELPER: ÇOKLU DİL INPUT DEĞİŞİMİ ---
    const handleMultiLangChange = (field, value, isRoom = true) => {
        if (isRoom) {
            setNewRoom(prev => ({
                ...prev,
                [field]: { ...prev[field], [currentLang]: value }
            }));
        } else {
            // Otel Detayları İçin
            setHotelDetails(prev => ({
                ...prev,
                [field]: { ...prev[field], [currentLang]: value }
            }));
        }
    };

    // --- HELPER: GÜVENLİ VERİ OKUMA ---
    // Eğer o dilde veri yoksa, varsayılan dili göster, o da yoksa boş string göster
    const getLocalizedText = (dataObj, lang = currentLang) => {
        if (!dataObj) return '';
        return dataObj[lang] || dataObj[DEFAULT_LANGUAGE] || '';
    };


    // --- ODA İŞLEMLERİ ---
    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (isEditing) {
                res = await api.put(`/rooms/${currentRoomId}`, newRoom);
                setRooms(rooms.map(r => r._id === currentRoomId ? res.data : r));
                alert('✅ Oda güncellendi.');
            } else {
                res = await api.post('/rooms', newRoom);
                setRooms([res.data, ...rooms]);
                alert('✅ Oda eklendi.');
            }
            setShowRoomForm(false);
            setNewRoom(initialRoomState);
        } catch (error) {
            alert('İşlem başarısız.');
        }
    };

    const handleEditClick = (room) => {
        // Backend'den gelen veri zaten { tr: "...", en: "..." } formatında olduğu için direkt set ediyoruz
        // Ancak null değerlere karşı koruma yapalım
        const safeRoom = {
            ...room,
            title: room.title || {},
            view: room.view || {},
            cancellationPolicy: room.cancellationPolicy || {}
        };
        setNewRoom(safeRoom);
        setIsEditing(true);
        setCurrentRoomId(room._id);
        setShowRoomForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // --- OTEL GÜNCELLEME ---
    const handleHotelUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/update', {
                details: hotelDetails,
                facilities: selectedFacilities
            });
            const updatedUser = { ...user, ...res.data.hotel };
            localStorage.setItem('hotel', JSON.stringify(updatedUser));
            setUser(updatedUser);
            alert('✅ Bilgiler güncellendi.');
        } catch (error) {
            alert('Hata oluştu.');
        }
    };

    const handleDeleteRoom = async (id) => {
        if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/rooms/${id}`);
            setRooms(rooms.filter(r => r._id !== id));
        } catch (error) { alert('Silinemedi.'); }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            <MainNavbar user={user} />
            <div className="container pb-5">
                <h3 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Oda ve Otel Yönetimi</h3>

                <ul className="nav nav-pills mb-4 p-2 bg-white rounded-pill shadow-sm d-inline-flex">
                    <li className="nav-item">
                        <button className={`nav-link rounded-pill px-4 ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>🛏️ Odalar</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link rounded-pill px-4 ${activeTab === 'hotel' ? 'active' : ''}`} onClick={() => setActiveTab('hotel')}>🏨 Otel Özellikleri</button>
                    </li>
                </ul>

                {/* --- TAB 1: ODALAR --- */}
                {activeTab === 'rooms' && (
                    <div className="row">
                        <div className="col-12 mb-4 text-end">
                            {!showRoomForm && (
                                <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => { setNewRoom(initialRoomState); setIsEditing(false); setShowRoomForm(true); }}>
                                    + Yeni Oda Ekle
                                </button>
                            )}
                        </div>

                        {showRoomForm && (
                            <div className="col-12 mb-5">
                                <div className="dashboard-card p-4 border-left-primary">
                                    <div className="d-flex justify-content-between mb-3">
                                        <h4 className="fw-bold">{isEditing ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}</h4>
                                        <button className="btn btn-sm btn-light" onClick={() => setShowRoomForm(false)}>X Kapat</button>
                                    </div>

                                    {/* 🌍 DİL SEÇİCİ */}
                                    <div className="alert alert-info py-2 d-flex align-items-center justify-content-between">
                                        <small className="fw-bold">Hangi dilde içerik giriyorsunuz?</small>
                                        <LanguageTabs activeLang={currentLang} setActiveLang={setCurrentLang} />
                                    </div>
                                    
                                    <form onSubmit={handleRoomSubmit}>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="small text-muted fw-bold">ODA ADI ({currentLang.toUpperCase()})</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">{LANGUAGES.find(l=>l.code===currentLang).flag}</span>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        required 
                                                        // O anki dilin verisini göster, yoksa boş
                                                        value={newRoom.title[currentLang] || ''} 
                                                        onChange={e => handleMultiLangChange('title', e.target.value)} 
                                                        placeholder={`${LANGUAGES.find(l=>l.code===currentLang).label} adını giriniz...`}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-6">
                                                <label className="small text-muted fw-bold">MANZARA ({currentLang.toUpperCase()})</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    value={newRoom.view[currentLang] || ''} 
                                                    onChange={e => handleMultiLangChange('view', e.target.value)} 
                                                />
                                            </div>

                                            <div className="col-md-12">
                                                <label className="small text-muted fw-bold">İPTAL POLİTİKASI ({currentLang.toUpperCase()})</label>
                                                <textarea 
                                                    className="form-control" 
                                                    rows="2"
                                                    value={newRoom.cancellationPolicy[currentLang] || ''} 
                                                    onChange={e => handleMultiLangChange('cancellationPolicy', e.target.value)} 
                                                />
                                            </div>

                                            {/* STANDART (Çevrilmeyen) ALANLAR */}
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">FİYAT (₺)</label>
                                                <input type="number" className="form-control" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} required />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">KAPASİTE</label>
                                                <input type="number" className="form-control" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} />
                                            </div>
                                            {/* ... Diğer sayısal alanlar buraya ... */}
                                        </div>

                                        <div className="text-end border-top pt-3">
                                            <button type="submit" className="btn btn-success px-4 fw-bold">Kaydet</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ODA LİSTESİ */}
                        {rooms.map(room => (
                            <div className="col-md-6 col-lg-4 mb-4" key={room._id}>
                                <div className="dashboard-card p-0 h-100 overflow-hidden">
                                    <div className="bg-light p-4 text-center">
                                        <h1 className="m-0">🛏️</h1>
                                        <span className="badge bg-primary position-absolute top-0 end-0 m-3">{room.type}</span>
                                    </div>
                                    <div className="p-4">
                                        {/* Listede varsayılan olarak Türkçe gösterilir, yoksa İngilizce */}
                                        <h5 className="fw-bold mb-1">{getLocalizedText(room.title, DEFAULT_LANGUAGE)}</h5>
                                        <div className="mb-2">
                                            {/* Hangi dillerde veri girilmiş? Küçük bayraklar göster */}
                                            {LANGUAGES.map(lang => (
                                                room.title && room.title[lang.code] ? 
                                                <span key={lang.code} className="me-1 small" title={lang.label}>{lang.flag}</span> : null
                                            ))}
                                        </div>
                                        <span className="badge bg-success mb-3">{room.price} ₺</span>
                                        
                                        <div className="d-flex gap-2">
                                            <button onClick={() => handleEditClick(room)} className="btn btn-sm btn-outline-primary flex-grow-1">Düzenle</button>
                                            <button onClick={() => handleDeleteRoom(room._id)} className="btn btn-sm btn-outline-danger">Sil</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TAB 2: OTEL DETAYLARI --- */}
                {activeTab === 'hotel' && (
                    <div className="col-lg-8">
                        <div className="dashboard-card p-5">
                            {/* DİL SEÇİCİ BURADA DA VAR */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold m-0">Genel Bilgiler</h5>
                                <LanguageTabs activeLang={currentLang} setActiveLang={setCurrentLang} />
                            </div>

                            <form onSubmit={handleHotelUpdate}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">OTEL AÇIKLAMASI ({currentLang.toUpperCase()})</label>
                                    <div className="input-group">
                                        <span className="input-group-text">{LANGUAGES.find(l=>l.code===currentLang).flag}</span>
                                        <textarea 
                                            className="form-control" 
                                            rows="4" 
                                            value={hotelDetails.description[currentLang] || ''} 
                                            onChange={e => handleMultiLangChange('description', e.target.value, false)}
                                        ></textarea>
                                    </div>
                                </div>
                                {/* Diğer standart alanlar... */}
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">ADRES (Sabit)</label>
                                    <input type="text" className="form-control" value={hotelDetails.address} onChange={e => setHotelDetails({...hotelDetails, address: e.target.value})} />
                                </div>
                                <div className="text-end">
                                    <button type="submit" className="btn btn-primary rounded-pill fw-bold">Güncelle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomHotelPage;