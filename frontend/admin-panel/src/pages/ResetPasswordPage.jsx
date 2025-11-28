import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, newPassword });
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Hata oluştu.');
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
                            <div className="card-header-custom bg-info text-white">
                                <h4 className="mb-0">Yeni Şifre Belirle</h4>
                            </div>
                            <div className="card-body p-4">
                                {message && <div className="alert alert-success">{message}</div>}
                                {error && <div className="alert alert-danger">{error}</div>}
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="form-floating mb-3">
                                        <input type="password" className="form-control" id="newPass" placeholder="Yeni Şifre" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                        <label htmlFor="newPass">Yeni Şifreniz</label>
                                    </div>
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-info text-white btn-custom" disabled={isLoading}>
                                            {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                                        </button>
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

export default ResetPasswordPage;