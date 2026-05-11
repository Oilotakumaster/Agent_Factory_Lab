import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MainMenu from './pages/MainMenu';
import SimulationPage from './pages/SimulationPage';
import LoginPage from './pages/LoginPage';

// 使用您之前專案 (Course_Demo) 的 Client ID
const CLIENT_ID = '826098872175-uvv1odj4podc0dvhpp5oe5rk2u01nnk8.apps.googleusercontent.com';

// 路由守門員：沒登入的人會被踢回 /login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/menu" element={
            <Navigate to="/simulation/course_interview" replace />
          } />
          <Route path="/simulation/:mode" element={
            <ProtectedRoute>
              <SimulationPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
