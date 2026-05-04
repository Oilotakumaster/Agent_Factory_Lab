import os
import sys
import time
from PIL import ImageGrab
from dotenv import load_dotenv

# 強制 Windows 終端機使用 UTF-8 輸出，避免 Emoji 報錯
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

import vertexai
from vertexai.generative_models import GenerativeModel, Part

# 1. 載入環境變數與設定 Vertex AI
load_dotenv()

# 自動套用原本系統中設定的 JSON 憑證與 GCP Project
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"D:\agent_factory\NEW PROJECT\vertex-ai-test-key.json"
vertexai.init(project="vertex-ai-test-493513", location="us-central1")

model = GenerativeModel('gemini-2.5-flash')

def capture_screen():
    print("📸 擷取目前螢幕畫面中...")
    # 擷取全螢幕畫面
    screen = ImageGrab.grab()
    # 為了節省 Token 與加快傳輸速度，將截圖縮小
    screen.thumbnail((1280, 720))
    return screen

def analyze_screen(image):
    print("🤖 正在呼叫 Gemini Vision 分析畫面...")
    prompt = """
    你是一位專業的「雲端 OTJ Coach Agent (企業在職培訓教練)」。
    請觀察這張員工目前電腦螢幕的截圖，並產出一份簡短的《技能診斷報告》。
    
    請包含以下資訊：
    1. 【軟體辨識】員工目前主要正在使用什麼軟體或網站？
    2. 【意圖推測】根據畫面上的介面，推測員工正在進行什麼工作任務？
    3. 【教練建議】針對畫面上的操作，有沒有什麼提高效率的建議？(例如使用快捷鍵、或是提醒專心等)
    
    請以專業、鼓勵的繁體中文語氣回答。
    """
    
    # Vertex AI 需要特定格式的圖片輸入
    import io
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG')
    image_part = Part.from_data(data=img_byte_arr.getvalue(), mime_type="image/jpeg")
    
    response = model.generate_content([prompt, image_part])
    print("\n" + "="*40)
    print("📊 《技能診斷報告》")
    print("="*40)
    print(response.text)

if __name__ == "__main__":
    print("🚀 雲端 OTJ Coach Agent - POC 啟動")
    print("準備在 3 秒後擷取您的螢幕畫面，請切換到您平常工作的視窗！")
    time.sleep(3)
    
    screenshot = capture_screen()
    analyze_screen(screenshot)
