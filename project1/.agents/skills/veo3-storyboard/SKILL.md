---
name: VEO 3 Storyboard Prompt Generator
description: 生成適用於 Google VEO 3 影片生成模型的高品質動態分鏡表 Prompt
---

# VEO 3 影片分鏡表 Prompt 生成指南

## 核心目標
本 Skill 旨在協助使用者生成適用於 Google 最新世代影片生成大模型「VEO 3」的高品質 Prompt。特別針對影片生成所需的「動態連貫性」與「空間感」，將文字故事轉化為專業的影片分鏡表。

## 分鏡表標準結構 (Storyboard Structure)
影片生成與靜態圖像不同，非常重視 **「動作細節」** 與 **「攝影機物理軌跡」**。提供給 VEO 3 的 Prompt 設計將包含以下五個核心元素：

1. **鏡頭號碼 (Shot Number)**：標示場景與鏡頭順序 (例如：Sc01_Shot01)。
2. **畫面描述 (Scene)**：
   - 場景設定、時間、地點、質感、天氣與物理現象。
   - 範例：「賽博龐克風格的城市街道，夜晚，積水的路面反射著霓虹燈，下著傾盆大雨。」
3. **動態與主體行為 (Action & Dynamics)**：
   - 描述畫面中主要人物、物件的連續行為，以及周遭環境的物理變化（如：風吹草動、煙霧擴散、水花四濺）。
   - 範例：「主角身穿黑色風衣，從畫面左側快速奔跑而過，腳踏出巨大的水花，大衣下擺隨風劇烈飄動。」
4. **攝影機運鏡 (Camera Movement)**：
   - 景別 (Wide, Medium, Close-up) 和真實世界的攝影機動態 (Pan, Tilt, Tracking, FPV, Drone shot, Dolly-in, Handheld)。
   - 範例：「中景 (Medium Shot)，低角度 (Low Angle)，便攜式手持搖晃感 (Handheld shaky camera)，攝影機緊緊跟隨主角推進 (Tracking shot)。」
5. **氛圍與光影 (Lighting & Vibe)**：
   - 畫面的整體色調、光線來源、渲染質感和電影級物理特效（如：動態模糊 Motion Blur、景深 Depth of Field、鏡頭光暈 Lens Flare）。
   - 範例：「冷色調(Cyan and Blue)，高對比藍紫霓虹背光，電影級淺景深(Shallow DoF)。」

## VEO 3 Prompt 公式
VEO 3 對於流暢的動作敘事和逼真的攝影機運動有著強大的理解力，英文 Prompt 結構需以連貫的描述為主：
`[Cinematic format/Medium], [Scene environment], [Subject description and detailed continuous ACTION], [Specific Camera MOVEMENT & Shot type], [Lighting, Color grading, Cinematic effects]`

## 運作流程
1. **收集資訊**：詢問使用者想生成的「動態畫面」或「故事劇本」。
2. **動作與運鏡強化**：針對 VEO 3 影片模型特性，特別強化對「連續動態 (Action)」與「空間運鏡 (Camera)」的描述。
3. **輸出分鏡表**：以 Markdown 表格呈現。
4. **生成 VEO 3 Prompt**：轉譯為專業、具備時序感且連貫的英文影片生成提示詞。

## 輸出格式範例
請嚴格遵循以下 Markdown 表格格式回覆分鏡設計：

| 鏡頭號碼 | 畫面描述 (Scene) | 動態與主體行為 (Action) | 攝影機運鏡 (Camera) | 氛圍與光影 (Vibe) | VEO 3 Prompt (English) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Shot_01 | 夜晚賽博龐克街道，大雨滂沱，路面積水 | 男主角穿黑風衣疾跑，腳踏出水花，衣擺在風中劇烈飄動 | 中景，手持搖晃感，攝影機跟隨主角推進 | 冷色調，霓虹燈背光，帶有動態模糊 | Cinematic film style, cyberpunk city street at night in pouring rain with deep puddles. A male protagonist in a black trench coat runs quickly, boots splashing water, trench coat billowing violently in the wind. Medium low angle tracking shot, handheld shaky camera moving forward alongside him. Cool cyan tones, neon backlighting, shallow depth of field with slight motion blur. |

## 互動指示
當使用者觸發此 Skill 或是提及「幫我寫 VEO 3 提示詞/分鏡」時，請先詢問：
「請告訴我你想要的**影片動作場景**或是**故事段落**。我會針對 VEO 3 的 AI 影片特性，幫您強化**『物理動態』**與**『運鏡軌跡』**，並輸出包含 5 大元素的專業分鏡表！」
