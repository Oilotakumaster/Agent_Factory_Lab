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
import module3Case1Skill from '../skills/module3_case1.md?raw';
import module3Case1CoachSkill from '../skills/module3_case1_coach.md?raw';
import module3Case2Skill from '../skills/module3_case2.md?raw';
import module3Case2CoachSkill from '../skills/module3_case2_coach.md?raw';
import module3Case3Skill from '../skills/module3_case3.md?raw';
import module3Case3CoachSkill from '../skills/module3_case3_coach.md?raw';
import module3Case4Skill from '../skills/module3_case4.md?raw';
import module3Case4CoachSkill from '../skills/module3_case4_coach.md?raw';
import module3Case5Skill from '../skills/module3_case5.md?raw';
import module3Case5CoachSkill from '../skills/module3_case5_coach.md?raw';


const VIDEO_MAP: Record<string, {file: string, title: string}> = {
  '1-1': { file: 'TS_1.1_課程簡介-720p-210310.mp4', title: '課程簡介' },
  '1-2': { file: 'TS_1.2_選才是主管的關鍵任務-720p-210310.mp4', title: '選才是主管的關鍵任務' },
  '1-3': { file: 'TS_1.3_主管常缺乏選才策略-720p-210316.mp4', title: '主管常缺乏選才策略' },
  '1-4': { file: 'TS_1.4_主管常覺得預算不夠-720p-210311.mp4', title: '主管常覺得預算不夠' },
  '2-1': { file: 'TS_2.1_史上最佳選才案例-720p-210309.mp4', title: '簡介「魔球」' },
  '2-2': { file: 'TS_2.2_找出關鍵能力-720p-210310.mp4', title: '找出關鍵能力' },
  '2-3': { file: 'TS_2.3_注重實際表現-720p-210309.mp4', title: '注重實際表現' },
  '2-4': { file: 'TS_2.4_訂定量化指標-720p-210309.mp4', title: '訂定量化指標' },
  '2-5': { file: 'TS_2.5_結合團隊目標-720p-210311.mp4', title: '結合團隊目標' },
  '3-2': { file: 'TS_3.2_核心職能-720p-210310.mp4', title: '核心職能' },
  '3-3': { file: 'TS_3.3_管理職能-720p-210310.mp4', title: '管理職能' },
  '3-4': { file: 'TS_3.4_專業職能-720p-210310.mp4', title: '專業職能' },
  '3-5': { file: 'TS_3.5_以行為指標定義職能-720p-210309.mp4', title: '以行為指標定義職能' },
  '3-6': { file: 'TS_3.6_行為指標的功用-720p-210311.mp4', title: '行為指標的功用' },
  '3-7': { file: 'TS_3.7_行為指標的設計原則-720p-210310.mp4', title: '行為指標的設計原則' },
  '3-8': { file: 'TS_3.8_如何以行為指標幫應徵者的職能評分-720p-210311.mp4', title: '職能評分方式' },
  '3-9': { file: 'TS_3.9_七種間接評鑑職能的方法-720p-210311 (1).mp4', title: '考核應徵者的七種方法' },
  '3-10': { file: 'TS_3.10_以職能選才的作業流程-720p-210311.mp4', title: '職能選才的作業流程' },
  '4-1': { file: 'TS_4.1面談的挑戰-720p-210311 (1).mp4', title: '傳統面談的挑戰' },
  '4-2': { file: 'TS_4.2行為事例的功用-720p-210311.mp4', title: '行為事例的應用' },
  '4-3': { file: 'TS_4.3_本面談法之優點-720p-210309.mp4', title: '行為事例面談法的優點' },
  '4-4': { file: 'TS_4.4_課後提醒.mp4', title: '課後提醒' },

  'm2-1-1': { file: '../module2/TS_1.1_面談溝通原則-720p-240314.mp4', title: '簡介' },
  'm2-1-2': { file: '../module2/TS_1.2_尊重肯定-720p-210309.mp4', title: '1.尊重肯定' },
  'm2-1-3': { file: '../module2/TS_1.3_避免批評_20210309-720p-210311.mp4', title: '2.避免批評' },
  'm2-1-4': { file: '../module2/TS_1.4_主動釐清-720p-210311.mp4', title: '3.主動釐清' },
  'm2-1-5': { file: '../module2/TS_1.5_鼓勵參與-720p-210311.mp4', title: '4.鼓勵參與' },
  'm2-1-6': { file: '../module2/TS_1.6_耐心等候-720p-210309.mp4', title: '5.耐心等候' },
  'm2-1-7': { file: '../module2/TS_1.7_正確引導-720p-210311.mp4', title: '6.正確引導' },
  'm2-1-8': { file: '../module2/TS_1.8_掌握流程-720p-210309.mp4', title: '7.掌握流程' },
  'm2-1-9': { file: '../module2/TS_1.9_轉折自然-720p-210311.mp4', title: '8.轉折自然' },

  'm2-2-1': { file: '../module2/TS_2.1_面談六大步驟-720p-210311.mp4', title: '面談六大步驟簡介' },
  'm2-2-2': { file: '../module2/TS_2.2_開場步驟說明-720p-210309.mp4', title: '開場步驟說明' },
  'm2-2-5': { file: '../module2/TS_2.5_釐清履歷步驟說明-720p-210309.mp4', title: '釐清履歷步驟說明' },
  'm2-2-8': { file: '../module2/TS_2.8_提問步驟說明-720p-210310 (1).mp4', title: '提問步驟說明' },
  'm2-2-11': { file: '../module2/TS_2.11_評估步驟說明-720p-210309.mp4', title: '評估步驟說明' },
  'm2-2-14': { file: '../module2/TS_2.14_追問步驟說明-720p-210309.mp4', title: '追問步驟說明' },
  'm2-2-17': { file: '../module2/TS_2.17_結語步驟說明-720p-210309.mp4', title: '結語步驟說明' },
  'm2-2-20': { file: '../module2/TS_2.20.mp4', title: '課後提醒' },

  'm3-intro': { file: '../module3/TS_1.1.mp4', title: '簡介' },
  'm3-outro': { file: '../module3/TS_1.7.mp4', title: '課程結束' },
};

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
  ],
  module3_case1: [
    "鴻展公司資訊部門將招聘一名MIS工程師，負責網路系統之維護營運工作，Simon是應徵者之一，由George負責面試。",
    "此時George已經完成開場、釐清履歷等步驟，即將進入探問職能階段。於是他瀏覽了職能清單，首先要探問的是「持續學習」職能..."
  ],
  module3_case2: [
    "鴻展公司資訊部門將招聘一名MIS工程師，Simon是應徵者之一，由George負責面試。",
    "此時George已經完成對持續學習職能的探問，但他卻無法從Simon的回應中，辨別出所隱含的職能高低。",
    "所以他就把Simon的各種回應都彙集起來，請你幫忙評估…"
  ],
  module3_case3: [
    "鴻展公司業務部門將招聘一名業務專員，負責公司產品之銷售推廣，Janie是應徵者之一，由George負責面試。",
    "此時George已經完成開場、釐清履歷等步驟，即將進入探問職能階段。於是他瀏覽了職能清單，首先要探問的是「團隊合作」職能..."
  ],
  module3_case4: [
    "鴻展公司業務部門將招聘一名業務專員，Janie是應徵者之一，由George負責面試。",
    "此時George已經完成對團隊合作職能的探問，但他卻無法從Janie的回應中，辨別出所隱含的職能高低。",
    "所以他就把Janie的各種回應都彙集起來，請你幫忙評估…"
  ],
  module3_case5: [
    "鴻展公司管理部門將招聘一名管理師，Sophia是應徵者之一，由George負責面試。",
    "此時George已經完成開場、釐清履歷等步驟，即將進入探問職能階段。於是他瀏覽了職能清單，首先要探問的是「研發創新」職能..."
  ]
};

const taskInstructions: Record<string, string> = {
  course_interview: "開場技巧",
  course_resume: "釐清履歷技巧",
  course_questioning: "行為提問技巧",
  course_evaluating: "評估技巧",
  course_probing: "追問技巧",
  course_closing: "結語技巧",
  module3_case1: "持續學習 (提問及追問)",
  module3_case2: "持續學習 (評估)",
  module3_case3: "團隊合作 (提問及追問)",
  module3_case4: "團隊合作 (評估)",
  module3_case5: "研發創新 (提問及追問)"
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
  },
  module3_case1: {
    title: "持續學習 (綜合測驗：提問及追問)",
    skills: ["包含情境衝突", "契合目標職能", "要求真實經驗", "避免暗示誘導", "保持觀點平衡", "追問欠缺的元素", "追問具體經驗", "避免誘答"]
  },
  module3_case2: {
    title: "持續學習 (綜合測驗：評估)",
    skills: ["辨識假設性言論", "指出具體經驗不足", "正確選出高分行為事例"]
  },
  module3_case3: {
    title: "團隊合作 (綜合測驗：提問及追問)",
    skills: ["包含情境衝突", "契合目標職能", "要求真實經驗", "避免暗示誘導", "保持觀點平衡", "追問欠缺的元素", "追問具體經驗", "避免誘答"]
  },
  module3_case4: {
    title: "團隊合作 (綜合測驗：評估)",
    skills: ["辨識假設性言論", "指出單打獨鬥之瑕疵", "正確選出高分行為事例"]
  },
  module3_case5: {
    title: "研發創新 (綜合測驗：提問及追問)",
    skills: ["包含情境衝突", "契合目標職能", "要求真實經驗", "避免暗示誘導", "保持觀點平衡", "追問欠缺的元素", "追問具體經驗", "避免誘答"]
  }
};

const nextStepMap: Record<string, string | null> = {
  course_interview: "/simulation/course_resume",
  course_resume: "/simulation/course_questioning",
  course_questioning: "/simulation/course_evaluating",
  course_evaluating: "/simulation/course_probing",
  course_probing: "/simulation/course_closing",
  course_closing: null,
  module3_case1: "/simulation/module3_case2",
  module3_case2: "/simulation/module3_case3",
  module3_case3: "/simulation/module3_case4",
  module3_case4: "/simulation/module3_case5",
  module3_case5: null
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
    mode === 'module3_case1' ? module3Case1Skill : 
    mode === 'module3_case2' ? module3Case2Skill : 
    mode === 'module3_case3' ? module3Case3Skill : 
    mode === 'module3_case4' ? module3Case4Skill : 
    mode === 'module3_case5' ? module3Case5Skill : 
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
  
  // 模組展開狀態
  const [expandedModule1, setExpandedModule1] = useState(false);
  const [expandedModule2, setExpandedModule2] = useState(true);
  const [expandedModule3, setExpandedModule3] = useState(false);
  
  // 模組一子選單狀態
  const [expandedMod1Chap1, setExpandedMod1Chap1] = useState(true);
  const [expandedMod1Chap2, setExpandedMod1Chap2] = useState(false);
  const [expandedMod1Chap3, setExpandedMod1Chap3] = useState(true);
  const [expandedMod1Chap4, setExpandedMod1Chap4] = useState(false);
  
  const [expandedMod1Chap3_1, setExpandedMod1Chap3_1] = useState(true);
  const [expandedMod1Chap3_2, setExpandedMod1Chap3_2] = useState(false);

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

    // 判斷是否為 Sophia 角色 (module3_case5)
    if (mode === 'module3_case5') {
      const allowedSophiaEmotions = ['neutral', 'smiling', 'thinking', 'talking'];
      const finalEmotion = allowedSophiaEmotions.includes(currentEmotion) ? currentEmotion : 'neutral';
      setAvatarImage(`/avatar_sophia_${finalEmotion}.png`);
      return;
    }

    // 判斷是否為 Janie 角色 (module3_case3, module3_case4)
    if (mode === 'module3_case3' || mode === 'module3_case4') {
      const allowedJanieEmotions = ['neutral', 'smiling', 'thinking', 'talking'];
      const finalEmotion = allowedJanieEmotions.includes(currentEmotion) ? currentEmotion : 'neutral';
      setAvatarImage(`/avatar_janie_${finalEmotion}.png`);
      return;
    }

    // 判斷是否為 Simon 角色 (module3_case1, module3_case2)
    if (mode === 'module3_case1' || mode === 'module3_case2') {
      const allowedSimonEmotions = ['neutral', 'smiling', 'thinking', 'talking'];
      const finalEmotion = allowedSimonEmotions.includes(currentEmotion) ? currentEmotion : 'neutral';
      setAvatarImage(`/avatar_simon_${finalEmotion}.png`);
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
      else if (mode === 'module3_case1') coachPersona = module3Case1CoachSkill;
      else if (mode === 'module3_case2') coachPersona = module3Case2CoachSkill;
      else if (mode === 'module3_case3') coachPersona = module3Case3CoachSkill;
      else if (mode === 'module3_case4') coachPersona = module3Case4CoachSkill;
      else if (mode === 'module3_case5') coachPersona = module3Case5CoachSkill;

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
          <div 
            onClick={() => { setExpandedModule1(true); setExpandedModule2(false); setExpandedModule3(false); }}
            className={`px-5 py-3 cursor-pointer text-sm flex items-center transition-colors ${expandedModule1 ? 'bg-[#bce6f2] font-bold text-slate-800' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <div className={`w-1.5 h-1.5 mr-3 rounded-sm ${expandedModule1 ? 'bg-slate-800' : 'bg-slate-400'}`}></div> 模組一：基礎知識
          </div>
          
          {expandedModule1 && (
            <div className="bg-slate-50/50 border-y border-slate-100 text-sm py-2">
               {/* Chapter 1 */}
               <div 
                 onClick={() => setExpandedMod1Chap1(prev => !prev)}
                 className="px-9 py-2 hover:bg-slate-100 cursor-pointer text-blue-700 transition-colors flex items-center"
               >
                 <span className={`mr-2 text-[10px] ${expandedMod1Chap1 ? 'text-blue-500' : 'opacity-50'}`}>{expandedMod1Chap1 ? '▼' : '▶'}</span> 選才的價值與挑戰
               </div>
               {expandedMod1Chap1 && (
                 <div className="pl-[3.25rem] pr-4 mt-1 text-slate-600 space-y-0.5 mb-2">
                   <div onClick={() => navigate('/simulation/video-1-1')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-1-1' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>課程簡介</div>
                   <div onClick={() => navigate('/simulation/video-1-2')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-1-2' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>選才是主管的關鍵任務</div>
                   <div onClick={() => navigate('/simulation/video-1-3')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-1-3' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>主管常缺乏選才策略</div>
                   <div onClick={() => navigate('/simulation/video-1-4')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-1-4' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>主管常覺得預算不夠</div>
                 </div>
               )}
               
               {/* Chapter 2 */}
               <div 
                 onClick={() => setExpandedMod1Chap2(prev => !prev)}
                 className="px-9 py-2 hover:bg-slate-100 cursor-pointer text-blue-700 transition-colors flex items-center"
               >
                 <span className={`mr-2 text-[10px] ${expandedMod1Chap2 ? 'text-blue-500' : 'opacity-50'}`}>{expandedMod1Chap2 ? '▼' : '▶'}</span> 史上最佳選才案例
               </div>
               {expandedMod1Chap2 && (
                 <div className="pl-[3.25rem] pr-4 mt-1 text-slate-600 space-y-0.5 mb-2">
                   <div onClick={() => navigate('/simulation/video-2-1')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-2-1' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>簡介「魔球」</div>
                   <div onClick={() => navigate('/simulation/video-2-2')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-2-2' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>找出關鍵能力</div>
                   <div onClick={() => navigate('/simulation/video-2-3')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-2-3' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>注重實際表現</div>
                   <div onClick={() => navigate('/simulation/video-2-4')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-2-4' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>訂定量化指標</div>
                   <div onClick={() => navigate('/simulation/video-2-5')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-2-5' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>結合團隊目標</div>
                 </div>
               )}
               
               {/* Chapter 3 */}
               <div 
                 onClick={() => setExpandedMod1Chap3(prev => !prev)}
                 className="px-9 py-2 hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors flex items-center"
               >
                 <span className={`mr-2 text-[10px] ${expandedMod1Chap3 ? 'text-blue-500' : 'opacity-50'}`}>{expandedMod1Chap3 ? '▼' : '▶'}</span> 以職能為基礎的選才策略
               </div>
               {expandedMod1Chap3 && (
                 <div className="pl-[3.25rem] pr-4 mt-1 text-slate-600 space-y-0.5 mb-2">
                   <div 
                     onClick={() => setExpandedMod1Chap3_1(prev => !prev)}
                     className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors flex items-center"
                   >
                     <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedMod1Chap3_1 ? '▼' : '▶'}</span> 簡介職能
                   </div>
                   {expandedMod1Chap3_1 && (
                     <div className="pl-6 space-y-0.5">
                       <div onClick={() => navigate('/simulation/video-3-2')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-3-2' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>核心職能</div>
                       <div onClick={() => navigate('/simulation/video-3-3')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-3-3' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>管理職能</div>
                       <div onClick={() => navigate('/simulation/video-3-4')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-3-4' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>專業職能</div>
                     </div>
                   )}
                   
                   <div 
                     onClick={() => setExpandedMod1Chap3_2(prev => !prev)}
                     className="py-1.5 pl-3 hover:text-blue-600 cursor-pointer transition-colors flex items-center"
                   >
                     <span className="mr-1.5 text-[10px] w-3 flex justify-center text-blue-500 opacity-70">{expandedMod1Chap3_2 ? '▼' : '▶'}</span> 行為指標與職能
                   </div>
                   {expandedMod1Chap3_2 && (
                     <div className="pl-6 space-y-0.5">
                       <div onClick={() => navigate('/simulation/video-3-5')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-3-5' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>以行為指標定義職能</div>
                       <div onClick={() => navigate('/simulation/video-3-6')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-3-6' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>行為指標的功用</div>
                       <div onClick={() => navigate('/simulation/video-3-7')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-3-7' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>行為指標的設計原則</div>
                       <div onClick={() => navigate('/simulation/video-3-8')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-3-8' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>職能評分方式</div>
                     </div>
                   )}
                   
                   <div onClick={() => navigate('/simulation/video-3-9')} className={`py-1.5 pl-7 cursor-pointer transition-colors ${mode === 'video-3-9' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-6 pl-9 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>考核應徵者的七種方法</div>
                   <div onClick={() => navigate('/simulation/video-3-10')} className={`py-1.5 pl-7 cursor-pointer transition-colors ${mode === 'video-3-10' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-6 pl-9 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>職能選才的作業流程</div>
                 </div>
               )}

               {/* Chapter 4 */}
               <div 
                 onClick={() => setExpandedMod1Chap4(prev => !prev)}
                 className="px-9 py-2 hover:bg-slate-100 cursor-pointer text-blue-700 transition-colors flex items-center"
               >
                 <span className={`mr-2 text-[10px] ${expandedMod1Chap4 ? 'text-blue-500' : 'opacity-50'}`}>{expandedMod1Chap4 ? '▼' : '▶'}</span> 行為事例面談法
               </div>
               {expandedMod1Chap4 && (
                 <div className="pl-[3.25rem] pr-4 mt-1 text-slate-600 space-y-0.5 mb-2">
                   <div onClick={() => navigate('/simulation/video-4-1')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-4-1' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>傳統面談的挑戰</div>
                   <div onClick={() => navigate('/simulation/video-4-2')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-4-2' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>行為事例的應用</div>
                   <div onClick={() => navigate('/simulation/video-4-3')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-4-3' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>行為事例面談法的優點</div>
                   <div onClick={() => navigate('/simulation/video-4-4')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-4-4' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>課後提醒</div>
                 </div>
               )}
            </div>
          )}

          {/* 模組二 */}
          <div 
            onClick={() => { setExpandedModule2(true); setExpandedModule1(false); setExpandedModule3(false); }}
            className={`px-5 py-3 cursor-pointer text-sm flex items-center transition-colors ${expandedModule2 ? 'bg-blue-50/50 font-bold text-blue-900 border-l-4 border-blue-500' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <div className={`w-1.5 h-1.5 mr-3 rounded-sm ${expandedModule2 ? 'bg-blue-600' : 'bg-slate-400'}`}></div> 模組二：面談步驟
          </div>
          
          {/* 模組二子選單 */}
          {expandedModule2 && (
            <div className="bg-slate-50/50 border-y border-slate-100 text-sm py-2">
            <div 
              onClick={() => setExpandedPrinciples(prev => !prev)}
              className="px-9 py-2 hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors flex items-center"
            >
               <span className={`mr-2 text-[10px] ${expandedPrinciples ? 'text-blue-500' : 'opacity-50'}`}>{expandedPrinciples ? '▼' : '▶'}</span> 面談溝通原則
            </div>
            {expandedPrinciples && (
               <div className="pl-[3.25rem] pr-4 mt-1 text-slate-600 space-y-0.5 mb-2">
                 <div onClick={() => navigate('/simulation/video-m2-1-1')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-1' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>簡介</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-2')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-2' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>1.尊重肯定</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-3')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-3' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>2.避免批評</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-4')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-4' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>3.主動釐清</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-5')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-5' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>4.鼓勵參與</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-6')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-6' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>5.耐心等候</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-7')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-7' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>6.正確引導</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-8')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-8' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>7.掌握流程</div>
                 <div onClick={() => navigate('/simulation/video-m2-1-9')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-9' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>8.轉折自然</div>
               </div>
            )}
            <div className="px-9 py-2">
               <div className="cursor-pointer font-bold text-blue-700 flex items-center mb-1">
                 <span className="mr-2 text-[10px]">▼</span> 面談實施步驟
               </div>
               <div className="pl-5 mt-1 text-slate-600 space-y-0.5 border-l border-slate-200 ml-1">
                 <div onClick={() => navigate('/simulation/video-m2-1-1')} className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-1-1' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}>簡介</div>
                 
                 {/* 步驟一：開場 */}
                 <div className="py-1.5 pl-3">
                   <div 
                     onClick={() => { toggleStep('1'); navigate('/simulation/video-m2-2-2'); }}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${ (mode?.includes('course_interview') || mode === 'video-m2-2-2') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md font-bold' : 'text-slate-600 hover:text-blue-600' }`}
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
                     onClick={() => { toggleStep('2'); navigate('/simulation/video-m2-2-5'); }}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${ (mode?.includes('course_resume') || mode === 'video-m2-2-5') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md font-bold' : 'text-slate-600 hover:text-blue-600' }`}
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
                     onClick={() => { toggleStep('3'); navigate('/simulation/video-m2-2-8'); }}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${ (mode?.includes('course_questioning') || mode === 'video-m2-2-8') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md font-bold' : 'text-slate-600 hover:text-blue-600' }`}
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
                     onClick={() => { toggleStep('4'); navigate('/simulation/video-m2-2-11'); }}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${ (mode?.includes('course_evaluating') || mode === 'video-m2-2-11') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md font-bold' : 'text-slate-600 hover:text-blue-600' }`}
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
                     onClick={() => { toggleStep('5'); navigate('/simulation/video-m2-2-14'); }}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${ (mode?.includes('course_probing') || mode === 'video-m2-2-14') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md font-bold' : 'text-slate-600 hover:text-blue-600' }`}
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
                     onClick={() => { toggleStep('6'); navigate('/simulation/video-m2-2-17'); }}
                     className={`cursor-pointer font-medium flex items-center transition-colors ${ (mode?.includes('course_closing') || mode === 'video-m2-2-17') ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-2 rounded-l-md font-bold' : 'text-slate-600 hover:text-blue-600' }`}
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
                    onClick={() => navigate('/simulation/video-m2-2-20')}
                    className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'video-m2-2-20' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}
                  >
                    課後提醒 (影片)
                  </div>
                  <div 
                    onClick={() => navigate('/simulation/course_completion')}
                    className={`py-1.5 pl-3 cursor-pointer transition-colors ${mode === 'course_completion' ? 'text-blue-700 bg-blue-50/50 py-1 -ml-2 pl-5 rounded-l-md font-bold' : 'hover:text-blue-600'}`}
                  >
                    結訓證書
                  </div>
               </div>
            </div>
          </div>
          )}

          {/* 模組三 */}
          <div 
            onClick={() => { setExpandedModule3(true); setExpandedModule1(false); setExpandedModule2(false); }}
            className={`px-5 py-3 cursor-pointer text-sm flex items-center transition-colors ${expandedModule3 ? 'bg-blue-50/50 font-bold text-blue-900 border-l-4 border-blue-500' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <div className={`w-1.5 h-1.5 mr-3 rounded-sm ${expandedModule3 ? 'bg-blue-600' : 'bg-slate-400'}`}></div> 模組三：模擬演練
          </div>
          
          {/* 模組三子選單 */}
          {expandedModule3 && (
            <div className="bg-slate-50/50 border-y border-slate-100 text-sm py-2">
              <div 
                onClick={() => navigate('/simulation/video-m3-intro')}
                className={`py-1.5 pl-9 cursor-pointer transition-colors ${mode === 'video-m3-intro' ? 'text-blue-700 bg-blue-50/50 py-1 pl-[2.1rem] border-l-4 border-blue-500 font-bold' : 'hover:text-blue-600 text-slate-600'}`}
              >
                簡介
              </div>
              <div 
                onClick={() => navigate('/simulation/module3_case1')}
                className={`py-1.5 pl-9 cursor-pointer transition-colors ${mode === 'module3_case1' ? 'text-blue-700 bg-blue-50/50 py-1 pl-[2.1rem] border-l-4 border-blue-500 font-bold' : 'hover:text-blue-600 text-slate-600'}`}
              >
                1.持續學習【提問及追問】
              </div>
              <div 
                onClick={() => navigate('/simulation/module3_case2')}
                className={`py-1.5 pl-9 cursor-pointer transition-colors ${mode === 'module3_case2' ? 'text-blue-700 bg-blue-50/50 py-1 pl-[2.1rem] border-l-4 border-blue-500 font-bold' : 'hover:text-blue-600 text-slate-600'}`}
              >
                2.持續學習【評估】
              </div>
              <div 
                onClick={() => navigate('/simulation/module3_case3')}
                className={`py-1.5 pl-9 cursor-pointer transition-colors ${mode === 'module3_case3' ? 'text-blue-700 bg-blue-50/50 py-1 pl-[2.1rem] border-l-4 border-blue-500 font-bold' : 'hover:text-blue-600 text-slate-600'}`}
              >
                3.團隊合作【提問及追問】
              </div>
              <div 
                onClick={() => navigate('/simulation/module3_case4')}
                className={`py-1.5 pl-9 cursor-pointer transition-colors ${mode === 'module3_case4' ? 'text-blue-700 bg-blue-50/50 py-1 pl-[2.1rem] border-l-4 border-blue-500 font-bold' : 'hover:text-blue-600 text-slate-600'}`}
              >
                4.團隊合作【評估】
              </div>
              <div 
                onClick={() => navigate('/simulation/module3_case5')}
                className={`py-1.5 pl-9 cursor-pointer transition-colors ${mode === 'module3_case5' ? 'text-blue-700 bg-blue-50/50 py-1 pl-[2.1rem] border-l-4 border-blue-500 font-bold' : 'hover:text-blue-600 text-slate-600'}`}
              >
                5.研發創新【提問及追問】
              </div>
              <div 
                onClick={() => navigate('/simulation/video-m3-outro')}
                className={`py-1.5 pl-9 cursor-pointer transition-colors ${mode === 'video-m3-outro' ? 'text-blue-700 bg-blue-50/50 py-1 pl-[2.1rem] border-l-4 border-blue-500 font-bold' : 'hover:text-blue-600 text-slate-600'}`}
              >
                課程結束
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右側主畫面區塊 */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] relative overflow-hidden">
        
        {(() => {

          if (mode?.startsWith('video-')) {
            const videoId = mode.replace('video-', '');
            const videoData = VIDEO_MAP[videoId];
            if (videoData) {
              const videoKeys = Object.keys(VIDEO_MAP);
              const currentIndex = videoKeys.indexOf(videoId);
              const prevVideoId = currentIndex > 0 ? videoKeys[currentIndex - 1] : null;
              const nextVideoId = currentIndex !== -1 && currentIndex < videoKeys.length - 1 ? videoKeys[currentIndex + 1] : null;

              return (
                <div className="w-full h-full flex flex-col p-8 md:p-12 overflow-y-auto bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] items-center justify-center">
                  <div className="w-full max-w-5xl">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div>
                         <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2 block opacity-80">{videoId.startsWith('m3') ? 'Module 3 : 模擬演練' : videoId.startsWith('m2') ? 'Module 2 : 面談步驟' : 'Module 1 : 基礎知識'}</span>
                         <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{videoData.title}</h1>
                       </div>
                       
                       <div className="flex gap-3 shrink-0">
                         <button 
                           onClick={() => prevVideoId && navigate(`/simulation/video-${prevVideoId}`)}
                           disabled={!prevVideoId}
                           className={`px-4 py-2 rounded-lg font-bold border transition-all flex items-center gap-2 ${!prevVideoId ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow'}`}
                         >
                           <span className="text-lg leading-none -mt-0.5">‹</span> 上一頁
                         </button>
                         <button 
                           onClick={() => nextVideoId ? navigate(`/simulation/video-${nextVideoId}`) : navigate('/simulation/course_completion')}
                           className={`px-4 py-2 rounded-lg font-bold border transition-all flex items-center gap-2 ${!nextVideoId ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-sm hover:shadow shadow-blue-500/20' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow'}`}
                         >
                           {nextVideoId ? '下一頁' : '完成模組'} <span className="text-lg leading-none -mt-0.5">›</span>
                         </button>
                       </div>
                    </div>
                    
                    <div className="w-full bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] border border-white/40 relative group ring-1 ring-slate-900/5">
                       {/* 裝飾性漸層光暈 */}
                       <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                       <video controls className="w-full relative z-10 block" autoPlay key={videoData.file} style={{ outline: 'none' }}>
                          <source src={`/videos/module1/${videoData.file}`} type="video/mp4" />
                          您的瀏覽器不支援影片播放。
                       </video>
                    </div>

                    <div className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/60 flex gap-5 items-start transition-all hover:shadow-md hover:bg-white">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center shrink-0 shadow-inner">
                         <span className="text-blue-600 text-xl">💡</span>
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-slate-800 mb-1.5 tracking-wide">學習重點提示</h3>
                         <p className="text-slate-600 leading-relaxed text-[15px] font-medium">
                           請專心觀看本段教學影片。在播放過程中，您可以隨時暫停並做筆記；若有不清楚的地方，建議重複觀看以加深印象。看完後可由上方按鈕進入下一章節！
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              );
            }
          }

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
                { id: '1.1', title: '1.1 表達歡迎', content: '感謝應徵者前來面談，讓對方覺得受歡迎與尊重。' },
                { id: '1.2', title: '1.2 自我介紹', content: '雙方交互名片，進行簡單自我介紹，聊一些共同經歷或朋友。' },
                { id: '1.3', title: '1.3 說明流程', content: '說明本次面談的流程及時間，降低應徵者的不確定感。' },
                { id: '1.4', title: '1.4 承諾保密', content: '主動承諾將對面談內容保密，鼓勵應徵者誠實回應。' }
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
                 <div className="flex-1 relative flex flex-col bg-cover bg-center" style={{ backgroundImage: `url('/theory_background.png')` }}>
                    <div className="absolute inset-0 bg-white/40"></div>
                    
                    <div className="w-full max-w-[1000px] ml-4 md:ml-12 flex gap-8 md:gap-12 z-10 pt-16 px-4 md:px-8 flex-1">
                      {/* Left Side Buttons */}
                      <div className="w-[300px] md:w-[320px] shrink-0 flex flex-col gap-4 md:gap-6 pl-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
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
                      <div className="w-[450px] md:w-[500px] shrink-0 flex items-start justify-start relative pt-2">
                         <div className="bg-white/90 backdrop-blur-md border border-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.06)] rounded-2xl p-8 w-full min-h-[200px] transition-all relative overflow-hidden flex flex-col justify-center">
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
            : (mode === 'module3_case1' || mode === 'module3_case2' || mode === 'module3_case3' || mode === 'module3_case4' || mode === 'module3_case5')
            ? ['1.前情提要', '2.任務說明', '3.職能清單', '4.履歷資料', '5.進行演練', '6.技巧檢討']
            : ['1.前情提要', '2.任務說明', '3.進行演練', '4.技巧檢討'];
          
          const isIntro = activeTab === 0;
          const isTask = activeTab === 1;
          const isCompetency = (mode === 'course_evaluating' || mode === 'module3_case1' || mode === 'module3_case2' || mode === 'module3_case3' || mode === 'module3_case4' || mode === 'module3_case5') && activeTab === 2;
          const isResume = (mode === 'module3_case1' || mode === 'module3_case2' || mode === 'module3_case3' || mode === 'module3_case4' || mode === 'module3_case5') && activeTab === 3;
          
          let simTabIndex = 2;
          if (mode === 'course_evaluating') simTabIndex = 3;
          if (mode === 'module3_case1' || mode === 'module3_case2' || mode === 'module3_case3' || mode === 'module3_case4' || mode === 'module3_case5') simTabIndex = 4;
          const isSim = activeTab === simTabIndex;

          let reviewTabIndex = 3;
          if (mode === 'course_evaluating') reviewTabIndex = 4;
          if (mode === 'module3_case1' || mode === 'module3_case2' || mode === 'module3_case3' || mode === 'module3_case4' || mode === 'module3_case5') reviewTabIndex = 5;
          const isReview = activeTab === reviewTabIndex;

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
                      {(mode === 'module3_case2' || mode === 'module3_case4') ? (
                        <>
                          <div className="flex gap-4">
                            <span className="text-blue-500 mt-1">✓</span>
                            <p>你這次的任務，是擔任主管 <strong>George</strong> 的顧問，協助他從應徵者 <strong>{mode === 'module3_case4' ? 'Janie' : 'Simon'}</strong> 的多個回應中，挑出可獲得最高職能評分的回應！</p>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-blue-500 mt-1">✓</span>
                            <p>在過程中，你必須具備正確的<strong>「評估技巧」</strong>，才能順利完成本任務。</p>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-blue-500 mt-1">✓</span>
                            <p>請先在「職能清單」中瞭解{mode === 'module3_case4' ? '團隊合作' : '持續學習'}的行為指標，接著在「進行演練」中與 George 互動，最後在「技巧檢討」中瀏覽評估結果。</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-4">
                            <span className="text-blue-500 mt-1">✓</span>
                            <p>在本演練中，你將扮演面試主管 <strong>George</strong>，與螢幕中人物～應徵者 <strong>{mode === 'module3_case5' ? 'Sophia' : mode === 'module3_case3' ? 'Janie' : mode === 'module3_case1' ? 'Simon' : 'Lisa'}</strong>，進行互動！</p>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-blue-500 mt-1">✓</span>
                            <p>在過程中，你必須採取正確的<strong>「{taskInstructions[mode]}」</strong>以及<strong>「溝通原則」</strong>，才能順利完成本任務。</p>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-blue-500 mt-1">✓</span>
                            <p>請先在「前情提要」中瞭解劇情，接著在「進行演練」中與 {mode === 'module3_case5' ? 'Sophia' : mode === 'module3_case3' ? 'Janie' : mode === 'module3_case1' ? 'Simon' : 'Lisa'} 互動，最後在「技巧檢討」中，瀏覽演練成績。</p>
                          </div>
                        </>
                      )}
                      {mode === 'course_evaluating' && (
                        <div className="flex gap-4">
                          <span className="text-blue-500 mt-1">✓</span>
                          <p>如果你選擇接受本任務，請先在<span className="text-red-500 font-bold">職能清單</span>中，瞭解主動積極的行為指標，然後再開始<span className="text-red-500 font-bold">進行演練</span>。</p>
                        </div>
                      )}
                      {(mode === 'module3_case2' || mode === 'module3_case4') && (
                        <div className="flex gap-4">
                          <span className="text-blue-500 mt-1">✓</span>
                          <p>如果你選擇接受本任務，請先在<span className="text-red-500 font-bold">職能清單</span>中，瞭解該職能及其行為指標，然後再開始進行演練。</p>
                        </div>
                      )}
                      {(mode === 'module3_case1' || mode === 'module3_case3' || mode === 'module3_case5' || mode === 'module4_case1') && (
                        <div className="flex gap-4">
                          <span className="text-blue-500 mt-1">✓</span>
                          <p>如果你選擇接受本任務，請先在<span className="text-red-500 font-bold">職能清單</span>中，瞭解該職能及其行為指標，然後在<span className="text-red-500 font-bold">履歷資料</span>中，瞭解 {mode === 'module3_case5' ? 'Sophia' : mode === 'module3_case3' ? 'Janie' : mode === 'module3_case1' ? 'Simon' : '張小姐'} 的背景，然後進行演練。</p>
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

            {/* Tab 2.5: 職能清單 */}
            {isCompetency && (
              <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-start bg-slate-50">
                <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-14 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-500"></div>
                  
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-wider">
                      職能清單 (目標職能：<span className="text-red-500 font-black">{mode === 'module3_case1' || mode === 'module3_case2' ? '持續學習' : (mode === 'module3_case3' || mode === 'module3_case4') ? '團隊合作' : mode === 'module3_case5' ? '研發創新' : '主動積極'}</span>)
                    </h2>
                  </div>

                  <div className="space-y-4 text-[18px] leading-[2] text-slate-700 font-medium tracking-wide bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    {(mode === 'module3_case1' || mode === 'module3_case2') ? (
                      <ul className="list-disc pl-6 space-y-3">
                        <li>把挑戰視為學習機會。</li>
                        <li>能分辨出自己需要學習的地方。</li>
                        <li>能找出適合自己的學習方式。</li>
                        <li>積極將學習成果應用在工作中。</li>
                        <li>願意承擔學習中所遭遇的困難或風險。</li>
                      </ul>
                    ) : (mode === 'module3_case3' || mode === 'module3_case4') ? (
                      <ul className="list-disc pl-6 space-y-3">
                        <li>瞭解團隊目標以及各成員之角色職責。</li>
                        <li>執行團隊決議，置團隊利益於個人利益之上。</li>
                        <li>樂意分享訊息，提供支援，促進團隊成功。</li>
                        <li>以公平、誠信、尊重、體諒之方式對待成員。</li>
                        <li>願意給予回饋，也樂於接受回饋。</li>
                      </ul>
                    ) : mode === 'module3_case5' ? (
                      <ul className="list-disc pl-6 space-y-3">
                        <li>辨別效益瓶頸，關注創新契機。</li>
                        <li>樂於接受新知，擁有多元知識來源。</li>
                        <li>進行跨領域思考，在看似無關之處找出關聯性。</li>
                        <li>挑戰既有模式，嘗試以非傳統方法解決問題。</li>
                        <li>評估創新效益，預想落實之障礙及化解方式。</li>
                      </ul>
                    ) : (
                      <ul className="list-disc pl-6 space-y-3">
                        <li>歸屬不明之任務，能主動爭取。</li>
                        <li>不清楚之處，能主動澄清、詢問、確認。</li>
                        <li>採取預防性措施，避免問題發生。</li>
                        <li>獨立作業，不需監督。</li>
                        <li>超越工作範圍。</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Tab 3: 履歷資料 (module3_case1 專屬) */}
            {isResume && (
              <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-start bg-slate-50">
                <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-14 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                  
                  <div className="mb-8 flex items-center gap-6 border-b border-slate-100 pb-8">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm bg-white">
                      <img src={mode === 'module3_case5' ? "/avatar_sophia_neutral.png" : (mode === 'module3_case3' || mode === 'module3_case4') ? "/avatar_janie_neutral.png" : "/avatar_simon_neutral.png"} alt={mode === 'module3_case5' ? "Sophia" : (mode === 'module3_case3' || mode === 'module3_case4') ? "Janie" : "Simon"} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-800 tracking-wider mb-2">{mode === 'module3_case5' ? "Sophia" : (mode === 'module3_case3' || mode === 'module3_case4') ? "Janie" : "Simon"}</h2>
                      <div className="text-slate-500 text-lg font-medium flex gap-4">
                        <span>{(mode === 'module3_case3' || mode === 'module3_case4' || mode === 'module3_case5') ? "女" : "男"}</span>
                        <span>|</span>
                        <span>{mode === 'module3_case5' ? "30歲" : "27歲"}</span>
                        <span>|</span>
                        <span>應徵：{mode === 'module3_case5' ? "管理師" : (mode === 'module3_case3' || mode === 'module3_case4') ? "業務專員" : "MIS工程師"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 text-[18px] leading-[1.8] text-slate-700 font-medium tracking-wide">
                    <div>
                      <h3 className="text-xl font-bold text-teal-600 mb-3 flex items-center gap-2">
                        <span>🎯</span> 嗜好
                      </h3>
                      <p className="bg-slate-50 px-5 py-3 rounded-xl">
                        {mode === 'module3_case5' ? '喜歡閱讀、看展覽、自助旅行、瑜珈。' : (mode === 'module3_case3' || mode === 'module3_case4') ? '柔道、看電影、自助旅行、聽音樂。' : '喜歡爬山、攀岩、騎腳踏車、聽音樂。'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-teal-600 mb-3 flex items-center gap-2">
                        <span>🎓</span> 學歷
                      </h3>
                      <ul className="bg-slate-50 px-5 py-3 rounded-xl list-none space-y-2">
                        {mode === 'module3_case5' ? (
                          <>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2016.07～2018.05</span> G大學 碩士</li>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2012.07～2016.05</span> G大學 學士</li>
                          </>
                        ) : (mode === 'module3_case3' || mode === 'module3_case4') ? (
                          <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2017.09～2021.05</span> Ｆ大學中文系 學士</li>
                        ) : (
                          <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2015.09～2018.05</span> D大學資訊管理系 學士</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-teal-600 mb-3 flex items-center gap-2">
                        <span>💼</span> 經歷
                      </h3>
                      <ul className="bg-slate-50 px-5 py-4 rounded-xl list-none space-y-4">
                        {mode === 'module3_case5' ? (
                          <>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2019.04～至今</span> <strong>I公司 專案經理</strong></li>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2018.07～2019.02</span> <strong>H公司 業務專員</strong></li>
                          </>
                        ) : (mode === 'module3_case3' || mode === 'module3_case4') ? (
                          <>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2020.09～2021.05</span> <strong>達美樂 工讀</strong></li>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2019.03～2021.05</span> <strong>柔道社 副社長</strong></li>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2017.12～2018.12</span> <strong>山地服務社 社員</strong></li>
                          </>
                        ) : (
                          <>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2019.03～至今</span> <strong>E公司 軟體工程師</strong></li>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2018.07～2019.02</span> <strong>D公司 測試工程師</strong></li>
                            <li className="flex gap-4"><span className="text-slate-400 font-mono w-40 shrink-0">2017.09～2018.05</span> <strong>系學會副會長</strong></li>
                          </>
                        )}
                      </ul>
                    </div>
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
