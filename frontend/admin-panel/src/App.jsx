import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfa Bileşenleri
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage'; // Yeni Dashboard Sayfası

// 🛡️ Güvenlik Bileşeni
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Herkese Açık Rotalar (Public Routes) */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* 🔒 Korumalı Rotalar (Private Routes) */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />

          {/* Yönlendirmeler */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<h1>404 | Sayfa Bulunamadı</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;