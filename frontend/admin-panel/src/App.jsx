import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfa Bileşenleri
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

// 🛡️ Güvenlik Bileşenleri
import PrivateRoute from './components/PrivateRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute'; // 👈 YENİ EKLEDİK

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          
          {/* 👇 GİRİŞ YAPMIŞ KULLANICILARIN GİREMEMESİ GEREKEN SAYFALAR */}
          
          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            } 
          />
          
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } 
          />

          {/* Not: /verify, /forgot-password gibi sayfalar genellikle 
             hem giriş yapmış hem yapmamış kullanıcıya açık olabilir 
             veya mantığınıza göre onları da PublicOnlyRoute içine alabilirsiniz.
             Şimdilik onları dışarıda bırakıyorum.
          */}
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          
          {/* 🔒 KORUMALI ROTALAR (Sadece giriş yapmışlar girebilir) */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <SettingsPage />
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