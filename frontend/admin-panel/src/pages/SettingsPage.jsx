import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/dashboard.css';
import AdSidebar from '../components/AdSidebar';
import MainNavbar from '../components/MainNavbar';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', customDomain: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('hotel');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData({
                name: parsed.name || '',
                customDomain: parsed.customDomain || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await api.put('/auth/update', formData);
            setMessage('✅ Bilgiler başarıyla güncellendi!');
            
            const updatedUser = { ...user, ...res.data.hotel };
            localStorage.setItem('hotel', JSON.stringify(updatedUser));
            setUser(updatedUser);

        } catch (error) {
            setMessage('❌ Güncelleme başarısız: ' + (error.response?.data?.message || 'Hata oluştu.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            
            <MainNavbar user={user} />

            <div className="container">
                <div className="row">
                    <div className="col-lg-8 mb-4">
                        <div className="dashboard-card p-5">
                            <h3 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Genel Ayarlar</h3>
                            
                            {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

                            <form onSubmit={handleUpdate}>
                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">İŞLETME ADI</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange}
                                        style={{ background: '#f8f9fa', border: 'none' }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label text-muted small fw-bold">ÖZEL DOMAIN ADRESİ</label>
                                    <div className="input-group">
                                        <span className="input-group-text border-0 bg-light">https://</span>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg" 
                                            name="customDomain" 
                                            placeholder="ornekotel.com"
                                            value={formData.customDomain} 
                                            onChange={handleChange}
                                            style={{ background: '#f8f9fa', border: 'none' }}
                                        />
                                    </div>
                                    <small className="text-muted mt-2 d-block">
                                        *Alan adınızı buraya girdikten sonra DNS ayarlarınızdan CNAME yönlendirmesi yapmayı unutmayın.
                                    </small>
                                </div>

                                <div className="d-flex justify-content-end mt-5">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-5 py-2 rounded-pill fw-bold"
                                        disabled={loading}
                                        style={{ background: 'var(--primary-gradient)', border: 'none' }}
                                    >
                                        {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <AdSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;