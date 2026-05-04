# Workflow: Obsidian 歸檔管家 (Alfred)

這是一份標準化工作流 (Workflow)。只要每次打開專案，就可以透過執行此文件，一鍵喚醒背景的 Obsidian 管家。

## 🤖 關於管家 Alfred
Alfred 是一款專為你設計的本機端 Python Agent，它的核心功能包含：
1. **防人類干擾機制**：運用「60秒無差別靜默期」，只要你還在打字，就絕對不會把筆記抽走。
2. **自動語意分類**：自動辨識「任務」、「靈感」，並發送至 `6_Daily_Notes` 或 `5_Zettelkasten`。
3. **每日報備日誌**：歸檔完成後，自動打開今日的 Daily Note 追加工作明細。

---

## 🚀 啟動指令

如果你需要重新啟動管家，請讓 Agent 執行下方帶有 `// turbo` 標記的 Terminal 指令。

// turbo
```powershell
python inbox_agent.py
```

## 📝 備註事項
* **檔案依賴**：本服務依賴專案根目錄下的 `inbox_agent.py`。
* **關閉方式**：若要強制關閉，你可以在 Terminal 直接按下 `Ctrl+C` 取消背景監控，或是重新下達指令殺死 python 程序。
