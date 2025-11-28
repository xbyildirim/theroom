import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        adminEmail: '',
        password: '',
        customDomain: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
            setMessage(response.data.message);
            setFormData({ name: '', adminEmail: '', password: '', customDomain: '' }); 
        } catch (err) {
            setError(err.response?.data?.message || 'Kayıt sırasında hata.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-5">
                        <div className="card card-custom">
                            <div className="card-header-custom">
                                <h3 className="mb-0">The Room</h3>
                                <small>Otel Yönetim Paneli Kayıt</small>
                            </div>
                            <div className="card-body p-4">
                                {message && <div className="alert alert-success">{message}</div>}
                                {error && <div className="alert alert-danger">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-floating mb-3">
                                        <input type="text" className="form-control" id="hotelName" name="name" placeholder="Otel Adı" value={formData.name} onChange={handleChange} required />
                                        <label htmlFor="hotelName">Otel Adı</label>
                                    </div>

                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="email" name="adminEmail" placeholder="name@example.com" value={formData.adminEmail} onChange={handleChange} required />
                                        <label htmlFor="email">Yönetici E-posta</label>
                                    </div>

                                    <div className="form-floating mb-3">
                                        <input type="password" className="form-control" id="password" name="password" placeholder="Şifre" value={formData.password} onChange={handleChange} required />
                                        <label htmlFor="password">Şifre</label>
                                    </div>

                                    <div className="form-floating mb-3">
                                        <input type="text" className="form-control" id="domain" name="customDomain" placeholder="bursahotel.com" value={formData.customDomain} onChange={handleChange} />
                                        <label htmlFor="domain">Özel Domain (Opsiyonel)</label>
                                    </div>

                                    <div className="d-grid gap-2 mt-4">
                                        <button className="btn btn-primary btn-custom" type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    İşleniyor...
                                                </>
                                            ) : '14 Gün Ücretsiz Başla'}
                                        </button>
                                    </div>
                                    <div className="text-center mt-3">
                                        <small className="text-muted">Zaten üye misiniz? <a href="/login" className="text-decoration-none">Giriş Yap</a></small>
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

export default RegisterForm;