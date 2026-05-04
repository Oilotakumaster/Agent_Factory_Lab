import ctypes
import time
import sqlite3
import os
from datetime import datetime

# 設定資料庫檔案的名稱
DB_FILE = "learning_log.db"

def init_db():
    """邏輯 1：初始化資料庫，如果資料表不存在就建立一個"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # 建立一個叫 Logs 的資料表
    # 包含：ID(自動遞增)、開始時間、結束時間、時長、應用程式標題
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT,
            end_time TEXT,
            duration INTEGER,
            app_title TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_to_sqlite(start_time, end_time, duration, window_title):
    """邏輯 2：將紀錄安全地寫入 SQLite 資料庫"""
    try:
        start_str = start_time.strftime("%Y-%m-%d %H:%M:%S")
        end_str = end_time.strftime("%Y-%m-%d %H:%M:%S")
        
        # 每次寫入時建立新連線，寫完自動關閉
        # 這種隨開隨關的作法，能確保你可以「隨時用資料庫軟體」查看這份檔案，不會遇到檔案被鎖的問題
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 用 INSERT INTO 將資料新增進資料庫
        cursor.execute('''
            INSERT INTO Logs (start_time, end_time, duration, app_title)
            VALUES (?, ?, ?, ?)
        ''', (start_str, end_str, duration, window_title))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"\n⚠️ 警告：寫入資料庫失敗！錯誤訊息：{e}")
        return False

def get_active_window_title():
    """呼叫 Windows 底層功能，獲取目前最上層（正在使用）的視窗標題"""
    hwnd = ctypes.windll.user32.GetForegroundWindow()
    length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
    buff = ctypes.create_unicode_buffer(length + 1)
    ctypes.windll.user32.GetWindowTextW(hwnd, buff, length + 1)
    return buff.value

def main():
    print("🚀 學習紀錄程式 (SQLite 資料庫進階版) 已啟動！")
    print(f"📁 所有紀錄都會被集中存放在同一個檔案: {os.path.abspath(DB_FILE)}")
    print("想停止請在終端機按 Ctrl+C\n")
    
    # 程式一啟動，先確保資料庫跟資料表已經準備好
    init_db()
    
    current_window = get_active_window_title()
    start_time = datetime.now()
    
    try:
        while True:
            time.sleep(5) 
            
            new_window = get_active_window_title()
            
            if new_window != current_window:
                end_time = datetime.now()
                duration = int((end_time - start_time).total_seconds())
                
                if duration >= 5 and current_window.strip():
                    # 呼叫新的資料庫儲存函式
                    success = save_to_sqlite(start_time, end_time, duration, current_window)
                    if success:
                        print(f"✅ 紀錄: [{current_window}] 使用了 {duration} 秒")
                
                current_window = new_window
                start_time = datetime.now()
                
    except KeyboardInterrupt:
        end_time = datetime.now()
        duration = int((end_time - start_time).total_seconds())
        if duration > 0 and current_window.strip():
            save_to_sqlite(start_time, end_time, duration, current_window)
        print(f"\n🛑 紀錄程式已停止！你可以去查看 {DB_FILE} 裡的 Logs 資料表囉。")

if __name__ == "__main__":
    main()
