// frontend/admin-panel/src/api.js

import axios from 'axios';

// Temel API instance'ı oluştur
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 🛡️ İstek Atılmadan Önce Araya Gir (Interceptor)
api.interceptors.request.use(
    (config) => {
        // LocalStorage'dan token'ı al
        const token = localStorage.getItem('token');
        
        // Eğer token varsa, Header'a ekle
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 🛡️ Yanıt Geldikten Sonra Araya Gir (Opsiyonel ama önerilir)
// Eğer token süresi dolmuşsa (401 hatası), kullanıcıyı otomatik logout yap.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401)) {
            // Token geçersizse temizle ve login'e at
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;