---
name: GCP VM Cross-Account Migration
description: A step-by-step guide and workflow for migrating a Compute Engine VM from one Google Cloud Platform account to another using Machine Images.
---

# GCP VM Cross-Account Migration Skill

這個 Skill 記錄了在 GCP (Google Cloud Platform) 兩個不同 Google 帳號之間搬遷虛擬機器（Virtual Machine, VM）的標準流程。由於 GCP 不允許直接跨帳號拖曳或移轉資源，最推薦的做法是製作機器映像檔（Machine Image）並透過 IAM 授權給新帳號讀取。

## 搬遷先決準備條件
- 擁有來源的 GCP 帳號層級存取權（能製作映像檔並修改 IAM 權限）。
- 擁有目標的 GCP 帳號層級存取權（能建立專案、綁定帳單並建立 VM）。

---

## 搬遷操作流程

### 階段一：來源帳號操作 (原帳號)
1. **將 VM 關機（強烈建議）**：避免製作映像檔過程中發生寫入衝突導致資料損毀。
2. **建立機器映像檔（Machine Image）**：
   - 進入主控台的 `Compute Engine` > `機器映像檔`。
   - 點擊「建立機器映像檔」，選擇來源 VM。
   - **位置 (Location)**：選擇與目標 VM 相同的「單一區域 (Regional)」（如 `asia-east1`）以節省儲存與傳輸費用並加快建置速度。
   - **加密 (Encryption)**：務必選擇「Google 代管的加密金鑰 (Google-managed encryption key)」。若使用自訂金鑰 (CMEK) 會導致跨帳號授權過於複雜。
3. **分享 IAM 讀取權限給新帳號**：
   - 前往 `IAM 與管理` > `IAM`。
   - 點擊「授予存取權 (Grant Access)」。
   - 新增主參與者：輸入目標新帳號的 Google Email。
   - 指派角色：指定 `Compute Engine` > `Compute 映像檔使用者`。

### 階段二：目標帳號操作 (新帳號)
1. **建立並準備新專案**：
   - 登入新帳號並建立全新的 GCP 專案。**請記錄下專案 ID (Project ID)**。
   - 前往 `帳單 (Billing)`，為該專案連結一個有效的帳單帳戶（信用卡）。
   - 前往 `Compute Engine` > `VM 執行個體`，點擊「啟用 (Enable)」以開啟 Compute Engine API（需等待約 1~5 分鐘）。
2. **透過共享映像檔建立 VM**：
   - 點擊「建立執行個體」。
   - 滾動至「開機磁碟 (Boot Disk)」並點擊「變更」。
   - 切換至「機器映像檔 (Machine images)」分頁。
   - 選擇「顯示其他專案的映像檔」 或是手動輸入「來源舊帳號的專案 ID」。
   - 選擇剛剛打包好的映像檔。
   - 設定網路與硬體後，點選建立。

---

## 搬遷後收尾清單 (Checklist)
- [ ] **更新 DNS 紀錄**：新 VM 會配發一組新的外部 IP (External IP)，請務必去你的網域託管商處將 A 紀錄指向新 IP。
- [ ] **重設防火牆規則**：映像檔不包含 VPC 網路設定。請至 `VPC 網路` > `防火牆` 重新設定所需的 Port（如 80, 443 等）。
- [ ] **清除舊資源停損**：確認新 VM 正常運行後，回到舊帳號，立即刪除原來的「VM 執行個體」與「機器映像檔」，以終止舊帳號的計費。
