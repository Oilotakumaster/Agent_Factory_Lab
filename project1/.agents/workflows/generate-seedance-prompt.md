---
description: 自動生成即夢AI (Jimeng AI) Seedance 2.0 影片生成 Prompt
---

# 即夢 AI Seedance 2.0 Prompt 自動生成工作流

當使用者要求「生成即夢 AI / Seedance 2.0 的 prompt」或呼叫此技能時，請依照下列步驟執行：

1. **詢問或分析使用者提供的核心概念**：
   如果使用者還沒提供，請詢問他們：「你想產生什麼畫面的影片？請告訴我主角、初步場景或大致上的動作」。

2. **套用 Seedance 2.0 專屬「五要素法則」**：
   根據目前最新的 Seedance 2.0 最佳實踐，請你以 Agent 的身分發揮創意，擴充使者的點子並確保 Prompt 確實涵蓋以下五大要素：
   - **場景 (Scene)**：具體時間、地點、天氣與環境細節
   - **主體 (Subject)**：角色外觀、種族、服裝特徵
   - **動作 (Action)**：精確的動態行為描述（如：緩慢轉身、奔跑中回頭）
   - **鏡頭語言 (Camera Language)**：鏡位（特寫 Close-up、廣角 Wide shot）、運鏡（Pan、Zoom in）、燈光（體積光、側光）
   - **氛圍語法 (Vibe/Style)**：例如電影感(Cinematic)、超寫實(Hyperrealistic)、膠片質感(Film grain)、冷色調

3. **格式化輸出雙語 Prompt**：
   Seedance 模型底層對於「英文提示詞」的理解通常有更精準的鏡頭控制力，但中文介面也支援。請同時提供中英文對照的 Prompt。
   
   **格式範例**：
   **[英文 Prompt]**: A cinematic wide shot of a bustling cyberpunk city street at night in rain, neon lights reflecting on the wet pavement. A young woman with short pink hair...
   **[中文對照]**: 廣角電影鏡頭，下雨的夜晚，賽博龐克城市街道...

4. **給予平台操作提示**：
   完成 Prompt 後，提醒使用者：Seedance 2.0 強大之處在於「多模態輸入」。若要角色一致，建議在即夢平台上傳參考圖，並於輸入框使用 `@` 符號標記圖片資產進行關聯生成。
