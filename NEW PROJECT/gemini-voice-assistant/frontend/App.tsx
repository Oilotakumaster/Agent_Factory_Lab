import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, Volume2 } from 'lucide-react';
import { useLiveAPI, EMOTIONS } from './hooks/useLiveAPI';
import { TranscriptMessage } from './types';
import { GoogleGenAI } from '@google/genai';
import friendlyAssistantSkill from './skills/friendly_assistant.md?raw';
import angryCustomerSkill from './skills/angry_customer.md?raw';
import evaluationSopSkill from './skills/evaluation_sop.md?raw';

const ChatBubble: React.FC<{ message: TranscriptMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm'
        }`}
      >
        <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
          {isUser ? (
            <span className="font-medium">你</span>
          ) : (
            <>
              <Volume2 size={12} />
              <span className="font-medium">AI 助手</span>
            </>
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default function App() {
  const { connectionState, transcripts, error, currentEmotion, volume, connect, disconnect } = useLiveAPI();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [persona, setPersona] = useState(friendlyAssistantSkill);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Preload Avatar Images
  useEffect(() => {
    EMOTIONS.forEach(emotion => {
      const img = new Image();
      img.src = `/avatar_${emotion}.jpeg`;
    });
  }, []);

  const handleEvaluate = async () => {
    if (transcripts.length === 0) return;
    setIsEvaluating(true);
    setEvaluation(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
      const conversationText = transcripts.map(t => `${t.role === 'user' ? '學員' : '客戶'}: ${t.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: conversationText,
        config: {
          systemInstruction: evaluationSopSkill
        }
      });
      setEvaluation(response.text);
    } catch (e: any) {
      setEvaluation('評鑑失敗: ' + String(e.message || e));
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  const handleToggleConnect = () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect(persona);
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden font-sans text-gray-100 bg-gray-950 relative">
      
      {/* Full-Screen Blurred Background (Provides matching ambient color for the chat glass) */}
      <img 
        src={`/avatar_${currentEmotion}.jpeg`} 
        alt="ambient background" 
        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 z-0 transition-opacity duration-300"
      />

      {/* LEFT SIDE: AVATAR (2/3) - Perfectly Centered */}
      <div className="w-2/3 h-full relative z-10 overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Crisp Avatar Image */}
        <img 
          src={`/avatar_${currentEmotion}.jpeg`} 
          alt={`Avatar in ${currentEmotion} mood`} 
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300"
          style={{ transform: isConnected && volume > 2 ? `scale(${1 + (volume / 800)})` : 'scale(1)', transition: 'transform 0.1s' }}
        />
        
        {/* Dynamic Glowing Effect overlay based on volume */}
        {isConnected && volume > 2 && (
           <div 
             className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay z-0 pointer-events-none transition-all duration-75"
           ></div>
        )}

        {/* Emotion Tag */}
        <div className="absolute top-8 left-8 text-lg font-medium text-gray-300 bg-gray-900/60 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-gray-700/50 flex items-center gap-3 z-20">
          {isConnected && volume > 5 ? (
             <><Volume2 size={20} className="text-green-400 animate-pulse"/> <span className="text-green-400 tracking-wider">正在說話...</span></>
          ) : (
             <>Mood: <span className={`font-bold ${currentEmotion === 'angry' || currentEmotion === 'furious' ? 'text-red-400' : currentEmotion === 'happy' ? 'text-green-400' : 'text-blue-400'}`}>{currentEmotion.toUpperCase()}</span></>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: CHAT & CONTROLS (1/3) */}
      <div className="w-1/3 h-full flex flex-col bg-white/10 backdrop-blur-2xl border-l border-white/20 shadow-2xl relative z-20">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-black/20 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Volume2 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide">AI 導師木人巷</h1>
              <div className="flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2">
                  {isConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}
                  ></span>
                </span>
                <span className="text-gray-400">
                  {isConnected ? '連線中，請說話...' : isConnecting ? '正在建立連線...' : '已斷線'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-700 flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">角色設定 (Role)</label>
          <select 
            className="bg-gray-900/80 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            disabled={isConnected || isConnecting}
          >
            <option value={friendlyAssistantSkill}>🤖 友善的 AI 助手 (Skill.md)</option>
            <option value={angryCustomerSkill}>😡 暴怒的奧客 (Skill.md - 依階段推進)</option>
          </select>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-900/80 border-l-4 border-red-500 p-4 m-4 rounded-r-md flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        {/* Chat Area */}
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {transcripts.length === 0 && !isConnecting && !isConnected && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-70">
              <div className="w-20 h-20 rounded-full bg-gray-800/80 flex items-center justify-center mb-2 shadow-inner">
                <Mic size={32} className="text-gray-600" />
              </div>
              <p className="text-base font-medium">點擊下方按鈕開始對話</p>
            </div>
          )}

          {transcripts.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          
          {/* Typing indicator */}
          {isConnected && transcripts.length > 0 && transcripts[transcripts.length - 1].role === 'user' && (
             <div className="flex w-full mb-4 justify-start animate-pulse">
               <div className="bg-gray-800/80 text-gray-400 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin" />
                 <span>AI 正在思考...</span>
               </div>
             </div>
          )}
          
          {/* Evaluation Report */}
          {evaluation && (
            <div className="w-full mt-6 bg-indigo-900/60 backdrop-blur-md border border-indigo-500/50 rounded-xl p-5 shadow-xl mb-4">
              <div className="flex items-center gap-2 mb-3 border-b border-indigo-500/30 pb-2">
                <span className="text-lg">📋</span>
                <h3 className="text-base font-bold text-indigo-200">主管評鑑報告</h3>
              </div>
              <div className="text-indigo-100 text-sm leading-relaxed whitespace-pre-wrap">
                {evaluation}
              </div>
            </div>
          )}
        </main>

        {/* Control Bar */}
        <div className="p-6 bg-gray-900/80 border-t border-gray-800 backdrop-blur-md">
          {/* Bottom Bar Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleConnect}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all ${
                isConnected ? 'bg-red-500/80 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                isConnecting ? 'bg-blue-500/50 text-white cursor-not-allowed' :
                'bg-green-500 hover:bg-green-400 text-gray-900 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              }`}
              disabled={isConnecting}
              aria-label={isConnected ? '停止對話' : '開始對話'}
            >
              {isConnected && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"></div>
              )}
              {isConnecting ? (
                <Loader2 className="text-white animate-spin" size={28} />
              ) : isConnected ? (
                <MicOff className="text-white" size={28} />
              ) : (
                <Mic className="text-white" size={28} />
              )}
            </button>

            {!isConnected && !isConnecting && transcripts.length > 0 && (
              <button 
                onClick={handleEvaluate} 
                disabled={isEvaluating} 
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white rounded-xl px-5 py-3 shadow-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium"
              >
                {isEvaluating ? (
                  <><Loader2 className="animate-spin" size={18} /> 評鑑產生中...</>
                ) : (
                  <>📝 產生評鑑報告</>
                )}
              </button>
            )}
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">
            {isConnected ? '點擊停止錄音' : '點擊開始錄音'}
          </p>
        </div>
      </div>
    </div>
  );
}
