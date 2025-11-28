import React, { useState, useEffect } from 'react';
import api from '../api';
import '../css/dashboard.css';
import MainNavbar from '../components/MainNavbar';

// Başlangıç State'i (Temiz Form İçin)
const INITIAL_ROOM_STATE = {
    title: '', type: 'Standart', price: 0, size: 0, capacity: 2,
    bedType: '', floor: '', isAccessible: false,
    features: {
        tv: false, tvType: '', ac: false, heatingType: '', 
        minibar: false, safe: false, phone: false, 
        wifi: true, wifiSpeed: '', roomService: false
    },
    bathroom: {
        type: 'Duş', hairDryer: true, toiletries: true, cleaningFreq: 'Günlük'
    },
    balcony: false, view: '',
    smokingAllowed: false, petFriendly: false, cancellationPolicy: ''
};

const COMMON_FACILITIES = [
    'Ücretsiz Wifi', 'Otopark', 'Yüzme Havuzu', 'SPA & Wellness', 
    'Spor Salonu (Gym)', 'Restoran', 'Bar', 'Oda Servisi', 
    'Havalimanı Transferi', 'Çocuk Kulübü', 'Evcil Hayvan Dostu', 'Toplantı Salonu'
];

const RoomHotelPage = () => {
    const [activeTab, setActiveTab] = useState('rooms'); 
    const [user, setUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    
    // Otel Detay State
    const [hotelDetails, setHotelDetails] = useState({ description: '', address: '', phone: '', stars: 0 });
    const [selectedFacilities, setSelectedFacilities] = useState([]);

    // Oda Form State
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Düzenleme modunda mıyız?
    const [currentRoomId, setCurrentRoomId] = useState(null); // Düzenlenen odanın ID'si
    const [newRoom, setNewRoom] = useState(INITIAL_ROOM_STATE);

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

    // --- OTEL BİLGİLERİ ---
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
            alert('✅ Otel bilgileri güncellendi!');
        } catch (error) {
            alert('❌ Güncelleme başarısız.');
        }
    };

    const toggleFacility = (facility) => {
        if (selectedFacilities.includes(facility)) {
            setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
        } else {
            setSelectedFacilities([...selectedFacilities, facility]);
        }
    };

    // --- ODA FORM YÖNETİMİ ---
    
    // Nested (İç içe) state güncelleme fonksiyonu
    const handleRoomChange = (section, field, value) => {
        if (section) {
            setNewRoom(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setNewRoom(prev => ({ ...prev, [field]: value }));
        }
    };

    // Düzenle Butonuna Basınca
    const handleEditClick = (room) => {
        setNewRoom(room); // Mevcut veriyi forma doldur
        setIsEditing(true);
        setCurrentRoomId(room._id);
        setShowRoomForm(true);
        // Formun olduğu yere scroll yap (UX)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Yeni Ekle Butonuna Basınca
    const handleNewClick = () => {
        setNewRoom(INITIAL_ROOM_STATE);
        setIsEditing(false);
        setCurrentRoomId(null);
        setShowRoomForm(true);
    };

    // Form Submit (Ekleme veya Güncelleme)
    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (isEditing) {
                // GÜNCELLEME (PUT)
                res = await api.put(`/rooms/${currentRoomId}`, newRoom);
                // Listeyi güncelle (Eski odayı çıkar, yenisini koy)
                setRooms(rooms.map(r => r._id === currentRoomId ? res.data : r));
                alert('✅ Oda başarıyla güncellendi.');
            } else {
                // EKLEME (POST)
                res = await api.post('/rooms', newRoom);
                setRooms([res.data, ...rooms]);
                alert('✅ Yeni oda eklendi.');
            }
            setShowRoomForm(false);
            setNewRoom(INITIAL_ROOM_STATE);
        } catch (error) {
            alert('İşlem başarısız.');
        }
    };

    const handleDeleteRoom = async (id) => {
        if (!window.confirm('Bu odayı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/rooms/${id}`);
            setRooms(rooms.filter(r => r._id !== id));
        } catch (error) {
            alert('Silinemedi.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            <MainNavbar user={user} />

            <div className="container pb-5">
                <h3 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Oda ve Otel Yönetimi</h3>

                <ul className="nav nav-pills mb-4 p-2 bg-white rounded-pill shadow-sm d-inline-flex">
                    <li className="nav-item">
                        <button 
                            className={`nav-link rounded-pill px-4 ${activeTab === 'rooms' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rooms')}
                        >
                            🛏️ Odalar
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link rounded-pill px-4 ${activeTab === 'hotel' ? 'active' : ''}`}
                            onClick={() => setActiveTab('hotel')}
                        >
                            🏨 Otel Özellikleri
                        </button>
                    </li>
                </ul>

                {/* --- TAB 1: ODALAR LİSTESİ --- */}
                {activeTab === 'rooms' && (
                    <div className="row">
                        <div className="col-12 mb-4 text-end">
                            {!showRoomForm && (
                                <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleNewClick}>
                                    + Yeni Oda Ekle
                                </button>
                            )}
                        </div>

                        {/* ODA EKLEME / DÜZENLEME FORMU */}
                        {showRoomForm && (
                            <div className="col-12 mb-5">
                                <div className="dashboard-card p-4 border-left-primary">
                                    <div className="d-flex justify-content-between mb-4">
                                        <h4 className="fw-bold">{isEditing ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}</h4>
                                        <button className="btn btn-sm btn-light" onClick={() => setShowRoomForm(false)}>X Kapat</button>
                                    </div>
                                    
                                    <form onSubmit={handleRoomSubmit}>
                                        {/* BÖLÜM 1: GENEL BİLGİLER */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">1. Genel Bilgiler & Fiyat</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="small text-muted fw-bold">ODA ADI</label>
                                                <input type="text" className="form-control" required value={newRoom.title} 
                                                    onChange={e => handleRoomChange(null, 'title', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">TİP</label>
                                                <select className="form-select" value={newRoom.type} onChange={e => handleRoomChange(null, 'type', e.target.value)}>
                                                    <option value="Standart">Standart</option>
                                                    <option value="Deluxe">Deluxe</option>
                                                    <option value="Suite">Suite</option>
                                                    <option value="Family">Aile</option>
                                                    <option value="King">King</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">FİYAT (₺)</label>
                                                <input type="number" className="form-control" required value={newRoom.price} 
                                                    onChange={e => handleRoomChange(null, 'price', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">BOYUT (m²)</label>
                                                <input type="number" className="form-control" value={newRoom.size} 
                                                    onChange={e => handleRoomChange(null, 'size', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">KAPASİTE</label>
                                                <input type="number" className="form-control" value={newRoom.capacity} 
                                                    onChange={e => handleRoomChange(null, 'capacity', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">YATAK TİPİ</label>
                                                <input type="text" className="form-control" placeholder="Örn: 1 Çift Kişilik" value={newRoom.bedType} 
                                                    onChange={e => handleRoomChange(null, 'bedType', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">KAT</label>
                                                <input type="text" className="form-control" placeholder="Örn: 2. Kat" value={newRoom.floor} 
                                                    onChange={e => handleRoomChange(null, 'floor', e.target.value)} />
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.isAccessible} 
                                                        onChange={e => handleRoomChange(null, 'isAccessible', e.target.checked)} />
                                                    <label className="form-check-label">Engelli Erişimine Uygun</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BÖLÜM 2: DONANIM & EŞYALAR */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">2. Oda Donanımı</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.tv} 
                                                        onChange={e => handleRoomChange('features', 'tv', e.target.checked)} />
                                                    <label className="form-check-label">Televizyon</label>
                                                </div>
                                                {newRoom.features.tv && (
                                                    <input type="text" className="form-control form-control-sm mt-1" placeholder="Tip (LED, Smart)" 
                                                        value={newRoom.features.tvType} onChange={e => handleRoomChange('features', 'tvType', e.target.value)} />
                                                )}
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.ac} 
                                                        onChange={e => handleRoomChange('features', 'ac', e.target.checked)} />
                                                    <label className="form-check-label">Klima / Isıtma</label>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.wifi} 
                                                        onChange={e => handleRoomChange('features', 'wifi', e.target.checked)} />
                                                    <label className="form-check-label">Wifi</label>
                                                </div>
                                                {newRoom.features.wifi && (
                                                    <input type="text" className="form-control form-control-sm mt-1" placeholder="Hız / Limit" 
                                                        value={newRoom.features.wifiSpeed} onChange={e => handleRoomChange('features', 'wifiSpeed', e.target.value)} />
                                                )}
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.minibar} 
                                                        onChange={e => handleRoomChange('features', 'minibar', e.target.checked)} />
                                                    <label className="form-check-label">Minibar</label>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.safe} 
                                                        onChange={e => handleRoomChange('features', 'safe', e.target.checked)} />
                                                    <label className="form-check-label">Kasa</label>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.features.roomService} 
                                                        onChange={e => handleRoomChange('features', 'roomService', e.target.checked)} />
                                                    <label className="form-check-label">Oda Servisi</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BÖLÜM 3: BANYO & DİĞER */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">3. Banyo & Diğer Alanlar</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">BANYO TİPİ</label>
                                                <select className="form-select" value={newRoom.bathroom.type} onChange={e => handleRoomChange('bathroom', 'type', e.target.value)}>
                                                    <option>Duş</option>
                                                    <option>Küvet</option>
                                                    <option>Jakuzi</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="small text-muted fw-bold">TEMİZLİK</label>
                                                <select className="form-select" value={newRoom.bathroom.cleaningFreq} onChange={e => handleRoomChange('bathroom', 'cleaningFreq', e.target.value)}>
                                                    <option>Günlük</option>
                                                    <option>İki Günde Bir</option>
                                                    <option>Haftalık</option>
                                                </select>
                                            </div>
                                            <div className="col-md-3 pt-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.bathroom.hairDryer} 
                                                        onChange={e => handleRoomChange('bathroom', 'hairDryer', e.target.checked)} />
                                                    <label className="form-check-label">Saç Kurutma</label>
                                                </div>
                                            </div>
                                            <div className="col-md-3 pt-4">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.balcony} 
                                                        onChange={e => handleRoomChange(null, 'balcony', e.target.checked)} />
                                                    <label className="form-check-label">Balkon / Teras</label>
                                                </div>
                                            </div>
                                            {newRoom.balcony && (
                                                <div className="col-md-12">
                                                    <input type="text" className="form-control" placeholder="Manzara Bilgisi (Deniz, Dağ)" 
                                                        value={newRoom.view} onChange={e => handleRoomChange(null, 'view', e.target.value)} />
                                                </div>
                                            )}
                                        </div>

                                        {/* BÖLÜM 4: KURALLAR & POLİTİKA */}
                                        <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">4. Kurallar & İptal Politikası</h6>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.petFriendly} 
                                                        onChange={e => handleRoomChange(null, 'petFriendly', e.target.checked)} />
                                                    <label className="form-check-label">Evcil Hayvan Dostu 🐶</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={newRoom.smokingAllowed} 
                                                        onChange={e => handleRoomChange(null, 'smokingAllowed', e.target.checked)} />
                                                    <label className="form-check-label">Sigara İçilebilir 🚬</label>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <label className="small text-muted fw-bold">İPTAL POLİTİKASI</label>
                                                <textarea className="form-control" rows="2" placeholder="Örn: Girişten 24 saat öncesine kadar ücretsiz." 
                                                    value={newRoom.cancellationPolicy} onChange={e => handleRoomChange(null, 'cancellationPolicy', e.target.value)}></textarea>
                                            </div>
                                        </div>

                                        <div className="text-end border-top pt-3">
                                            <button type="button" className="btn btn-light me-2" onClick={() => setShowRoomForm(false)}>İptal</button>
                                            <button type="submit" className="btn btn-success px-4 fw-bold">
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
                                        <h1 className="m-0">🛏️</h1>
                                        <span className="badge bg-primary position-absolute top-0 end-0 m-3">{room.type}</span>
                                    </div>
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="fw-bold m-0">{room.title}</h5>
                                            <span className="badge bg-success">{room.price} ₺</span>
                                        </div>
                                        <p className="text-muted small mb-3">
                                            {room.size} m² • {room.capacity} Kişilik • {room.view || 'Manzara Yok'}
                                        </p>
                                        
                                        {/* Özellik Rozetleri */}
                                        <div className="mb-3 d-flex flex-wrap gap-1">
                                            {room.features.wifi && <span className="badge bg-light text-dark border">Wifi</span>}
                                            {room.features.ac && <span className="badge bg-light text-dark border">Klima</span>}
                                            {room.features.tv && <span className="badge bg-light text-dark border">TV</span>}
                                            {room.balcony && <span className="badge bg-light text-dark border">Balkon</span>}
                                        </div>

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

                {/* --- TAB 2: OTEL ÖZELLİKLERİ --- */}
                {activeTab === 'hotel' && (
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="dashboard-card p-5">
                                <form onSubmit={handleHotelUpdate}>
                                    <h5 className="fw-bold mb-4">Genel Bilgiler</h5>
                                    
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">OTEL AÇIKLAMASI</label>
                                        <textarea className="form-control" rows="4" 
                                            value={hotelDetails.description} onChange={e => setHotelDetails({...hotelDetails, description: e.target.value})}></textarea>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-md-8">
                                            <label className="form-label text-muted small fw-bold">ADRES</label>
                                            <input type="text" className="form-control" 
                                                value={hotelDetails.address} onChange={e => setHotelDetails({...hotelDetails, address: e.target.value})} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label text-muted small fw-bold">YILDIZ SAYISI</label>
                                            <select className="form-select" value={hotelDetails.stars} onChange={e => setHotelDetails({...hotelDetails, stars: e.target.value})}>
                                                <option value="0">Seçiniz</option>
                                                <option value="1">1 Yıldız</option>
                                                <option value="2">2 Yıldız</option>
                                                <option value="3">3 Yıldız</option>
                                                <option value="4">4 Yıldız</option>
                                                <option value="5">5 Yıldız</option>
                                            </select>
                                        </div>
                                    </div>

                                    <h5 className="fw-bold mb-3 mt-5">Tesis Olanakları</h5>
                                    <div className="row g-3 mb-5">
                                        {COMMON_FACILITIES.map((facility, index) => (
                                            <div className="col-md-6" key={index}>
                                                <div 
                                                    className={`p-3 rounded border cursor-pointer d-flex align-items-center ${selectedFacilities.includes(facility) ? 'bg-primary text-white border-primary' : 'bg-white'}`}
                                                    onClick={() => toggleFacility(facility)}
                                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                >
                                                    <div className="me-2">
                                                        {selectedFacilities.includes(facility) ? '✅' : '⬜'}
                                                    </div>
                                                    {facility}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-end">
                                        <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill fw-bold" style={{ background: 'var(--primary-gradient)', border: 'none' }}>
                                            Kaydet ve Güncelle
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RoomHotelPage;