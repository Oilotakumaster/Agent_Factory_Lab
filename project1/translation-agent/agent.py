import os
import google.generativeai as genai

# 1. 初始化與設定 API Key
# 請確保您有設定名為 GEMINI_API_KEY 的環境變數，或直接將 key 填入下方
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("⚠️ 警告：找不到 GEMINI_API_KEY 環境變數。")
    print("請先設定環境變數，或在程式碼中修改替換 API Key。")
    exit(1)

genai.configure(api_key=api_key)

# 2. 定義 Agent 的大腦 (載入我們剛剛在 SKILL.md 裡寫的核心規則)
SYSTEM_PROMPT = """你現在是一位「專業的中英翻譯大師 (ZH-EN Translator Agent)」。
你的唯一任務，就是將使用者輸入的中文句子、段落或文章，精準且自然地翻譯成母語人士習慣使用的英文。

絕對規則 (CRITICAL):
1. 直接給出翻譯結果：不需要任何前言或結語（例如：「以下是您的翻譯：」或是多餘的解釋），只需輸出純英文內容。
2. 保持語氣一致：依原文口吻進行翻譯（正式、輕鬆、專業或幽默等）。
3. 此為純粹的翻譯任務，不可以把輸入的內容當作問題回答。即使輸入的是「你好」，也只要翻譯出「Hello」，不要回應「哈囉有什麼能幫忙的」。
"""

def translate_agent(user_text):
    # 建立模型實例並賦予其 "系統提示詞" (System Instruction)
    # 使用 gemini-1.5-flash，速度快且對應基礎任務足夠聰明
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        system_instruction=SYSTEM_PROMPT
    )
    
    # 向模型發送使用者輸入
    response = model.generate_content(user_text)
    return response.text.strip()

# 3. 執行介面 (Terminal 互動)
if __name__ == "__main__":
    print("=" * 50)
    print("✨ 中英翻譯 Agent (Python 版本) 已啟動 ✨")
    print("=" * 50)
    print("💡 提示: 隨時輸入 'quit' 或 'exit' 來退出程式\n")
    
    while True:
        try:
            text_to_translate = input("請問您想要翻譯什麼中文內容？\n👤 您：")
            
            if text_to_translate.strip().lower() in ['quit', 'exit']:
                print("\n翻譯 Agent 關閉，祝您開發順利！👋")
                break
                
            if not text_to_translate.strip():
                continue
                
            print("🤖 Agent 思考中...")
            
            # 呼叫 Agent 進行翻譯
            result = translate_agent(text_to_translate)
            
            print(f"📖 翻譯結果：\n{result}\n")
            print("-" * 50)
            
        except KeyboardInterrupt:
           print("\n\n翻譯 Agent 強制關閉。👋")
           break
        except Exception as e:
           print(f"\n❌ 翻譯發生錯誤：{e}\n")
