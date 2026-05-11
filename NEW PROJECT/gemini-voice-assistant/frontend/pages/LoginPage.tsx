import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-0"
      ></motion.div>
      <div className="absolute w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"></div>
      
      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
          <Mic size={40} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">木人巷客服訓練模擬導師</h1>
        <p className="text-gray-400 mb-10 text-center text-sm leading-relaxed">
          歡迎來到內部教育訓練系統。請使用您的 Google 帳號登入以開始訓練。
        </p>

        <div className="w-full flex justify-center scale-110">
          <GoogleLogin
            onSuccess={credentialResponse => {
              if (credentialResponse.credential) {
                const decoded = jwtDecode(credentialResponse.credential);
                localStorage.setItem('user', JSON.stringify(decoded));
                navigate('/simulation/course_interview');
              }
            }}
            onError={() => {
              console.log('Login Failed');
            }}
            useOneTap
            theme="filled_black"
            shape="pill"
          />
        </div>
      </motion.div>
    </div>
  );
}
