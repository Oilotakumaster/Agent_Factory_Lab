import os
import sys
from google import genai
from google.genai import types

sys.stdout.reconfigure(encoding='utf-8')

# ==========================================
# 🛑 使用 VERTEX AI TEST 專案設定區塊
# ==========================================
# ⚠️ 請將這裡替換成您「VERTEX AI TEST PROJECT」的實際專案 ID (Project ID)
PROJECT_ID = "vertex-ai-test-493513"  
LOCATION = "us-central1"

# ⚠️ 請輸入您的「VERTEX AI TEST」服務帳戶 (Service Account) 所匯出的 JSON 金鑰路徑
SERVICE_ACCOUNT_JSON = "vertex-ai-test-key.json"

def generate_image_agent():
    print("🤖 歡迎使用 Gemini Banana Flash (Gemini 3.1 Flash Image) 生圖代理 Agent")
    print("========================================")
    
    # 透過設定環境變數來使用指定的 JSON 金鑰支付費用與授權
    if not os.path.exists(SERVICE_ACCOUNT_JSON):
        print(f"⚠️ 找不到憑證檔案: {SERVICE_ACCOUNT_JSON}")
        print("請確定您已經將 Vertex AI 的 Service Account JSON 金鑰放置於正確路徑，並修改程式碼中的 SERVICE_ACCOUNT_JSON 變數。")
    
    # 設定環境變數供 Google SDK 使用
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_ACCOUNT_JSON
    
    try:
        # 初始化 Google GenAI Client (Vertex AI 模式)
        client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
    except Exception as e:
        print(f"⚠️ 初始化失敗: {e}")
        return

    # ==========================================
    # ⚠️ 模型已被替換為 Imagen 3 
    # ==========================================
    # 因為您的專案目前尚未取得 Gemini Banana Flash (gemini-3.1-flash-image-preview) 的白名單造訪權限
    # 執行時會報錯 404 NOT FOUND，因此已為您預設改回開放的高畫質生圖模型 Imagen 3。
    model_name = "imagen-3.0-generate-001"
    
    while True:
        prompt = input("\n請輸入您想生成的圖片描述 (輸入 'q' 退出): ")
        if prompt.lower() in ['q', 'quit', 'exit']:
            print("再見！")
            break
            
        if not prompt.strip():
            continue
            
        print(f"🎨 正在請求 {model_name} 為您生成圖片，請稍候...")
        try:
            # 呼叫 Imagen 3 的 API 用法
            response = client.models.generate_images(
                model=model_name,
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    output_mime_type="image/jpeg",
                    aspect_ratio="1:1"
                )
            )
            
            # 從回應中提取圖片位元組並存檔
            if response.generated_images:
                output_file = "generated_output.jpg"
                with open(output_file, "wb") as f:
                    f.write(response.generated_images[0].image.image_bytes)
                print(f"✅ 成功！圖片已儲存至目前目錄的: {output_file}")
            else:
                print("❌ 伺服器回傳成功，但未包含圖片資料。")
                
        except Exception as e:
            print(f"❌ 生成失敗，錯誤訊息: {e}")

if __name__ == "__main__":
    generate_image_agent()
