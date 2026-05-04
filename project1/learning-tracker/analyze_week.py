import sqlite3
import os
from datetime import datetime
try:
    import google.generativeai as genai
except ImportError:
    print("⚠️ 錯誤：請先安裝 Gemini SDK。")
    print("請在終端機輸入: pip install google-generativeai")
    exit()

# ==========================================
# ⚙️ 設定區：請在這裡填寫您的 Gemini API Key
# ==========================================
GOOGLE_API_KEY = "請將這段文字替換成您的_GEMINI_API_KEY"

if GOOGLE_API_KEY == "請將這段文字替換成您的_GEMINI_API_KEY":
    # 嘗試從環境變數讀取
    GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if not GOOGLE_API_KEY:
    print("⚠️ 警告：找不到 Gemini API Key！")
    print("請打開 analyze_week.py，將 GOOGLE_API_KEY 變數替換成您自己的 Key。")
    exit()

# 設定 Gemini 模型
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash') # 使用輕量且快速的模型

DB_FILE = "learning_log.db"

def get_recent_data():
    """從資料庫撈取最近的軟體使用數據並加總"""
    if not os.path.exists(DB_FILE):
        return []
        
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # MVP 為了確保有資料，我們先把資料庫內所有紀錄（或前 20 筆最常用的）加總
    # 實際上線時可以改成 WHERE start_time >= datetime('now', '-7 days')
    cursor.execute('''
        SELECT app_title, SUM(duration) as total_duration
        FROM Logs
        GROUP BY app_title
        ORDER BY total_duration DESC
        LIMIT 20
    ''')
    
    results = cursor.fetchall()
    conn.close()
    return results

def analyze_with_ai(data):
    """將數據送給 LLM 進行分析與建議"""
    if not data:
        print("❌ 目前沒有足夠的數據可供分析，請先運行 tracker.py 累積幾筆資料。")
        return
        
    # 將資料轉換成容易閱讀的字串格式
    data_str = "\n".join([f"- {row[0]}: {row[1]} 秒" for row in data])
    
    # 撰寫給 AI 教練的 Prompt
    prompt = f"""
你是一位資深的「雲端 OTJ Coach (在職訓練教練)」。
以下是你的一位學員最近的電腦視窗使用紀錄（格式為：視窗標題: 停留總秒數）。

【學員數據紀錄】：
{data_str}

請根據上述數據，扮演一位溫和、專業且具備洞察力的教練，進行分析並直接對學員說話。
請包含以下兩個段落：
1. 🔍 【行為觀察】：你從他的視窗紀錄中觀察到了什麼趨勢或工作模式？（例如：他可能在進行什麼開發專案？在哪個網頁卡關？或是哪項軟體花費異常多的時間？）
2. 💡 【教練建議】：針對你觀察到的痛點或模式，給他一個具體、可執行的「微學習建議」或「工作流程改善建議」。（例如：推薦學習某個 Python 套件來取代手動 Excel、推薦某個除錯 SOP、或是建議設定番茄鐘）。

請使用繁體中文，語氣像是資深同事在關心後輩，排版清晰，重點可以使用粗體。字數控制在 350 字左右。
"""
    
    print("🧠 您的專屬 OTJ 教練正在閱讀您的工作日誌，請稍候...\n")
    try:
        response = model.generate_content(prompt)
        print("================ 🎯 OTJ Coach 本週覆盤 ================\n")
        print(response.text)
        print("\n=======================================================")
    except Exception as e:
        print(f"❌ 呼叫 AI API 時發生錯誤：{e}")
        print("請確認您的 API Key 是否正確且有效。")

if __name__ == "__main__":
    print("🚀 啟動 OTJ Coach 分析引擎...")
    usage_data = get_recent_data()
    analyze_with_ai(usage_data)
