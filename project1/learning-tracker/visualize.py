import sqlite3
import matplotlib.pyplot as plt
import os
from datetime import datetime

# 我們要讀取的資料庫檔案
DB_FILE = "learning_log.db"

def show_pie_chart():
    # 檢查資料庫存不存在
    if not os.path.exists(DB_FILE):
        print("❌ 找不到資料庫！請先執行 tracker.py 來累積一些紀錄。")
        return

    # 讓使用者輸入想查詢的日期
    print("==================================")
    print("你想查詢哪一天的紀錄？")
    print("格式例如: 2026-04-29")
    print("(如果想直接看「今天」的紀錄，請直接按 Enter)")
    print("==================================")
    
    target_date = input("請輸入日期: ").strip()
    
    # 如果使用者直接按 Enter，就抓出今天的日期
    if target_date == "":
        target_date = datetime.now().strftime("%Y-%m-%d")

    # 1. 連線到資料庫
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # 2. SQL 查詢魔法 (加入了日期過濾 WHERE date(start_time) = ?)
    cursor.execute('''
        SELECT app_title, SUM(duration) as total_time 
        FROM Logs 
        WHERE date(start_time) = ?
        GROUP BY app_title 
        ORDER BY total_time DESC
    ''', (target_date,))
    
    results = cursor.fetchall()
    conn.close()

    # 檢查那一天有沒有紀錄
    if not results:
        print(f"\n⚠️ 找不到 {target_date} 這一天的任何紀錄喔！")
        return

    # 3. 整理資料準備畫圖
    labels = []  
    sizes = []   
    
    for row in results:
        app_name = row[0]
        total_seconds = row[1]
        
        # 為了美觀，如果應用程式名稱太長，我們把它截斷並加上...
        if len(app_name) > 30:
            app_name = app_name[:30] + "..."
            
        labels.append(app_name)
        sizes.append(total_seconds)

    # 4. 開始畫圓餅圖
    plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
    plt.rcParams['axes.unicode_minus'] = False

    plt.figure(figsize=(10, 7))
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140)
    
    # 標題加上日期
    plt.title(f"我的學習紀錄時間分配 ({target_date})")
    
    print(f"\n📊 正在產生 {target_date} 的圓餅圖，請查看新彈出的圖表視窗！")
    plt.show()

if __name__ == "__main__":
    show_pie_chart()
