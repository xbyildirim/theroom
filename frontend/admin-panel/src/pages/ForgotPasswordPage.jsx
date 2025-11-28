import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Bir hata oluştu.');
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
                            <div className="card-header-custom bg-warning text-dark">
                                <h4 className="mb-0">Şifremi Unuttum</h4>
                            </div>
                            <div className="card-body p-4 text-center">
                                <p className="text-muted mb-4">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
                                
                                {message && <div className="alert alert-success">{message}</div>}
                                {error && <div className="alert alert-danger">{error}</div>}
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="forgotEmail" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        <label htmlFor="forgotEmail">E-posta Adresiniz</label>
                                    </div>
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-warning btn-custom text-dark" disabled={isLoading}>
                                            {isLoading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-3">
                                    <a href="/login" className="text-decoration-none text-muted small">← Giriş Sayfasına Dön</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;