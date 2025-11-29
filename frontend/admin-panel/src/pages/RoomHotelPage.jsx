import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/dashboard.css';
import MainNavbar from '../components/MainNavbar';
import LanguageTabs from '../components/LanguageTabs';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';

// API URL (Resim önizleme için)
// .env dosyasından VITE_API_BASE_URL alıp '/api' kısmını siliyoruz ki resim yolunu doğru bulsun
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

const COMMON_FACILITIES = [
    'Ücretsiz Wifi', 'Otopark', 'Yüzme Havuzu', 'SPA & Wellness', 
    'Spor Salonu (Gym)', 'Restoran', 'Bar', 'Oda Servisi', 
    'Havalimanı Transferi', 'Çocuk Kulübü', 'Evcil Hayvan Dostu', 'Toplantı Salonu',
    '7/24 Resepsiyon', 'Güvenlik Kamerası', 'Asansör'
];

const RoomHotelPage = () => {
    const [activeTab, setActiveTab] = useState('rooms'); 
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [currentLang, setCurrentLang] = useState(DEFAULT_LANGUAGE);
    
    // Otel Detayları
    const [hotelDetails, setHotelDetails] = useState({ description: {}, address: '', phone: '', stars: 0 });
    const [selectedFacilities, setSelectedFacilities] = useState([]);

    // Modallar
    const [statusModal, setStatusModal] = useState({ show: false, type: 'success', message: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, roomId: null });

    // Oda Form State
    const initialRoomState = {
        title: {}, description: {}, view: {}, cancellationPolicy: {}, minibarContents: {},
        type: 'Standart', price: 0, extraFee: 0, size: 0, capacity: 2,
        bedType: 'Çift Kişilik', bedCount: 1, floor: 'Zemin', isAccessible: false,
        features: {
            tv: false, tvType: 'LED', ac: false, heatingType: 'Klima',
            minibar: false, safe: false, phone: false, wifi: true, wifiSpeed: '100 Mbps',
            roomService: false, roomServiceHours: '24 Saat'
        },
        bathroom: { type: 'Duş', isPrivate: true, hairDryer: true, toiletries: true, cleaningFreq: 'Günlük' },
        balcony: false,
        checkInTime: '14:00', checkOutTime: '11:00', smokingAllowed: false, petFriendly: false,
        safety: { fireAlarm: true, smokeDetector: true },
        // Dosyalar için placeholder (Bunlar URL stringleri)
        images: [], 
        videos: [] 
    };

    const [showRoomForm, setShowRoomForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [newRoom, setNewRoom] = useState(initialRoomState);
    
    // Yüklenecek Yeni Dosyalar State'i (File Objesi)
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);

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
        } catch (error) { console.error("Odalar çekilemedi"); }
    };

    const showStatus = (type, message) => {
        setStatusModal({ show: true, type, message });
        setTimeout(() => setStatusModal({ ...statusModal, show: false }), 2500);
    };

    const handleMultiLangChange = (field, value, isRoom = true) => {
        if (isRoom) {
            setNewRoom(prev => ({ ...prev, [field]: { ...prev[field], [currentLang]: value } }));
        } else {
            setHotelDetails(prev => ({ ...prev, [field]: { ...prev[field], [currentLang]: value } }));
        }
    };

    const handleRoomChange = (section, field, value) => {
        if (section) {
            setNewRoom(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        } else {
            setNewRoom(prev => ({ ...prev, [field]: value }));
        }
    };

    const getLocalizedText = (dataObj, lang = currentLang) => {
        if (!dataObj) return '';
        return dataObj[lang] || dataObj[DEFAULT_LANGUAGE] || '';
    };

    // Dosya Seçme İşlemi
    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'images') setSelectedImages([...selectedImages, ...files]);
        if (type === 'videos') setSelectedVideos([...selectedVideos, ...files]);
    };

    // Dosya Kaldırma (Seçilenlerden)
    const removeSelectedFile = (index, type) => {
        if (type === 'images') setSelectedImages(selectedImages.filter((_, i) => i !== index));
        if (type === 'videos') setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    };

    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        
        // FormData Oluşturma (Dosya yükleme için zorunlu)
        const formData = new FormData();

        // 1. Nested Objeleri JSON String Olarak Ekle (Backend'de parse edilecek)
        formData.append('title', JSON.stringify(newRoom.title));
        formData.append('description', JSON.stringify(newRoom.description));
        formData.append('view', JSON.stringify(newRoom.view));
        formData.append('cancellationPolicy', JSON.stringify(newRoom.cancellationPolicy));
        formData.append('minibarContents', JSON.stringify(newRoom.minibarContents));
        formData.append('features', JSON.stringify(newRoom.features));
        formData.append('bathroom', JSON.stringify(newRoom.bathroom));
        formData.append('safety', JSON.stringify(newRoom.safety));

        // 2. Basit Değerleri Ekle
        ['type', 'price', 'extraFee', 'size', 'capacity', 'bedType', 'bedCount', 
         'floor', 'isAccessible', 'balcony', 'checkInTime', 'checkOutTime', 
         'smokingAllowed', 'petFriendly'].forEach(key => {
             formData.append(key, newRoom[key]);
        });

        // 3. Dosyaları Ekle
        selectedImages.forEach(file => formData.append('images', file));
        selectedVideos.forEach(file => formData.append('videos', file));

        try {
            let res;
            // Config: Multipart Header
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (isEditing) {
                res = await api.put(`/rooms/${currentRoomId}`, formData, config);
                setRooms(rooms.map(r => r._id === currentRoomId ? res.data : r));
                showStatus('success', 'Oda güncellendi.');
            } else {
                res = await api.post('/rooms', formData, config);
                setRooms([res.data, ...rooms]);
                showStatus('success', 'Yeni oda eklendi.');
            }
            setShowRoomForm(false);
            setNewRoom(initialRoomState);
            setSelectedImages([]);
            setSelectedVideos([]);
        } catch (error) {
            console.error(error);
            showStatus('error', 'İşlem başarısız: ' + (error.response?.data?.message || 'Hata'));
        }
    };

    const handleEditClick = (room) => {
        const safeRoom = {
            ...initialRoomState, ...room,
            features: { ...initialRoomState.features, ...(room.features || {}) },
            bathroom: { ...initialRoomState.bathroom, ...(room.bathroom || {}) },
            safety: { ...initialRoomState.safety, ...(room.safety || {}) },
            title: room.title || {}, description: room.description || {},
            view: room.view || {}, cancellationPolicy: room.cancellationPolicy || {},
            minibarContents: room.minibarContents || {},
            images: room.images || [], videos: room.videos || []
        };
        setNewRoom(safeRoom);
        setIsEditing(true);
        setCurrentRoomId(room._id);
        setShowRoomForm(true);
        setSelectedImages([]); // Yeni yükleme listesini sıfırla
        setSelectedVideos([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Silme Onayı
    const confirmDelete = async () => {
        try {
            await api.delete(`/rooms/${deleteModal.roomId}`);
            setRooms(rooms.filter(r => r._id !== deleteModal.roomId));
            showStatus('success', 'Oda silindi.');
        } catch (error) { showStatus('error', 'Silinemedi.'); } 
        finally { setDeleteModal({ show: false, roomId: null }); }
    };

    const handleHotelUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/update', { details: hotelDetails, facilities: selectedFacilities });
            const updatedUser = { ...user, ...res.data.hotel };
            localStorage.setItem('hotel', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showStatus('success', 'Otel bilgileri güncellendi!');
        } catch (error) { showStatus('error', 'Güncelleme hatası.'); }
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

                {activeTab === 'rooms' && (
                    <div className="row">
                        <div className="col-12 mb-4 text-end">
                            {!showRoomForm && (
                                <button className="btn btn-primary rounded-pill px-4 fw-bold" 
                                    onClick={() => { setNewRoom(initialRoomState); setIsEditing(false); setShowRoomForm(true); }}>
                                    + Yeni Oda Ekle
                                </button>
                            )}
                        </div>

                        {showRoomForm && (
                            <div className="col-12 mb-5">
                                <div className="dashboard-card p-4 border-left-primary">
                                    <div className="d-flex justify-content-between mb-3">
                                        <h4 className="fw-bold">{isEditing ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}</h4>
                                        <button className="btn btn-sm btn-light" onClick={() => setShowRoomForm(false)}>X İptal</button>
                                    </div>

                                    <div className="alert alert-info py-2 d-flex align-items-center justify-content-between mb-4">
                                        <small className="fw-bold text-primary"><i className="bi bi-translate me-2"></i>İçerik Dili: {LANGUAGES.find(l=>l.code===currentLang).label}</small>
                                        <LanguageTabs activeLang={currentLang} setActiveLang={setCurrentLang} />
                                    </div>
                                    
                                    <form onSubmit={handleRoomSubmit}>
                                        {/* BÖLÜM 1: MEDYA YÜKLEME (YENİ) */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">📷 Görsel & Video Galeri</h6>
                                        <div className="row mb-4">
                                            {/* RESİMLER */}
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">ODA FOTOĞRAFLARI (Max 10)</label>
                                                <input type="file" className="form-control mb-2" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'images')} />
                                                
                                                {/* Önizleme Alanı */}
                                                <div className="d-flex flex-wrap gap-2">
                                                    {/* Mevcut Resimler */}
                                                    {newRoom.images && newRoom.images.map((img, i) => (
                                                        <div key={`existing-${i}`} className="position-relative">
                                                            <img src={`${API_BASE_URL}${img}`} alt="room" className="rounded border" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                                        </div>
                                                    ))}
                                                    {/* Yeni Yüklenecekler */}
                                                    {selectedImages.map((file, i) => (
                                                        <div key={i} className="position-relative">
                                                            <img src={URL.createObjectURL(file)} alt="preview" className="rounded border" style={{ width: '80px', height: '80px', objectFit: 'cover', opacity: 0.8 }} />
                                                            <button type="button" className="btn btn-danger btn-sm p-0 rounded-circle position-absolute top-0 end-0" 
                                                                style={{ width: '20px', height: '20px', lineHeight: '18px', fontSize: '12px' }}
                                                                onClick={() => removeSelectedFile(i, 'images')}>x</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* VİDEOLAR */}
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">ODA VİDEOLARI (Max 3)</label>
                                                <input type="file" className="form-control mb-2" accept="video/*" multiple onChange={(e) => handleFileChange(e, 'videos')} />
                                                <div className="d-flex flex-wrap gap-2">
                                                    {/* Mevcut Videolar */}
                                                    {newRoom.videos && newRoom.videos.map((vid, i) => (
                                                        <div key={`existing-vid-${i}`} className="border rounded p-1 bg-light">
                                                            <small className="d-block text-muted" style={{fontSize: '10px'}}>Mevcut Video {i+1}</small>
                                                            <video src={`${API_BASE_URL}${vid}`} style={{ width: '80px', height: '60px' }} />
                                                        </div>
                                                    ))}
                                                    {/* Yeni Videolar */}
                                                    {selectedVideos.map((file, i) => (
                                                        <div key={i} className="position-relative border rounded p-1 bg-light">
                                                            <small className="d-block text-success" style={{fontSize: '10px'}}>Yeni Video</small>
                                                            <video src={URL.createObjectURL(file)} style={{ width: '80px', height: '60px' }} />
                                                            <button type="button" className="btn btn-danger btn-sm p-0 rounded-circle position-absolute top-0 end-0" 
                                                                style={{ width: '20px', height: '20px', lineHeight: '18px', fontSize: '12px' }}
                                                                onClick={() => removeSelectedFile(i, 'videos')}>x</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* BÖLÜM 2: GENEL ÖZELLİKLER */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">1. Genel Özellikler & Yatak</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="small text-muted fw-bold">ODA ADI ({currentLang})</label>
                                                <input type="text" className="form-control" required value={newRoom.title[currentLang] || ''} onChange={e => handleMultiLangChange('title', e.target.value)} placeholder="Örn: Deluxe Oda" />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">ODA TİPİ</label>
                                                <select className="form-select" value={newRoom.type} onChange={e => handleRoomChange(null, 'type', e.target.value)}>
                                                    <option>Standart</option><option>Deluxe</option><option>Suite</option><option>Family</option><option>King</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">ODA BÜYÜKLÜĞÜ (m²)</label>
                                                <input type="number" className="form-control" value={newRoom.size} onChange={e => handleRoomChange(null, 'size', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">KAPASİTE (Kişi)</label>
                                                <input type="number" className="form-control" value={newRoom.capacity} onChange={e => handleRoomChange(null, 'capacity', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">YATAK TİPİ</label>
                                                <select className="form-select" value={newRoom.bedType} onChange={e => handleRoomChange(null, 'bedType', e.target.value)}>
                                                    <option>Tek Kişilik</option><option>Çift Kişilik</option><option>King Size</option><option>2 Tek Kişilik</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">YATAK SAYISI</label>
                                                <input type="number" className="form-control" value={newRoom.bedCount} onChange={e => handleRoomChange(null, 'bedCount', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">KAT / ERİŞİM</label>
                                                <input type="text" className="form-control" placeholder="Örn: Zemin Kat" value={newRoom.floor} onChange={e => handleRoomChange(null, 'floor', e.target.value)} />
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.isAccessible} onChange={e => handleRoomChange(null, 'isAccessible', e.target.checked)} />
                                                    <label className="form-check-label">Engelli Erişimine Uygun</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BÖLÜM 3: DONANIM & EŞYALAR */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">2. Oda Donanımı & Eşyalar</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-4 border-end">
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.tv} onChange={e => handleRoomChange('features', 'tv', e.target.checked)} />
                                                    <label className="form-check-label fw-bold">Televizyon</label>
                                                </div>
                                                {newRoom.features.tv && <input type="text" className="form-control form-control-sm" placeholder="Özellik (LED, Smart)" value={newRoom.features.tvType} onChange={e => handleRoomChange('features', 'tvType', e.target.value)} />}
                                            </div>
                                            <div className="col-md-4 border-end">
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.ac} onChange={e => handleRoomChange('features', 'ac', e.target.checked)} />
                                                    <label className="form-check-label fw-bold">Klima / Isıtma</label>
                                                </div>
                                                {newRoom.features.ac && <input type="text" className="form-control form-control-sm" placeholder="Tip (Merkezi, Split)" value={newRoom.features.heatingType} onChange={e => handleRoomChange('features', 'heatingType', e.target.value)} />}
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.wifi} onChange={e => handleRoomChange('features', 'wifi', e.target.checked)} />
                                                    <label className="form-check-label fw-bold">Wifi</label>
                                                </div>
                                                {newRoom.features.wifi && <input type="text" className="form-control form-control-sm" placeholder="Hız / Limit" value={newRoom.features.wifiSpeed} onChange={e => handleRoomChange('features', 'wifiSpeed', e.target.value)} />}
                                            </div>
                                            
                                            <div className="col-12"><hr className="text-muted" /></div>

                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.minibar} onChange={e => handleRoomChange('features', 'minibar', e.target.checked)} />
                                                    <label className="form-check-label fw-bold">Minibar</label>
                                                </div>
                                                {newRoom.features.minibar && (
                                                    <input type="text" className="form-control form-control-sm mt-1" placeholder={`İçerik (${currentLang})`} value={newRoom.minibarContents[currentLang] || ''} onChange={e => handleMultiLangChange('minibarContents', e.target.value)} />
                                                )}
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.safe} onChange={e => handleRoomChange('features', 'safe', e.target.checked)} />
                                                    <label className="form-check-label">Güvenlik Kasası</label>
                                                </div>
                                                <div className="form-check mt-2">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.phone} onChange={e => handleRoomChange('features', 'phone', e.target.checked)} />
                                                    <label className="form-check-label">Telefon</label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.roomService} onChange={e => handleRoomChange('features', 'roomService', e.target.checked)} />
                                                    <label className="form-check-label fw-bold">Oda Servisi</label>
                                                </div>
                                                {newRoom.features.roomService && <input type="text" className="form-control form-control-sm mt-1" placeholder="Saatler" value={newRoom.features.roomServiceHours} onChange={e => handleRoomChange('features', 'roomServiceHours', e.target.value)} />}
                                            </div>
                                        </div>

                                        {/* BÖLÜM 4: BANYO & BALKON */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">3. Banyo & Balkon</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">BANYO TİPİ</label>
                                                <select className="form-select" value={newRoom.bathroom.type} onChange={e => handleRoomChange('bathroom', 'type', e.target.value)}>
                                                    <option>Duş</option><option>Küvet</option><option>Jakuzi</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">TEMİZLİK SIKLIĞI</label>
                                                <input type="text" className="form-control" value={newRoom.bathroom.cleaningFreq} onChange={e => handleRoomChange('bathroom', 'cleaningFreq', e.target.value)} />
                                            </div>
                                            <div className="col-md-6 pt-4 d-flex gap-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.bathroom.isPrivate} onChange={e => handleRoomChange('bathroom', 'isPrivate', e.target.checked)} />
                                                    <label className="form-check-label">Özel Tuvalet (Oda İçi)</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.bathroom.hairDryer} onChange={e => handleRoomChange('bathroom', 'hairDryer', e.target.checked)} />
                                                    <label className="form-check-label">Saç Kurutma</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.bathroom.toiletries} onChange={e => handleRoomChange('bathroom', 'toiletries', e.target.checked)} />
                                                    <label className="form-check-label">Banyo Malzemeleri</label>
                                                </div>
                                            </div>
                                            <div className="col-12"><hr className="text-muted"/></div>
                                            <div className="col-md-3">
                                                <div className="form-check pt-2">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.balcony} onChange={e => handleRoomChange(null, 'balcony', e.target.checked)} />
                                                    <label className="form-check-label fw-bold">Balkon / Teras</label>
                                                </div>
                                            </div>
                                            <div className="col-md-9">
                                                {newRoom.balcony && (
                                                    <div className="input-group">
                                                        <span className="input-group-text">Manzara ({currentLang})</span>
                                                        <input type="text" className="form-control" value={newRoom.view[currentLang] || ''} onChange={e => handleMultiLangChange('view', e.target.value)} placeholder="Deniz, Dağ, Şehir..." />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* BÖLÜM 5: FİYAT, REZERVASYON & KURALLAR */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">4. Fiyat & Kurallar</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">ODA FİYATI (₺)</label>
                                                <input type="number" className="form-control" required value={newRoom.price} onChange={e => handleRoomChange(null, 'price', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">EKSTRA ÜCRETLER</label>
                                                <input type="number" className="form-control" value={newRoom.extraFee} onChange={e => handleRoomChange(null, 'extraFee', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">CHECK-IN</label>
                                                <input type="time" className="form-control" value={newRoom.checkInTime} onChange={e => handleRoomChange(null, 'checkInTime', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">CHECK-OUT</label>
                                                <input type="time" className="form-control" value={newRoom.checkOutTime} onChange={e => handleRoomChange(null, 'checkOutTime', e.target.value)} />
                                            </div>
                                            
                                            <div className="col-md-12">
                                                <label className="small text-muted fw-bold">İPTAL KOŞULLARI ({currentLang})</label>
                                                <textarea className="form-control" rows="2" value={newRoom.cancellationPolicy[currentLang] || ''} onChange={e => handleMultiLangChange('cancellationPolicy', e.target.value)} placeholder="İptal politikası metni..." />
                                            </div>

                                            <div className="col-md-6 pt-2">
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.petFriendly} onChange={e => handleRoomChange(null, 'petFriendly', e.target.checked)} />
                                                    <label className="form-check-label">🐶 Evcil Hayvan Dostu</label>
                                                </div>
                                            </div>
                                            <div className="col-md-6 pt-2">
                                                <div className="form-check form-switch">
                                                    <input className="form-check-input" type="checkbox" checked={!newRoom.smokingAllowed} onChange={e => handleRoomChange(null, 'smokingAllowed', !e.target.checked)} />
                                                    <label className="form-check-label">🚭 Sigara İçilmeyen Oda</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BÖLÜM 6: GÜVENLİK */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">5. Güvenlik</h6>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.safety.fireAlarm} onChange={e => handleRoomChange('safety', 'fireAlarm', e.target.checked)} />
                                                    <label className="form-check-label">Yangın Alarmı</label>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.safety.smokeDetector} onChange={e => handleRoomChange('safety', 'smokeDetector', e.target.checked)} />
                                                    <label className="form-check-label">Duman Dedektörü</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-end border-top pt-4 mt-4">
                                            <button type="submit" className="btn btn-success px-5 py-2 rounded-pill fw-bold shadow-sm">
                                                {isEditing ? 'Güncelle' : 'Kaydet'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ODA KARTLARI LİSTESİ */}
                        {rooms.map(room => (
                            <div className="col-md-6 col-lg-4 mb-4" key={room._id}>
                                <div className="dashboard-card p-0 h-100 overflow-hidden">
                                    <div className="bg-light p-4 text-center position-relative">
                                        {/* İlk resmi kapak resmi olarak göster */}
                                        {room.images && room.images.length > 0 ? (
                                            <img src={`${API_BASE_URL}${room.images[0]}`} alt="Cover" className="w-100 h-100 position-absolute top-0 start-0" style={{objectFit:'cover', opacity:0.3}} />
                                        ) : null}
                                        <h1 className="m-0 position-relative">🛏️</h1>
                                        <span className="badge bg-primary position-absolute top-0 end-0 m-3">{room.type}</span>
                                    </div>
                                    <div className="p-4">
                                        <h5 className="fw-bold mb-1">{getLocalizedText(room.title)}</h5>
                                        <div className="mb-2 text-muted small d-flex gap-2">
                                            <span>📏 {room.size} m²</span>
                                            <span>👥 {room.capacity} Kişi</span>
                                        </div>
                                        <span className="badge bg-success mb-3">{room.price} ₺ / Gece</span>
                                        
                                        <div className="d-flex gap-2">
                                            <button onClick={() => handleEditClick(room)} className="btn btn-sm btn-outline-primary flex-grow-1">Düzenle</button>
                                            <button onClick={() => setDeleteModal({ show: true, roomId: room._id })} className="btn btn-sm btn-outline-danger">Sil</button>
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
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold m-0">Genel Bilgiler</h5>
                                <LanguageTabs activeLang={currentLang} setActiveLang={setCurrentLang} />
                            </div>

                            <form onSubmit={handleHotelUpdate}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">OTEL AÇIKLAMASI ({currentLang})</label>
                                    <div className="input-group">
                                        <span className="input-group-text">{LANGUAGES.find(l=>l.code===currentLang).flag}</span>
                                        <textarea className="form-control" rows="4" value={hotelDetails.description[currentLang] || ''} onChange={e => handleMultiLangChange('description', e.target.value, false)}></textarea>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small fw-bold">ADRES (Sabit)</label>
                                    <input type="text" className="form-control" value={hotelDetails.address} onChange={e => setHotelDetails({...hotelDetails, address: e.target.value})} />
                                </div>
                                
                                <h5 className="fw-bold mb-3 mt-5">Tesis Olanakları</h5>
                                <div className="row g-3 mb-5">
                                    {COMMON_FACILITIES.map((facility, index) => (
                                        <div className="col-md-6" key={index}>
                                            <div 
                                                className={`p-3 rounded border cursor-pointer d-flex align-items-center ${selectedFacilities.includes(facility) ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                                                onClick={() => setSelectedFacilities(prev => prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility])}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <div className="me-2">{selectedFacilities.includes(facility) ? '✅' : '⬜'}</div>
                                                {facility}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-end">
                                    <button type="submit" className="btn btn-primary rounded-pill fw-bold">Güncelle</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODALLAR --- */}
            
            {/* 1. STATUS MODAL */}
            {statusModal.show && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 2000 }}>
                    <div className="card shadow-lg p-4 text-center border-0" style={{ width: '350px', borderRadius: '20px' }}>
                        <div className={`mb-3 ${statusModal.type === 'success' ? 'text-success' : 'text-danger'}`} style={{ fontSize: '3rem' }}>
                            {statusModal.type === 'success' ? '✔' : '✖'}
                        </div>
                        <h5 className="fw-bold">{statusModal.type === 'success' ? 'Başarılı!' : 'Hata!'}</h5>
                        <p className="text-muted">{statusModal.message}</p>
                    </div>
                </div>
            )}

            {/* 2. SİLME ONAY MODALI */}
            {deleteModal.show && (
                <div className="expiry-overlay" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                    <div className="card shadow-lg p-4 text-center" style={{ width: '350px', borderRadius: '20px' }}>
                        <div className="mb-3 text-danger" style={{ fontSize: '3rem' }}>🗑️</div>
                        <h4 className="fw-bold mb-2">Emin misiniz?</h4>
                        <p className="text-muted small mb-4">Bu odayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-light rounded-pill px-4" onClick={() => setDeleteModal({ show: false, roomId: null })}>Vazgeç</button>
                            <button className="btn btn-danger rounded-pill px-4" onClick={confirmDelete}>Evet, Sil</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default RoomHotelPage;