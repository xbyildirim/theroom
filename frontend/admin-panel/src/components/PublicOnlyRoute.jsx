// frontend/admin-panel/src/components/PublicOnlyRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicOnlyRoute = ({ children }) => {
    // 1. Token var mı kontrol et
    const token = localStorage.getItem('token');

    // 2. Eğer token varsa (Kullanıcı zaten giriş yapmışsa), Dashboard'a yönlendir
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Token yoksa, istenilen sayfayı (Login/Register) göster
    return children;
};

export default PublicOnlyRoute;