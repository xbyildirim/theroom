// frontend/admin-panel/src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // 1. Token'ı kontrol et
    const token = localStorage.getItem('token');

    // 2. Eğer token yoksa, Login sayfasına yönlendir
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Token varsa, istenilen sayfayı (children) göster
    return children;
};

export default PrivateRoute;