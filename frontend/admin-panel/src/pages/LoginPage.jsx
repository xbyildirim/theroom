import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
    const [formData, setFormData] = useState({ adminEmail: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('hotel', JSON.stringify(response.data.hotel));
            navigate('/dashboard'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Giriş başarısız.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card card-custom">
                            <div className="card-header-custom bg-success"> {/* Login için Yeşil Başlık */}
                                <h3 className="mb-0">Giriş Yap</h3>
                                <small>Yönetim Paneline Erişin</small>
                            </div>
                            <div className="card-body p-4">
                                {error && <div className="alert alert-danger text-center">{error}</div>}
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="loginEmail" name="adminEmail" placeholder="name@example.com" value={formData.adminEmail} onChange={handleChange} required />
                                        <label htmlFor="loginEmail">E-posta Adresi</label>
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input type="password" className="form-control" id="loginPass" name="password" placeholder="Şifre" value={formData.password} onChange={handleChange} required />
                                        <label htmlFor="loginPass">Şifre</label>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="rememberMe" />
                                            <label className="form-check-label text-muted small" htmlFor="rememberMe">Beni Hatırla</label>
                                        </div>
                                        <a href="/forgot-password" className="small text-decoration-none">Şifremi Unuttum?</a>
                                    </div>

                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-success btn-custom" disabled={isLoading}>
                                            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                        </button>
                                    </div>

                                    <div className="text-center mt-4">
                                        <p className="mb-0 small text-muted">Henüz hesabınız yok mu?</p>
                                        <a href="/register" className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4">Hemen Kayıt Ol</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;