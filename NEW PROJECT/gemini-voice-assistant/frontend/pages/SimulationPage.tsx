import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Loader2, AlertCircle, Volume2, ArrowLeft, Smile, User, List, Shield } from 'lucide-react';
import { useLiveAPI, EMOTIONS } from '../hooks/useLiveAPI';
import { TranscriptMessage } from '../types';
import { GoogleGenAI } from '@google/genai';
import friendlyAssistantSkill from '../skills/friendly_assistant.md?raw';
import angryCustomerSkill from '../skills/angry_customer.md?raw';
import vipCustomerSkill from '../skills/vip_customer.md?raw';
import courseInterviewSkill from '../skills/course_interview.md?raw';
import courseResumeSkill from '../skills/course_resume.md?raw';
import courseQuestioningSkill from '../skills/course_questioning.md?raw';
import courseEvaluatingSkill from '../skills/course_evaluating.md?raw';
import courseProbingSkill from '../skills/course_probing.md?raw';
import courseClosingSkill from '../skills/course_closing.md?raw';
import courseInterviewCoachSkill from '../skills/course_interview_coach.md?raw';
import courseResumeCoachSkill from '../skills/course_resume_coach.md?raw';
import courseQuestioningCoachSkill from '../skills/course_questioning_coach.md?raw';
import courseEvaluatingCoachSkill from '../skills/course_evaluating_coach.md?raw';
import courseProbingCoachSkill from '../skills/course_probing_coach.md?raw';
import courseClosingCoachSkill from '../skills/course_closing_coach.md?raw';
import evaluationSopSkill from '../skills/evaluation_sop.md?raw';

const ChatBubble: React.FC<{ message: TranscriptMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-[1.5rem] px-5 py-3 shadow-md backdrop-blur-sm ${
          isUser
            ? 'bg-blue-600 text-white border border-blue-500 rounded-tr-sm'
            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
        }`}
      >
        <div className="flex items-center gap-2 mb-1 opacity-80 text-xs">
          {isUser ? (
            <span className="font-medium text-blue-100">你</span>
          ) : (
            <>
              <Volume2 size={12} className="text-slate-400" />
              <span className="font-medium text-slate-500">應徵者 Lisa</span>
            </>
          )}
        </div>
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

const contextSummaries: Record<string, string[]> = {
  course_interview: [
    "George是鴻展公司業務部主管。該部門最近要招聘一名PM，在求職網站刊登廣告後，收到了5份履歷表。",
    "George覺得其中3名應徵者條件不錯，便約了排名最高的Lisa，在今天進行面談...",
    "Lisa住處離公司相當遠，所以很早就開車出門，還提前15分鐘抵達公司，現正在面談室等候中。",
    "此時George進入面談室，兩人握手寒暄後，分別坐下..."
  ],
  course_resume: [
    "George 和 Lisa 已經結束了簡單的開場寒暄。接下來，George 準備根據 Lisa 提交的履歷表，針對她的過去經歷進行深入的探問與釐清...",
    "Lisa 過去曾在 A、B 兩家公司擔任業務，並且有著不錯的表現。然而，George 注意到在 2018 年到 2019 年之間，她的履歷上有一段半年的「空窗期」。",
    "George 決定在接下來的對談中，試探性地詢問這段經歷，看看 Lisa 會如何回應..."
  ],
  course_questioning: [
    "履歷背景已經大致釐清完畢。現在，面試進入了關鍵的「行為提問」階段。",
    "為了確認 Lisa 是否真的具備擔任 PM 所需的核心能力，George 需要透過行為事例面談法（BEI），測試她是否具備「主動積極」、「計畫與組織」或「說服能力」。",
    "George 清了清喉嚨，準備提出一個要求對方分享真實經驗的開放式好問題..."
  ],
  course_evaluating: [
    "面對 George 提出的行為問題，Lisa 給出了一段關於她如何展現「主動積極」的經驗分享。",
    "然而，這段回答聽起來似乎有些空泛，更像是理論或假設性的說法，甚至連主角都變成了「我們團隊」。",
    "George 在心中快速盤算著：這段故事是否真的具備了完整的情境、行動與結果？這究竟是不是她個人的真實經歷呢？"
  ],
  course_probing: [
    "在評估過 Lisa 略顯模糊的回答後，George 決定不輕易放過這個疑點，他必須進一步「追問」。",
    "此時此刻，George 需要運用不帶誘導性的問題，像剝洋蔥般一層一層地挖出關鍵的具體細節，引導 Lisa 講出那段經歷的真實面貌。",
    "「那妳當時具體採取了什麼行動？」George 看著 Lisa，冷靜地問道..."
  ],
  course_closing: [
    "經過了一番深入且充滿挑戰的對談，這次的面試終於來到了尾聲。",
    "無論剛才的表現如何，George 都準備展現出主管的專業與風度，給予 Lisa 提問的機會，並向她說明後續的評估流程。",
    "「好的，我們今天的面談大概就到這邊。不曉得妳針對這個職缺或我們公司，有沒有什麼想問的問題？」George 微笑著說..."
  ]
};

const taskInstructions: Record<string, string> = {
  course_interview: "開場技巧",
  course_resume: "釐清履歷技巧",
  course_questioning: "行為提問技巧",
  course_evaluating: "評估技巧",
  course_probing: "追問技巧",
  course_closing: "結語技巧"
};

const commonCommunicationSkills = [
  "C1 尊重肯定", "C2 避免批評", "C3 主動釐清", "C4 鼓勵參與",
  "C5 耐心等候", "C6 正確引導", "C7 掌握流程", "C8 轉折自然"
];

const evaluationCriteriaMap: Record<string, { title: string; skills: string[] }> = {
  course_interview: {
    title: "1 開場技巧",
    skills: ["1.1 表達歡迎", "1.2 自我介紹", "1.3 說明流程", "1.4 承諾保密"]
  },
  course_resume: {
    title: "2 釐清履歷技巧",
    skills: ["2.1 肯定成就", "2.2 釐清疑點", "2.3 尋找議題"]
  },
  course_questioning: {
    title: "3 行為提問技巧",
    skills: ["3.1 包含情境衝突", "3.2 契合目標職能", "3.3 要求真實經驗", "3.4 避免暗示誘導", "3.5 保持觀點平衡"]
  },
  course_evaluating: {
    title: "4 評估有效性技巧",
    skills: ["4.1 是否具備四要素", "4.2 是否契合目標職能", "4.3 是否為真實經驗", "4.4 應徵者是否為主角"]
  },
  course_probing: {
    title: "5 追問技巧",
    skills: ["5.1 追問欠缺的元素", "5.2 追問職能相關內容", "5.3 追問具體經驗", "5.4 追問難以造假之細節"]
  },
  course_closing: {
    title: "6 結語技巧",
    skills: ["6.1 提供發問機會", "6.2 說明後續流程", "6.3 表達感謝尊重"]
  }
};

const nextStepMap: Record<string, string | null> = {
  course_interview: "/simulation/course_resume",
  course_resume: "/simulation/course_questioning",
  course_questioning: "/simulation/course_evaluating",
  course_evaluating: "/simulation/course_probing",
  course_probing: "/simulation/course_closing",
  course_closing: null
};

export default function SimulationPage() {
  const { connectionState, transcripts, error, currentEmotion, emotionTick, volume, connect, disconnect } = useLiveAPI();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  
  const persona = 
    mode === 'angry' ? angryCustomerSkill : 
    mode === 'vip' ? vipCustomerSkill : 
    mode === 'course_interview' ? courseInterviewSkill : 
    mode === 'course_resume' ? courseResumeSkill : 
    mode === 'course_questioning' ? courseQuestioningSkill : 
    mode === 'course_evaluating' ? courseEvaluatingSkill : 
    mode === 'course_probing' ? courseProbingSkill : 
    mode === 'course_closing' ? courseClosingSkill : 
    friendlyAssistantSkill;

  useEffect(() => {
    if (connectionState === 'connected' || connectionState === 'connecting') {
      disconnect();
    }
  }, [mode, connectionState, disconnect]);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [avatarImage, setAvatarImage] = useState('/avatar_neutral.jpeg');
  const [activeTab, setActiveTab] = useState(2); // 預設顯示「進行演練」
  
  // 技巧檢討專用狀態
  const [showMockReport, setShowMockReport] = useState(false);
  useEffect(() => {
    setShowMockReport(false);
  }, [mode]);
  
  // 新增狀態來追蹤步驟是否展開
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    '1': mode?.includes('course_interview') || false,
    '2': mode?.includes('course_resume') || false,
    '3': mode?.includes('course_questioning') || false,
    '4': mode?.includes('course_evaluating') || false,
    '5': mode?.includes('course_probing') || false,
    '6': mode?.includes('course_closing') || false,
  });

  const [expandedPrinciples, setExpandedPrinciples] = useState(true);
  const [expandedIntro, setExpandedIntro] = useState(true);

  // 當路由改變時，自動展開對應的步驟
  useEffect(() => {
    if (mode?.includes('course_interview')) setExpandedSteps(prev => ({...prev, '1': true}));
    if (mode?.includes('course_resume')) setExpandedSteps(prev => ({...prev, '2': true}));
    if (mode?.includes('course_questioning')) setExpandedSteps(prev => ({...prev, '3': true}));
    if (mode?.includes('course_evaluating')) setExpandedSteps(prev => ({...prev, '4': true}));
    if (mode?.includes('course_probing')) setExpandedSteps(prev => ({...prev, '5': true}));
    if (mode?.includes('course_closing')) setExpandedSteps(prev => ({...prev, '6': true}));
  }, [mode]);

  const toggleStep = (step: string) => {
    setExpandedSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };
  
  // 理論課程專用狀態
  const [selectedTheoryBtn, setSelectedTheoryBtn] = useState<string | null>(null);
  const isTheoryMode = mode?.endsWith('_theory');

  // 切換模式時重設選取的理論按鈕
  useEffect(() => {
    setSelectedTheoryBtn(null);
  }, [mode]);

  // 定義每種情緒有多少張變體圖片 (目前 angry 有 4 張)
  const emotionVariations: Record<string, number> = {
    angry: 4,
  };

  useEffect(() => {
    if (mode === 'vip') {
      // VIP 客戶專屬高畫質圖片，每種情緒有 3 張變體隨機切換
      const rand = Math.floor(Math.random() * 3) + 1;
      setAvatarImage(`/vip_${currentEmotion}_${rand}.png`);
      return;
    }

    // 判斷是否為課程模式 (Lisa 的角色)
    if (mode?.startsWith('course_')) {
      const allowedLisaEmotions = ['neutral', 'smiling', 'thinking', 'talking'];
      const finalEmotion = allowedLisaEmotions.includes(currentEmotion) ? currentEmotion : 'neutral';
      setAvatarImage(`/avatar_lisa_${finalEmotion}.png`);
      return;
    }

    const maxVars = emotionVariations[currentEmotion];
    if (maxVars && maxVars > 1) {
      // 在 1 到 maxVars 之間隨機抽一張 (例如 avatar_angry_2.jpeg)
      const rand = Math.floor(Math.random() * maxVars) + 1;
      setAvatarImage(`/avatar_${currentEmotion}_${rand}.jpeg`);
    } else {
      setAvatarImage(`/avatar_${currentEmotion}.jpeg`);
    }
  }, [currentEmotion, emotionTick, mode]);

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
      const conversationText = transcripts.map(t => `${t.role === 'user' ? '學員' : '客戶'}: ${t.text}`).join('\n');
      
      let coachPersona = evaluationSopSkill;
      if (mode === 'course_interview') coachPersona = courseInterviewCoachSkill;
      else if (mode === 'course_resume') coachPersona = courseResumeCoachSkill;
      else if (mode === 'course_questioning') coachPersona = courseQuestioningCoachSkill;
      else if (mode === 'course_evaluating') coachPersona = courseEvaluatingCoachSkill;
      else if (mode === 'course_probing') coachPersona = courseProbingCoachSkill;
      else if (mode === 'course_closing') coachPersona = courseClosingCoachSkill;

      // 建立原始 Vertex AI REST API Request Body
      const requestBody = {
        contents: [{ role: "user", parts: [{ text: conversationText }] }],
        systemInstruction: { parts: [{ text: coachPersona }] }
      };

      // 透過我們的 Node.js 代理伺服器發送請求，以使用 Google Application Default Credentials
      const proxyResponse = await fetch('/api-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Proxy': 'ydanYvGZG6637-1n4-eiPt8mMI_7B6g0', // 與 server.js 中的 PROXY_HEADER 相對應
        },
        body: JSON.stringify({
          originalUrl: "https://aiplatform.googleapis.com/v1beta1/publishers/google/models/gemini-2.5-flash:generateContent",
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
      });

      if (!proxyResponse.ok) {
        const errText = await proxyResponse.text();
        throw new Error(`伺服器錯誤 ${proxyResponse.status}: ${errText}`);
      }

      const data = await proxyResponse.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "無法解析回應";
      setEvaluation(resultText);
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
    <div className="flex w-full h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* 側邊導覽列 (LMS Sidebar) */}
      <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.03)] z-10 hidden md:flex">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-slate-800">
          <span className="font-bold tracking-wide">招募面談模擬訓練學程</span>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {/* 模組一 */}
          <div className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-sm flex items-center text-slate-600 transition-colors">
            <div className="w-1.5 h-1.5 bg-slate-400 mr-3 rounded-sm"></div> 模組一：基礎知識
          </div>
          
          {/* 模組二 */}
          <div className="px-5 py-3 bg-blue-50/50 cursor-pointer text-sm font-bold flex items-center text-blue-900 border-l-4 border-blue-500">
            <div className="w-1.5 h-1.5 bg-blue-600 mr-3 rounded-sm"></div> 模組二：面談步驟
          </div>
          
          {/* 模組二子選單 */}
          <div className="bg-slate-50/50 border-y border-slate-100 text-sm py-2">
            <div 
              onClick={() => setExpandedPrinciples(prev => !prev)}
              className="px-9 py-2 hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors flex items-center"
            >
               <span className={`mr-2 text-[10px] ${expandedPrinciples ? 'text-blue-500' : 'opacity-50'}`}>{expandedPrinciples ? '▼' : '▶'}</span> 面談溝通原則
            </div>
            {expandedPrinciples && (
               <div className="pl-[3.25rem] pr-4 mt-1 text-slate-600 space-y-0.5 mb-2">
                 <div 
                   onClick={() => setExpandedIntro(prev => !prev)}
                   className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors flex items-center"
                 >
                   <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedIntro ? '▼' : '▶'}</span> 簡介
                 </div>
                 {expandedIntro && (
                   <div className="pl-6 space-y-0.5">
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">1.尊重肯定</div>
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">2.避免批評</div>
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">3.主動釐清</div>
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">4.鼓勵參與</div>
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">5.耐心等候</div>
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">6.正確引導</div>
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">7.掌握流程</div>
                     <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">8.轉折自然</div>
                   </div>
                 )}
               </div>
            )}
            <div className="px-9 py-2">
               <div className="cursor-pointer font-bold text-blue-700 flex items-center mb-1">
                 <span className="mr-2 text-[10px]">▼</span> 面談實施步驟
               </div>
               <div className="pl-5 mt-1 text-slate-600 space-y-0.5 border-l border-slate-200 ml-1">
                 <div className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors">簡介</div>
                 
                 {/* 步驟一：開場 */}
                 <div className="py-1.5 pl-3">
                   <div 
                     onClick={() => toggleStep('1')}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${mode?.includes('course_interview') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md' : 'text-slate-600 hover:text-blue-600'}`}
                   >
                      <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedSteps['1'] ? '▼' : '▶'}</span> 步驟一：開場
                   </div>
                   {expandedSteps['1'] && (
                     <div className="pl-4 mt-1 space-y-1">
                       <div 
                         onClick={() => navigate('/simulation/course_interview_theory')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_interview_theory' ? 'bg-[#bce6f2] text-blue-900 shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600 text-slate-500'}`}
                       >
                         開場技巧
                       </div>
                       <div 
                         onClick={() => navigate('/simulation/course_interview')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_interview' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600'}`}
                       >
                          開場技巧演練
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {/* 步驟二：釐清履歷 */}
                 <div className="py-1.5 pl-3">
                   <div 
                     onClick={() => toggleStep('2')}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${mode?.includes('course_resume') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md' : 'text-slate-600 hover:text-blue-600'}`}
                   >
                      <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedSteps['2'] ? '▼' : '▶'}</span> 步驟二：釐清履歷
                   </div>
                   {expandedSteps['2'] && (
                     <div className="pl-4 mt-1 space-y-1">
                       <div 
                         onClick={() => navigate('/simulation/course_resume_theory')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_resume_theory' ? 'bg-[#bce6f2] text-blue-900 shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600 text-slate-500'}`}
                       >
                         釐清履歷技巧
                       </div>
                       <div 
                         onClick={() => navigate('/simulation/course_resume')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_resume' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600'}`}
                       >
                          釐清履歷演練
                       </div>
                     </div>
                   )}
                 </div>

                 {/* 步驟三：提問 */}
                 <div className="py-1.5 pl-3">
                   <div 
                     onClick={() => toggleStep('3')}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${mode?.includes('course_questioning') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md' : 'text-slate-600 hover:text-blue-600'}`}
                   >
                      <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedSteps['3'] ? '▼' : '▶'}</span> 步驟三：提問
                   </div>
                   {expandedSteps['3'] && (
                     <div className="pl-4 mt-1 space-y-1">
                       <div 
                         onClick={() => navigate('/simulation/course_questioning_theory')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_questioning_theory' ? 'bg-[#bce6f2] text-blue-900 shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600 text-slate-500'}`}
                       >
                         提問技巧
                       </div>
                       <div 
                         onClick={() => navigate('/simulation/course_questioning')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_questioning' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600'}`}
                       >
                          行為提問演練
                       </div>
                     </div>
                   )}
                 </div>

                 {/* 步驟四：評估 */}
                 <div className="py-1.5 pl-3">
                   <div 
                     onClick={() => toggleStep('4')}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${mode?.includes('course_evaluating') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md' : 'text-slate-600 hover:text-blue-600'}`}
                   >
                      <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedSteps['4'] ? '▼' : '▶'}</span> 步驟四：評估
                   </div>
                   {expandedSteps['4'] && (
                     <div className="pl-4 mt-1 space-y-1">
                       <div 
                         onClick={() => navigate('/simulation/course_evaluating_theory')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_evaluating_theory' ? 'bg-[#bce6f2] text-blue-900 shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600 text-slate-500'}`}
                       >
                         評估技巧
                       </div>
                       <div 
                         onClick={() => navigate('/simulation/course_evaluating')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_evaluating' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600'}`}
                       >
                          行為評估演練
                       </div>
                     </div>
                   )}
                 </div>

                 {/* 步驟五：追問 */}
                 <div className="py-1.5 pl-3">
                   <div 
                     onClick={() => toggleStep('5')}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${mode?.includes('course_probing') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md' : 'text-slate-600 hover:text-blue-600'}`}
                   >
                      <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedSteps['5'] ? '▼' : '▶'}</span> 步驟五：追問
                   </div>
                   {expandedSteps['5'] && (
                     <div className="pl-4 mt-1 space-y-1">
                       <div 
                         onClick={() => navigate('/simulation/course_probing_theory')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_probing_theory' ? 'bg-[#bce6f2] text-blue-900 shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600 text-slate-500'}`}
                       >
                         追問技巧
                       </div>
                       <div 
                         onClick={() => navigate('/simulation/course_probing')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_probing' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600'}`}
                       >
                          追問技巧演練
                       </div>
                     </div>
                   )}
                 </div>

                 {/* 步驟六：結語 */}
                 <div className="py-1.5 pl-3">
                   <div 
                     onClick={() => toggleStep('6')}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${mode?.includes('course_closing') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md' : 'text-slate-600 hover:text-blue-600'}`}
                   >
                      <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedSteps['6'] ? '▼' : '▶'}</span> 步驟六：結語
                   </div>
                   {expandedSteps['6'] && (
                     <div className="pl-4 mt-1 space-y-1">
                       <div 
                         onClick={() => navigate('/simulation/course_closing_theory')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_closing_theory' ? 'bg-[#bce6f2] text-blue-900 shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600 text-slate-500'}`}
                       >
                         結語技巧
                       </div>
                       <div 
                         onClick={() => navigate('/simulation/course_closing')}
                         className={`py-1.5 px-3 rounded-md cursor-pointer transition-colors relative font-medium ${mode === 'course_closing' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-100 hover:text-blue-600'}`}
                       >
                          面試結語演練
                       </div>
                     </div>
                   )}
                 </div>

                  <div 
                    onClick={() => navigate('/simulation/course_completion')}
                    className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'course_completion' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}
                  >
                    課後提醒
                  </div>
               </div>
            </div>
          </div>

          {/* 模組三 */}
          <div className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-sm flex items-center text-slate-600 transition-colors">
            <div className="w-1.5 h-1.5 bg-slate-400 mr-3 rounded-sm"></div> 模組三：模擬演練
          </div>
        </div>
      </div>

      {/* 右側主畫面區塊 */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] relative overflow-hidden">
        
        {(() => {
          if (mode === 'course_completion') {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-slate-50 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/50 z-0"></div>
                <div className="bg-white rounded-[2rem] p-12 shadow-xl border border-blue-100/50 z-10 flex flex-col items-center max-w-2xl text-center transform transition-all duration-700 hover:scale-[1.01]">
                  <div className="text-6xl mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center shadow-inner border border-white">
                    🎉
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-wide">恭喜完成所有演練關卡！</h1>
                  <p className="text-[17px] text-slate-600 leading-[1.8] mb-8 font-medium">
                    您已經順利完成了「招募面談模擬訓練學程」的全部實戰演練！<br/>
                    這證明您已經具備了扎實的面試技巧與專業的溝通能力。
                  </p>
                  
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 w-full mb-8 text-left">
                    <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                      <span className="text-blue-600">💡</span> 下一步建議
                    </h3>
                    <p className="text-blue-700 text-[15px] leading-relaxed">
                      您可以點擊左側選單，隨時回到任一關卡重新複習；或是點擊上方「回到首頁」，進行其他模組的進階練習與綜合測驗！
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/')}
                    className="px-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    回到首頁 🏠
                  </button>
                </div>
              </div>
            );
          }
          const theoryDataMap: Record<string, any> = {
            course_interview_theory: {
              title: '開場技巧',
              nextRoute: '/simulation/course_interview',
              buttons: [
                { id: '1.1', title: '1.1 表達歡迎', content: '感謝應徵者前來面談，展現親切的態度，讓對方覺得受歡迎與尊重。' },
                { id: '1.2', title: '1.2 自我介紹', content: '雙方交互名片，進行簡單自我介紹，也可以聊一些共同經歷或朋友，拉近彼此距離。' },
                { id: '1.3', title: '1.3 說明流程', content: '向應徵者說明本次面談的流程及預計時間，以降低應徵者的不確定感及焦慮。' },
                { id: '1.4', title: '1.4 承諾保密', content: '主動承諾將對面談內容保密，建立信任感，鼓勵應徵者在接下來的面談中誠實回應。' }
              ]
            },
            course_resume_theory: {
              title: '釐清履歷技巧',
              nextRoute: '/simulation/course_resume',
              buttons: [
                { id: '2.1', title: '2.1 肯定成就', content: '先針對履歷資料中的傑出表現，詢問一些細節，讓應徵者有機會展現過往成就，以增強其信心，並化解緊張感。' },
                { id: '2.2', title: '2.2 釐清疑點', content: '再針對履歷資料中的不足或矛盾之處，給應徵者澄清的機會，避免錯估其職能。' },
                { id: '2.3', title: '2.3 尋找議題', content: '從履歷資料中，指出一些與職能相關的內容，表達你的興趣，並為接下來的探問步驟先行鋪路。' }
              ]
            },
            course_questioning_theory: {
              title: '提問技巧',
              nextRoute: '/simulation/course_questioning',
              buttons: [
                { id: '3.1', title: '3.1 包含情境衝突', content: '提問句必須隱含一個難關或困境，才能讓應徵者有機會展示其能力！' },
                { id: '3.2', title: '3.2 契合目標職能', content: '提問句中的難關必須吻合你想評鑑的職能～具備該職能的人可以克服這個難關，而缺乏該職能的人則無法克服這個難關。' },
                { id: '3.3', title: '3.3 要求真實經驗', content: '你在提問句中，必須明確引導應徵者，要以真實經驗回應，而不是「假設、期望、想法、理論」。\n\n正反示範如下：\n✅ 「請舉一個實際例子來說明…」\n❌ 「如果…你會怎樣…」「你認為…」' },
                { id: '3.4', title: '3.4 避免暗示誘導', content: '提問句應該採用「開放式句型」，才能鼓勵對方自由表達想法。千萬不要在提問句中夾雜你的個人意見，以免影響對方的回應內容。' },
                { id: '3.5', title: '3.5 保持觀點平衡', content: '成功經驗和失敗經驗可以反應職能的不同面向，兩者都非常值得探問。但為了避免應徵者緊張，你應該先探問成功經驗，再交錯探問一些失敗經驗，以取得平衡的觀點。' }
              ]
            },
            course_evaluating_theory: {
              title: '評估技巧',
              nextRoute: '/simulation/course_evaluating',
              groups: [
                {
                  name: '完整性',
                  buttons: [
                    { id: '4.1', title: '4.1 是否具備四要素', content: '行為事例是否已經包含「情境，角色，行為，結果」四個元素？如果缺乏任一元素，那就還不夠完整！' }
                  ]
                },
                {
                  name: '有效性',
                  buttons: [
                    { id: '4.2', title: '4.2 是否契合目標職能', content: '行為事例的「情境」與「行動」是否與目標職能密切相關？如果不相關，那就是無效的行為事例！' },
                    { id: '4.3', title: '4.3 是否為真實經驗', content: '行為事例必須是真實經驗才有效，如果是「假設、期望、想法、理論」則無效。所以，以下內容都值得懷疑：\n1. 以「如果…」「我應該…」「我認為…」「一般來講…」起頭的句子。\n2. 不符合其身份背景、不合常情常理、情節彼此衝突、與第三方查核結果不一致…。' },
                    { id: '4.4', title: '4.4 應徵者是否為主角', content: '如果應徵者是以「我們」而非「我」來描述其經驗，則該行為事例無法證明其能力，自然也就無效。你應該請對方釐清所扮演的角色，並重新以「我」的角色，來描述其行為事例。' }
                  ]
                },
                {
                  name: '職能強度',
                  buttons: [
                    { id: '4.5', title: '4.5 情境難度高', content: '行為事例中的「情境」越困難，若能順利解決，代表職能越強。' },
                    { id: '4.6', title: '4.6 行動符合行為指標', content: '應徵者在行為事例中的「行動」是職能的最佳證據。該行動符合越多行為指標時，代表職能越強。' },
                    { id: '4.7', title: '4.7 結果符合預期', content: '行為事例中的「結果」，可以協助判定「行動」是否有效。結果順利，代表「行動」有效；但若結果不順利，也不見得就是行動無效，還得另行判定。' }
                  ]
                }
              ]
            },
            course_probing_theory: {
              title: '追問技巧',
              nextRoute: '/simulation/course_probing',
              groups: [
                {
                  name: '完整性',
                  buttons: [
                    { id: '5.1', title: '5.1 追問欠缺的元素', content: '當行為事例缺乏「情境、角色、行動、結果」任一元素時，應追問所欠缺的元素。例如：\n✅「當時出現了什麼問題？」\n✅「那你後來採取了什麼行動？」\n✅「結果如何？」' }
                  ]
                },
                {
                  name: '有效性',
                  buttons: [
                    { id: '5.2', title: '5.2 追問職能相關內容', content: '當行為事例與目標職能無關時，應引導對方提供有效資料。例如：\n✅「這個說法很有趣，但我更好奇的是你在…方面的處理經驗，可以多說一些這方面的經歷嗎？」' },
                    { id: '5.3', title: '5.3 追問具體經驗', content: '當行為事例流於「假設、期望、想法、理論」時，應引導對方以具體經驗回應。正反示範如下：\n✅「你當時有什麼感受？」\n❌「你為什麼覺得…」（會引出理論性答案）\n\n✅「你當時做了什麼？」\n❌「下一次，你會怎麼做？」（會引出假設性答案）' },
                    { id: '5.4', title: '5.4 追問難以造假之細節', content: '當行為事例有造假可能時，應追問一些難以造假的細節，例如：\n✅「可不可以進一步說明，你為該銀行所撰寫的基金交易程式，採用了哪些防止駭客入侵的措施？」\n必要時，甚至可以故意提供一些錯誤資訊，看對方能否察覺…' },
                    { id: '5.5', title: '5.5 避免誘答', content: '評分員在追問時，應避免誘答式的追問。正反示範如下：\n✅「主管的反應是如何？」\n❌「主管一定很滿意你這個決定吧？」' }
                  ]
                }
              ]
            },
            course_closing_theory: {
              title: '結語技巧',
              nextRoute: '/simulation/course_closing',
              buttons: [
                { id: '6.1', title: '6.1 提供發問機會', content: '主動給予應徵者發問機會，並解答其疑惑。' },
                { id: '6.2', title: '6.2 說明後續流程', content: '主動說明面談的後續處理流程，以降低應徵者的不確定感。' },
                { id: '6.3', title: '6.3 表達感謝尊重', content: '無論應徵者在面試中表現如何，都應給予感謝與尊重！' }
              ]
            }
          };
          const currentTheory = mode ? theoryDataMap[mode] : null;

          if (isTheoryMode && currentTheory) {
            return (
              <div className="w-full h-full flex flex-col bg-[#e0e0e0] relative font-sans">
                 {/* Dark Header */}
                 <div className="bg-[#333333] text-white px-8 py-4 text-3xl font-bold tracking-widest shadow-md z-10 border-b-4 border-[#555] flex justify-between items-center">
                   <span>{currentTheory.title}</span>
                   <button onClick={() => navigate(currentTheory.nextRoute)} className="w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 hover:text-white hover:border-white flex items-center justify-center text-lg transition-colors">✕</button>
                 </div>
                 
                 {/* Main Content Area */}
                 <div className="flex-1 relative flex flex-col bg-cover bg-center" style={{ backgroundImage: `url('/virtual_office_background_1777643605271.png')` }}>
                    <div className="absolute inset-0 bg-white/40"></div>
                    
                    <div className="w-full max-w-6xl mx-auto flex gap-16 z-10 pt-20 px-8 flex-1">
                      {/* Left Side Buttons */}
                      <div className="w-1/3 flex flex-col gap-6 pl-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {currentTheory.groups ? (
                          <div className="flex flex-col gap-6">
                            {currentTheory.groups.map((group: any, idx: number) => (
                              <div key={idx} className="flex items-stretch gap-4">
                                {group.name && (
                                  <div className="flex items-center justify-center">
                                    <div className="text-xl font-bold text-[#8a3c3c] tracking-[0.3em] opacity-90" style={{ writingMode: 'vertical-rl' }}>
                                      {group.name}
                                    </div>
                                  </div>
                                )}
                                <div className="flex-1 flex flex-col gap-3">
                                  {group.buttons.map((btn: any) => (
                                    <button 
                                      key={btn.id}
                                      onClick={() => setSelectedTheoryBtn(btn.id)}
                                      className={`group relative py-3 px-5 text-[18px] rounded-xl shadow-sm transition-all duration-300 font-bold border text-left tracking-widest overflow-hidden
                                        ${selectedTheoryBtn === btn.id 
                                          ? 'bg-gradient-to-r from-[#d9f2fa] to-[#bce6f2] border-[#8cbccc] text-[#1a5b73] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transform translate-x-2 scale-[1.01]' 
                                          : 'bg-white/80 backdrop-blur border-slate-200 text-slate-600 hover:bg-[#f0f9ff] hover:border-[#bce6f2] hover:shadow-md hover:text-[#2a7a9a]'}`}
                                    >
                                      {selectedTheoryBtn === btn.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#4fa7c7]"></div>
                                      )}
                                      <span className="relative z-10">{btn.title}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          currentTheory.buttons.map((btn: any) => (
                            <button 
                              key={btn.id}
                              onClick={() => setSelectedTheoryBtn(btn.id)}
                              className={`group relative py-5 px-8 text-[22px] rounded-xl shadow-sm transition-all duration-300 font-bold border text-left tracking-widest overflow-hidden
                                ${selectedTheoryBtn === btn.id 
                                  ? 'bg-gradient-to-r from-[#d9f2fa] to-[#bce6f2] border-[#8cbccc] text-[#1a5b73] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transform translate-x-3 scale-[1.02]' 
                                  : 'bg-white/80 backdrop-blur border-slate-200 text-slate-600 hover:bg-[#f0f9ff] hover:border-[#bce6f2] hover:shadow-md hover:text-[#2a7a9a]'}`}
                            >
                              {selectedTheoryBtn === btn.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#4fa7c7]"></div>
                              )}
                              <span className="relative z-10">{btn.title}</span>
                            </button>
                          ))
                        )}
                      </div>
                      
                      {/* Right Side Text Content */}
                      <div className="w-2/3 flex items-start justify-start relative pt-2 pl-4 pr-12">
                         <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.06)] rounded-2xl p-10 w-full min-h-[300px] transition-all relative overflow-hidden flex flex-col justify-center">
                           {selectedTheoryBtn ? (
                              <>
                                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#4fa7c7] to-[#8cbccc]"></div>
                                <h3 className="text-3xl font-bold text-[#1a5b73] mb-6 tracking-wider flex items-center gap-4">
                                  <span className="bg-[#e6f7fc] text-[#2a7a9a] px-4 py-1.5 rounded-lg text-2xl border border-[#c5eaf5]">{selectedTheoryBtn}</span>
                                  {(() => {
                                    const btn = currentTheory.groups 
                                      ? currentTheory.groups.flatMap((g:any) => g.buttons).find((b:any) => b.id === selectedTheoryBtn)
                                      : currentTheory.buttons.find((b:any) => b.id === selectedTheoryBtn);
                                    return btn?.title.split(' ')[1];
                                  })()}
                                </h3>
                                <div className="text-[24px] text-slate-700 leading-[1.8] font-medium tracking-wide whitespace-pre-wrap">
                                  {(() => {
                                    const btn = currentTheory.groups 
                                      ? currentTheory.groups.flatMap((g:any) => g.buttons).find((b:any) => b.id === selectedTheoryBtn)
                                      : currentTheory.buttons.find((b:any) => b.id === selectedTheoryBtn);
                                    return btn?.content;
                                  })()}
                                </div>
                              </>
                           ) : (
                              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-90 py-12">
                                <span className="text-6xl mb-6 opacity-50 animate-bounce">👈</span>
                                <div className="text-[26px] font-medium tracking-widest text-[#5b8c9c]">
                                  請逐一點選左邊按鈕，閱讀細節。
                                </div>
                              </div>
                           )}
                         </div>
                      </div>
                    </div>
                    
                    {/* Media player bottom bar mockup */}
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] border-t border-slate-300 flex items-center px-4 justify-between z-20">
                      <div className="flex items-center gap-2">
                        <button className="w-6 h-6 bg-white rounded border border-gray-400 flex items-center justify-center text-xs text-slate-600">🔈</button>
                        <button className="w-6 h-6 bg-white rounded border border-gray-400 flex items-center justify-center text-xs text-slate-600">▶</button>
                        <div className="w-64 h-2 bg-white border border-gray-300 rounded mx-2 shadow-inner"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-white rounded border border-gray-400 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-gray-50 flex items-center gap-1">⟲</button>
                        <button className="px-3 py-1 bg-white rounded border border-gray-400 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-gray-50 flex items-center gap-1">◀ 上一頁</button>
                        <button onClick={() => navigate(currentTheory.nextRoute)} className="px-3 py-1 bg-white rounded border border-gray-400 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-gray-50 flex items-center gap-1">下一頁 ▶</button>
                      </div>
                    </div>
                 </div>
              </div>
            );
          }

          const tabs = mode === 'course_evaluating' 
            ? ['1.前情提要', '2.任務說明', '3.職能清單', '4.進行演練', '5.技巧檢討']
            : ['1.前情提要', '2.任務說明', '3.進行演練', '4.技巧檢討'];
          const isIntro = activeTab === 0;
          const isTask = activeTab === 1;
          const isCompetency = mode === 'course_evaluating' && activeTab === 2;
          const isSim = mode === 'course_evaluating' ? activeTab === 3 : activeTab === 2;
          const isReview = mode === 'course_evaluating' ? activeTab === 4 : activeTab === 3;

          return (
            <>
            {/* 上方分頁標籤 (Tabs) */}
            <div className="bg-white px-8 pt-5 border-b border-slate-200 flex gap-6 shadow-sm z-10 overflow-x-auto shrink-0">
              {tabs.map((tab, idx) => (
                <button 
                  key={tab} 
                  className={`pb-4 px-2 text-[15px] tracking-wide font-medium border-b-[3px] transition-all duration-200 whitespace-nowrap ${
                    activeTab === idx 
                      ? 'border-blue-600 text-blue-700' 
                      : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-200'
                  }`}
                  onClick={() => setActiveTab(idx)}
                >
                  {tab}
                </button>
              ))}
            </div>

        {/* 主要內容顯示區 */}
        <div className="flex-1 p-4 lg:p-6 overflow-hidden relative">
          <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
            
            {/* Tab 1: 前情提要 */}
            {isIntro && (
              <div 
                className="flex-1 overflow-y-auto flex flex-col items-center justify-center relative bg-cover bg-center"
                style={{ backgroundImage: `url('/virtual_office_background_1777643605271.png')` }}
              >
                {/* 背景模糊遮罩 */}
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[8px] z-0"></div>
                
                {mode && contextSummaries[mode] ? (
                  <div className="max-w-4xl mx-auto w-full px-12 py-16 relative z-10">
                    <div className="space-y-12 text-[20px] md:text-[22px] leading-[2.2] text-slate-800 tracking-[0.08em] font-medium font-sans drop-shadow-sm">
                      {contextSummaries[mode].map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 p-12 text-center h-full relative z-10">
                    <div className="w-24 h-24 mb-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm border border-slate-200">
                      <span className="text-4xl opacity-60">🚧</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-3 tracking-wide">無前情提要</h3>
                    <p className="max-w-md leading-relaxed">此模式暫無前情提要資料。</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: 任務說明 */}
            {isTask && (
              <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center bg-slate-50">
                {mode && taskInstructions[mode] ? (
                  <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-14 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-10 tracking-wider flex items-center gap-4">
                      <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">📋</span> 
                      任務說明
                    </h2>
                    
                    <div className="space-y-8 text-[18px] leading-[2] text-slate-700 font-medium tracking-wide">
                      <div className="flex gap-4">
                        <span className="text-blue-500 mt-1">✓</span>
                        <p>在本演練中，你將扮演面試主管 <strong>George</strong>，與螢幕中人物～應徵者 <strong>Lisa</strong>，進行互動！</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-blue-500 mt-1">✓</span>
                        <p>在過程中，你必須採取正確的<strong>「{taskInstructions[mode]}」</strong>以及<strong>「溝通原則」</strong>，才能順利完成本任務。</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-blue-500 mt-1">✓</span>
                        <p>請先在「前情提要」中瞭解劇情，接著在「進行演練」中與 Lisa 互動，最後在「技巧檢討」中，瀏覽演練成績。</p>
                      </div>
                      {mode === 'course_evaluating' && (
                        <div className="flex gap-4">
                          <span className="text-blue-500 mt-1">✓</span>
                          <p>如果你選擇接受本任務，請先在<span className="text-red-500 font-bold">職能清單</span>中，瞭解主動積極的行為指標，然後再開始<span className="text-red-500 font-bold">進行演練</span>。</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-12 text-center h-full">
                    <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center shadow-inner border border-slate-200">
                      <span className="text-4xl opacity-60">🚧</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-3 tracking-wide">無任務說明</h3>
                    <p className="text-slate-500 max-w-md leading-relaxed">此模式暫無任務說明資料。</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2.5: 職能清單 (course_evaluating 專屬) */}
            {isCompetency && (
              <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-start bg-slate-50">
                <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-14 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-500"></div>
                  
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-wider">
                      職能清單 (目標職能：<span className="text-red-500 font-black">主動積極</span>)
                    </h2>
                  </div>

                  <div className="space-y-4 text-[18px] leading-[2] text-slate-700 font-medium tracking-wide bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    <ul className="list-disc pl-6 space-y-3">
                      <li>歸屬不明之任務，能主動爭取。</li>
                      <li>不清楚之處，能主動澄清、詢問、確認。</li>
                      <li>採取預防性措施，避免問題發生。</li>
                      <li>獨立作業，不需監督。</li>
                      <li>超越工作範圍。</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: 技巧檢討 */}
            {isReview && (
              <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50 flex justify-center custom-scrollbar">
                <div className="w-full max-w-5xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 tracking-wide flex items-center gap-3">
                        <span className="text-3xl">📊</span> 演練成效分析報表
                      </h2>
                      <p className="text-slate-500 mt-2 ml-1">AI 將根據您與應徵者的對話，為您的技巧進行專業評分</p>
                    </div>
                    <button 
                      onClick={() => setShowMockReport(true)}
                      className={`font-bold py-3 px-8 rounded-full shadow-lg transition-all transform ${showMockReport ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-0' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:-translate-y-1'}`}
                      disabled={showMockReport}
                    >
                      ✨ 產生 AI 評估報告
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 總體檢評分 (Left Panel) */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                      <h3 className="text-xl font-bold text-slate-700 mb-6 w-full text-center border-b border-slate-100 pb-4">總得分</h3>
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={`transition-all duration-[1500ms] ease-out ${showMockReport ? 'text-blue-500' : 'text-transparent'}`}
                            strokeWidth="3"
                            strokeDasharray={`${showMockReport ? '85' : '0'}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-5xl font-black text-slate-800">{showMockReport ? '85' : '0'}</span>
                          <span className="text-sm font-medium text-slate-400 mt-1">/ 100</span>
                        </div>
                      </div>
                      <div className={`mt-6 transition-opacity duration-1000 ${showMockReport ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-green-600 font-bold bg-green-50 px-5 py-2 rounded-full border border-green-200">✨ 表現優良</p>
                      </div>
                    </div>

                    {/* 明細 (Right Panel) */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* 該關卡技能 */}
                      {mode && evaluationCriteriaMap[mode] && (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-blue-800 bg-blue-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                              {evaluationCriteriaMap[mode].title}
                            </h3>
                            <span className="font-bold text-slate-600">{showMockReport ? '45 / 50' : '0 / 0'}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {evaluationCriteriaMap[mode].skills.map((skill, i) => {
                              const possible = 10;
                              // Fake score based on index to look realistic
                              const actual = showMockReport ? (possible - (i % 3)) : 0; 
                              const percent = showMockReport ? (actual / possible) * 100 : 0;
                              return (
                                <div key={skill} className="flex flex-col gap-2">
                                  <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>{skill}</span>
                                    <span>{actual}/{possible}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-blue-400 h-2.5 rounded-full transition-all duration-[1500ms] ease-out" style={{ width: `${percent}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* C 溝通原則 */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-indigo-800 bg-indigo-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                            C 溝通原則
                          </h3>
                          <span className="font-bold text-slate-600">{showMockReport ? '40 / 50' : '0 / 0'}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                          {commonCommunicationSkills.map((skill, i) => {
                            const possible = 5;
                            // Fake score based on index
                            const actual = showMockReport ? (possible - (i % 2)) : 0; 
                            const percent = showMockReport ? (actual / possible) * 100 : 0;
                            return (
                              <div key={skill} className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                  <span>{skill}</span>
                                  <span>{actual}/{possible}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div className="bg-indigo-400 h-2.5 rounded-full transition-all duration-[1500ms] ease-out" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: 進行演練 (Live API 畫面) */}
            {/* 使用 display:none (隱藏) 取代條件渲染，以維持 WebRTC 連線不中斷 */}
            <div className={`w-full h-full relative font-sans text-slate-800 bg-slate-50 ${isSim ? 'flex' : 'hidden'}`}>
              
              {/* === 明亮現代畫面核心 === */}
              {/* 背景圖片與毛玻璃遮罩 */}
              <div className="absolute inset-0 bg-[url('/virtual_office_background_1777643605271.png')] bg-cover bg-center z-0"></div>
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0"></div>

              {/* LEFT SIDE: AVATAR (2/3) - Floating Glass Container */}
              <div className="w-2/3 h-full relative z-10 flex flex-col items-center justify-center p-6">
                <div className="relative w-full max-w-4xl aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-white bg-white/80 backdrop-blur-md">
                  {/* Crisp Avatar Image */}
                  <img 
                    src={avatarImage} 
                    alt={`Avatar in ${currentEmotion} mood`} 
                    className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 mix-blend-normal opacity-100"
                    style={{ transform: isConnected && volume > 2 ? `scale(${1 + (volume / 800)})` : 'scale(1)', transition: 'transform 0.1s' }}
                  />
                  
                  {/* Dynamic Glowing Effect overlay based on volume */}
                  {isConnected && volume > 2 && (
                     <div 
                       className="absolute inset-0 bg-gradient-to-t from-blue-100/30 to-transparent mix-blend-overlay z-0 pointer-events-none transition-all duration-75"
                     ></div>
                  )}

                  {/* Emotion Tag */}
                  <div className="absolute top-8 left-8 text-sm font-bold text-slate-600 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-3 z-20">
                    {isConnected && volume > 5 ? (
                       <><Volume2 size={16} className="text-blue-500 animate-pulse"/> <span className="text-blue-600 tracking-wider">正在說話...</span></>
                    ) : (
                       <>Mood: <span className={`${currentEmotion === 'angry' || currentEmotion === 'furious' ? 'text-red-500' : currentEmotion === 'happy' ? 'text-green-500' : 'text-blue-500'}`}>{currentEmotion.toUpperCase()}</span></>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: CHAT & CONTROLS (1/3) */}
              <div className="w-1/3 h-full flex flex-col bg-white/90 backdrop-blur-xl border-l border-slate-200 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] relative z-20">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 bg-white/80 border-b border-slate-100 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { disconnect(); navigate('/menu'); }}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                      title="回主選單"
                    >
                      <ArrowLeft size={20} className="text-slate-500" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <Volume2 className="text-white" size={20} />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-slate-800 tracking-wide">木人巷客服訓練模擬導師</h1>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="relative flex h-2 w-2">
                          {isConnected && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-slate-400'
                            }`}
                          ></span>
                        </span>
                        <span className="text-slate-500">
                          {isConnected ? '連線中，請說話...' : isConnecting ? '正在建立連線...' : '已斷線'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mode Display */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center justify-between backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">目前挑戰模式</span>
                    <div className="flex items-center gap-2">
                      {mode === 'angry' ? (
                        <><span className="text-xl">😡</span> <span className="font-bold text-red-500">暴怒奧客</span></>
                      ) : mode === 'vip' ? (
                        <><span className="text-xl">👑</span> <span className="font-bold text-purple-500">VIP特權客</span></>
                      ) : mode === 'course_interview' ? (
                        <><span className="text-xl">🎓</span> <span className="font-bold text-blue-600">面試開場測驗</span></>
                      ) : mode === 'course_resume' ? (
                        <><span className="text-xl">📋</span> <span className="font-bold text-red-500">釐清履歷測驗</span></>
                      ) : mode === 'course_questioning' ? (
                        <><span className="text-xl">🗣️</span> <span className="font-bold text-purple-400">行為提問測驗</span></>
                      ) : mode === 'course_evaluating' ? (
                        <><span className="text-xl">🔍</span> <span className="font-bold text-green-400">行為評估測驗</span></>
                      ) : mode === 'course_probing' ? (
                        <><span className="text-xl">🎣</span> <span className="font-bold text-yellow-400">行為追問測驗</span></>
                      ) : mode === 'course_closing' ? (
                        <><span className="text-xl">🤝</span> <span className="font-bold text-pink-400">面試結語測驗</span></>
                      ) : (
                        <><span className="text-xl">🤖</span> <span className="font-bold text-blue-400">溫和諮詢</span></>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-200 border border-slate-300 text-xs text-slate-500">
                    {mode === 'angry' ? '壓力測試' : mode === 'vip' ? '高階溝通' : (mode === 'course_interview' || mode === 'course_resume' || mode === 'course_questioning' || mode === 'course_evaluating' || mode === 'course_probing' || mode === 'course_closing') ? '課程實戰' : '基礎訓練'}
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-r-md flex items-start gap-3 backdrop-blur-sm">
                    <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
                    <p className="text-sm text-red-600 font-medium">{error}</p>
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
              {/* === 原本深色畫面核心 結束 === */}
            </div>
            
            {/* 關閉 Tabs Content Wrapper 的兩個 div */}
            </div>
          </div>

        {/* 下方分頁導覽 (Footer Navigation) */}
        <div className="bg-white py-3 px-8 flex justify-between items-center border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10 shrink-0">
          <div className="text-sm text-slate-400 font-medium tracking-wider flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             Powered by AI Agent
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveTab(prev => Math.max(0, prev - 1))}
              disabled={activeTab === 0}
              className={`px-5 py-2 border rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm ${
                activeTab === 0
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="mr-1">◂</span> 上一頁
            </button>
            
            {activeTab < tabs.length - 1 ? (
              <button 
                onClick={() => setActiveTab(prev => Math.min(tabs.length - 1, prev + 1))}
                className="px-5 py-2 bg-blue-600 text-white border border-blue-700 rounded-lg text-sm font-medium hover:bg-blue-700 hover:shadow-md transition-all flex items-center shadow-sm"
              >
                下一頁 <span className="ml-1">▸</span>
              </button>
            ) : mode && nextStepMap[mode] ? (
              <button 
                onClick={() => {
                  navigate(nextStepMap[mode]!);
                  setActiveTab(0); // 進入下一步驟時重置分頁為前情提要
                }}
                className="px-5 py-2 bg-indigo-600 text-white border border-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-700 hover:shadow-md transition-all flex items-center shadow-sm"
              >
                下一步驟 <span className="ml-1">👉</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/')}
                className="px-5 py-2 bg-emerald-600 text-white border border-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-700 hover:shadow-md transition-all flex items-center shadow-sm"
              >
                回主畫面 <span className="ml-1">🏠</span>
              </button>
            )}
          </div>
        </div>

            </>
          );
        })()}
      </div>
    </div>
  );
}
