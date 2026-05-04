import os
import time
import shutil
from pathlib import Path

# 設定 Obsidian 資料夾路徑
BASE_DIR = Path(r"d:\agent_factory\NEW PROJECT")
INBOX_DIR = BASE_DIR / "0_Inbox"
DAILY_DIR = BASE_DIR / "6_Daily_Notes"
ZETTEL_DIR = BASE_DIR / "5_Zettelkasten"

print("Obsidian Agent is running!")
print(f"Monitoring inbox: {INBOX_DIR.name} ...")
print("-" * 40)

def log_to_daily_note(message):
    today_str = time.strftime("%Y-%m-%d")
    now_str = time.strftime("%H:%M")
    daily_file = DAILY_DIR / f"{today_str}.md"
    
    log_line = f"\n- 🤖 [{now_str}] {message}"
    
    # 如果今天的筆記還不存在，就順便幫忙建立
    if not daily_file.exists():
        daily_file.write_text(f"# 📅 每日筆記 - {today_str}\n\n## 🤖 Agent 歸檔紀錄", encoding="utf-8")
        
    try:
        with open(daily_file, "a", encoding="utf-8") as f:
            f.write(log_line)
    except Exception as e:
        print(f"Log write failed: {e}")

def process_file(filepath):
    # 略過已經處理過或是README檔案
    if filepath.name.startswith("[Processed]") or filepath.name.startswith("[Task]") or filepath.name.startswith("[Idea]") or filepath.name.startswith("[已讀]") or filepath.name == "README.md":
        return
    if not filepath.is_file():
        return

    print(f"\nNew note detected: {filepath.name}")
    try:
        # 讀取你的筆記內容
        content = filepath.read_text(encoding="utf-8", errors="ignore")
        
        # 簡易的關鍵字辨識大腦 (未來可替換串接 LLM API)
        if "待辦" in content or "要做" in content or "任務" in content:
            print("-> [AI Action] Task detected! Moving to Daily Notes...")
            new_path = DAILY_DIR / f"[Task] {filepath.name}"
            # 確保不會覆蓋已有檔案
            if new_path.exists():
                new_path = DAILY_DIR / f"[Task] {filepath.name}_{int(time.time())}"
            shutil.move(str(filepath), str(new_path))
            print(f"-> Success! Note moved to: {DAILY_DIR.name}")
            log_to_daily_note(f"阿爾弗雷德報告：發現任務，已將 [[{new_path.stem}]] 移動到 {DAILY_DIR.name}。")
            
        elif "想法" in content or "靈感" in content or "idea" in content.lower():
            print("-> [AI Action] Idea detected! Converting to Zettelkasten block...")
            new_path = ZETTEL_DIR / f"[Idea] {filepath.name}"
            if new_path.exists():
                new_path = ZETTEL_DIR / f"[Idea] {filepath.name}_{int(time.time())}"
            shutil.move(str(filepath), str(new_path))
            print(f"-> Success! Card saved to: {ZETTEL_DIR.name}")
            log_to_daily_note(f"阿爾弗雷德報告：擷取到好點子！已將 [[{new_path.stem}]] 轉成永久卡片存入 {ZETTEL_DIR.name}。")
            
        else:
            print("-> [AI Action] General note. Keeping in Inbox as processed.")
            new_path = filepath.parent / f"[Processed] {filepath.name}"
            filepath.rename(new_path)
            log_to_daily_note(f"阿爾弗雷德報告：已閱讀並標記了 Inbox 的一般筆記 [[{new_path.stem}]]。")
            
    except Exception as e:
        print(f"Process failed: {e}")

last_mtime = {}
last_active_time = {}

# 死迴圈：讓 Agent 永遠醒著監視 (按 Ctrl+C 可關閉)
while True:
    for file in INBOX_DIR.glob("*"):
        # 假設是沒處理過的檔案
        if file.is_file() and not file.name.startswith("[Processed]") and not file.name.startswith("[Task]") and not file.name.startswith("[Idea]") and not file.name.startswith("[已讀]"):
            
            current_mtime = file.stat().st_mtime
            
            # 第一次遇到這個檔案
            if file.name not in last_mtime:
                last_mtime[file.name] = current_mtime
                last_active_time[file.name] = time.time()
                print(f"\n[Watch] 新檔案 {file.name} 進入監控範圍...")
            else:
                # 發現檔案又被改動了 (使用者還在打字)，重置計時器！
                if current_mtime != last_mtime[file.name]:
                    last_mtime[file.name] = current_mtime
                    last_active_time[file.name] = time.time()
                    print(f"\n[Reset] 檔案 {file.name} 偵測到打字動作，重新給予 60 秒...")
                
                # 這個檔案的修改時間已經連續 60 秒都沒變了
                if time.time() - last_active_time[file.name] > 60:
                    print(f"\n[Action] 檔案 {file.name} 已經靜默 60 秒，即將開始歸檔！")
                    process_file(file)
                    # 處理完畢移除追蹤
                    del last_mtime[file.name]
                    del last_active_time[file.name]
                    
    time.sleep(2) # 每 2 秒檢查一次資料夾
