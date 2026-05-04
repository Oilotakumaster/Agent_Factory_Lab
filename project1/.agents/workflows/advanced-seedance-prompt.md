---
description: Advanced: 自動生成 即夢 AI (Seedance 2.0) 專業影視級 Prompt
---

# 🚀 Advanced Seedance 2.0 Prompt 自動生成工作流

根據 GitHub `awesome-seedance-2-prompts` 開源庫的最佳實踐，為使用者產生媲美好萊塢/專業商業影視的 Seedance 2.0 (即夢AI) 影片提示詞。

## 觸發方式
當使用者明確呼叫此 Advanced Skill，或提供影片點子並要求「專業影視級 Prompt」時，請執行以下步驟：

---

## 執行步驟：

### 1. 概念擷取與分鏡規劃 (Storyboard Planning)
分析使用者的基本點子，並以專業影像導演的思維，將標準生成時長（預設 15 秒）強制拆分成 3 個相連的多維度分鏡 (Shots)：
*   **0-5秒 (前奏/導入)**：建立鏡頭 (Establishing shot)、環境光線引入、主角初見端倪。
*   **5-10秒 (發展/極致動態)**：情緒爆發、戲劇張力的極致動態、運鏡轉場。
*   **10-15秒 (高潮/餘韻)**：光影變化收尾、核心細節特寫 (Extreme close-up)。

### 2. 套用高階影視六大維度框架 (Six-Dimension Cinematic Framework)
利用專業英文字彙，擴充以下六大區塊（需包含在最終 Prompt 內）：
- **[Style] 視覺與畫質設定**：如 `Hollywood cinematic blockbuster`, `High-fashion Editorial Style`, `Unreal Engine 5 fluid rendering`, `8K ultra-clear`, `photorealistic` 等。
- **[Scene] 深度場景構建**：不僅描寫地點，要加入光影動態細節，例如 `Volumetric lighting`, `wet asphalt reflecting neon lights`, `cinematic depth of field`。
- **[Subject] 角色 / 主體細節**：服裝紋理、微表情、呼吸感，提示詞需確保外觀不變形 (`maintain consistent faces, clothing without deformation`)。
- **[Camera] 專業鏡頭語言**：如 `Low-angle tracking shot`, `rapid multi-angle system`, `speed ramp transitions`, `whip pans` 等特效運鏡。
- **[VFX] 視覺動態與特效**：如水漬飛濺 (`water droplets splashing`)、粒子消散 (`particle explosions`)、殘影 (`motion blur`)。
- **[Sound] 聽覺感官 (Seedance 2.0 支援動態配樂)**：指明 BGM 節奏與場景音，如 `180 BPM electronic beat`, `healing ASMR`, `distant thunder`。

### 3. 生成結構化的雙語 Prompt
將規劃好的內容組合成具有高密度資訊的純文字 Prompt，確保結構嚴謹且易於讓模型理解。必須同時輸出**英文版（用作直接生成）**與**日/中文詳解版（供創作者閱讀）**。

#### 📝 [英文 Prompt 模板範例]
```text
[Style] {視覺風格關鍵字}. [Scene] {場景及光影細節}. [Subject] {角色與服裝精準描述}.
[00:00-00:05] Shot 1: {運鏡方式}, {動作描述}, {畫面特效}.
[00:05-00:10] Shot 2: {運鏡方式}, {情緒爆發/動作轉換}, {畫面特效}.
[00:10-00:15] Shot 3: {運鏡方式}, {結尾或特寫}, {光影收尾}.
[VFX Focus] {整體特效提醒}, no distortion. [Sound] {聲音特效或BGM設計}.
```

### 4. 進階操作策略建議 (Pro-Tips)
在給出 Prompt 的同時，引導使用者掌握 Seedance 2.0 的進階玩法：
1. **角色/場景連貫性**：建議上傳主角參考圖，或是輸入第一幕的截圖（使用 `@` 符號標記），確保模型在切換分鏡時不會產生容貌與場景偏移（Identity consistency）。
2. **多模態驅動**：若畫面有嘴型變化 (Lip-sync)，建議直接上傳該段配音音訊讓 AI 對齊嘴型；若想強化打擊感，可以上傳音樂讓模型自動捕捉節奏 (`auto-scoring`)。
