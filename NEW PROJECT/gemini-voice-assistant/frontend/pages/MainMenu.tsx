import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Frown, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainMenu() {
  const navigate = useNavigate();
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-gray-950 z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none"></div>

      {/* User Profile Bar */}
      {user && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-4 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <img src={user.picture} alt="profile" className="w-8 h-8 rounded-full border border-white/20" />
          <span className="text-sm font-medium text-gray-200">{user.name}</span>
          <button 
            onClick={handleLogout}
            className="ml-2 p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors"
            title="登出"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}

      <div className="z-10 text-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-sm">
          木人巷客服訓練模擬導師
        </h1>
        <p className="text-gray-400 text-lg">選擇您的情境挑戰，開始即時語音對練</p>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }}
        className="z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full px-4"
      >
        {/* Card 1: Course Interview */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
          }}
          onClick={() => navigate('/simulation/course_interview')}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-500/30">
            <span className="text-blue-400 text-2xl">🎓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">課程測驗：面試開場</h2>
          <p className="text-gray-400 leading-relaxed mb-6 flex-grow text-sm">
            扮演業務主管 George。AI 將扮演應徵者 Lisa 並給予即時打分，測試您的面試開場 4 大技巧。
          </p>
          <div className="flex items-center text-blue-400 font-medium text-sm group-hover:text-blue-300 mt-auto">
            開始測驗 <Play size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: Course Resume */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
          }}
          onClick={() => navigate('/simulation/course_resume')}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-red-500/30">
            <span className="text-red-400 text-2xl">📋</span>
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">課程測驗二：釐清履歷</h2>
          <p className="text-gray-400 leading-relaxed mb-6 flex-grow text-sm">
            接續開場步驟，測試您是否能透過「肯定成就、釐清疑點、尋找議題」三技巧，精準核實 Lisa 的背景。
          </p>
          <div className="flex items-center text-red-400 font-medium text-sm group-hover:text-red-300 mt-auto">
            開始測驗 <Play size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 3: Course Questioning */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
          }}
          onClick={() => navigate('/simulation/course_questioning')}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-purple-500/30">
            <span className="text-purple-400 text-2xl">🗣️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">課程測驗三：行為提問</h2>
          <p className="text-gray-400 leading-relaxed mb-6 flex-grow text-sm">
            進入面試核心！考驗您能否設計出包含情境衝突、要求真實經驗且不具誘導性的「行為探問」來核實職能。
          </p>
          <div className="flex items-center text-purple-400 font-medium text-sm group-hover:text-purple-300 mt-auto">
            開始測驗 <Play size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 4: Course Evaluating */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
          }}
          onClick={() => navigate('/simulation/course_evaluating')}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] overflow-hidden flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-green-500/30">
            <span className="text-green-400 text-2xl">🔍</span>
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">課程測驗四：行為評估</h2>
          <p className="text-gray-400 leading-relaxed mb-6 flex-grow text-sm">
            挑戰最難關卡！透過聆聽應徵者的真實語音回答，即時剖析故事的完整性、有效性與職能強度。
          </p>
          <div className="flex items-center text-green-400 font-medium text-sm group-hover:text-green-300 mt-auto">
            開始測驗 <Play size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 5: Course Probing */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
          }}
          onClick={() => navigate('/simulation/course_probing')}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(234,179,8,0.15)] overflow-hidden flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-yellow-500/30">
            <span className="text-yellow-400 text-2xl">🎣</span>
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">課程測驗五：行為追問</h2>
          <p className="text-gray-400 leading-relaxed mb-6 flex-grow text-sm">
            最後一步！根據評估結果，練習使用非誘導性的追問技巧，挖出應徵者隱藏在假話或空話背後的真實經歷。
          </p>
          <div className="flex items-center text-yellow-400 font-medium text-sm group-hover:text-yellow-300 mt-auto">
            開始測驗 <Play size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 6: Course Closing */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
          }}
          onClick={() => navigate('/simulation/course_closing')}
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl cursor-pointer hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(236,72,153,0.15)] overflow-hidden flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-pink-500/30">
            <span className="text-pink-400 text-2xl">🤝</span>
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">課程測驗六：面試結語</h2>
          <p className="text-gray-400 leading-relaxed mb-6 flex-grow text-sm">
            完美收尾！提供發問機會、說明後續流程並表達感謝，為這場面談畫下溫馨專業的句點。
          </p>
          <div className="flex items-center text-pink-400 font-medium text-sm group-hover:text-pink-300 mt-auto">
            開始測驗 <Play size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
