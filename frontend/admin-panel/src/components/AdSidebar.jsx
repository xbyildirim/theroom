import React from 'react';

// 🎛️ REKLAM ALANINI BURADAN AÇIP KAPATABİLİRSİN
const SHOW_ADS = true; 

const AdSidebar = () => {
    if (!SHOW_ADS) return null;

    return (
        <div className="ad-sidebar-container fade-in">
            {/* Reklam Kartı 1: Güncelleme Notu */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="card-header bg-primary text-white text-center py-3" style={{ background: 'var(--primary-gradient)' }}>
                    <h6 className="mb-0 fw-bold">🚀 YENİ ÖZELLİK</h6>
                </div>
                <div className="card-body text-center">
                    <p className="small text-muted mb-3">
                        Artık rezervasyonlarınızı takvim üzerinden sürükle-bırak ile yönetebilirsiniz!
                    </p>
                    <button className="btn btn-sm btn-outline-primary rounded-pill w-100">İncele</button>
                </div>
            </div>

            {/* Reklam Kartı 2: İş Ortağı Reklamı (Örn: Booking entegrasyonu) */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', background: '#2b3674', color: '#fff' }}>
                <div className="card-body text-center p-4">
                    <div className="display-4 mb-2">⚡</div>
                    <h5 className="fw-bold">Booking.com Entegrasyonu</h5>
                    <p className="small opacity-75 mt-2">
                        Komisyon oranlarında %10 indirim fırsatını kaçırmayın.
                    </p>
                    <button className="btn btn-light text-primary btn-sm rounded-pill mt-2 w-100 fw-bold">
                        Hemen Başvur
                    </button>
                </div>
            </div>

            {/* Reklam Kartı 3: İpucu */}
            <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(5, 205, 153, 0.1)', border: '1px solid rgba(5, 205, 153, 0.2)' }}>
                <small className="fw-bold text-success d-block mb-1">💡 Biliyor muydunuz?</small>
                <small className="text-muted">
                    Profil resminizi güncelleyerek müşterilerinize daha güvenilir bir imaj çizebilirsiniz.
                </small>
            </div>
        </div>
    );
};

export default AdSidebar;