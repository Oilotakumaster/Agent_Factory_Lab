import asyncio
from playwright.async_api import async_playwright
import argparse
import os
import re

async def generate_and_download_image(prompt, output_filename, user_data_dir="./chrome_profile"):
    print("啟動 Google Flow 自動化 Agent...")
    async with async_playwright() as p:
        # 使用 persistent context 來保留登入狀態 (非常重要，可以避免每次都被 Google 阻擋)
        # headless=False 讓你可以看到瀏覽器畫面，第一次使用時方便手動登入
        browser = await p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=False,
            channel="msedge", # 使用本機內建的 Microsoft Edge，避免需要下載百 MB 的核心
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        page = browser.pages[0] if browser.pages else await browser.new_page()
        
        print("前往 Google Flow...")
        await page.goto("https://labs.google/fx/zh/tools/flow")
        
        print("等待頁面載入... (如果你是第一次執行，請在瀏覽器中手動登入 Google 帳號)")
        # 給予一點緩衝時間讓頁面載入，或是讓使用者有機會登入
        await page.wait_for_timeout(5000) 
        
        # 0. 處理首頁的「新建項目」按鈕
        print("檢查是否在專案列表頁面...")
        try:
            # 尋找畫面上是否有「+ 新建項目」或類似的按鈕
            new_project_btn = page.locator("text=新建项目").first
            # 若沒找到簡體，也找繁體或英文
            if not await new_project_btn.is_visible(timeout=3000):
                new_project_btn = page.locator("text=新建項目, text=New Project").first

            if await new_project_btn.is_visible(timeout=2000):
                print("找到『新建項目』按鈕，正在點擊進入生圖主介面...")
                await new_project_btn.click()
                await page.wait_for_timeout(3000) # 等待編輯器載入
        except Exception as e:
            print("沒有看到新建項目的按鈕，可能已經在編輯器內，繼續執行...")
        
        # 1. 輸入 Prompt
        print(f"準備輸入 Prompt: {prompt}")
        try:
            # 尋找文字輸入框 (通常是 textarea 或 contenteditable div)
            # 加上 :not(.g-recaptcha-response) 來避開隱藏的機器人驗證欄位
            # 並使用 Playwright 內建的 visible 屬性過濾，確保我們選到的是真的畫面上的輸入框
            # 嘗試使用更廣泛的選擇器尋找輸入框
            # 尋找包含 textbox 屬性、textarea 或 contenteditable 的元素
            input_boxes = page.locator('textarea:not(.g-recaptcha-response), [contenteditable="true"], [role="textbox"]')
            
            # 等待輸入框出現
            await input_boxes.locator('visible=true').first.wait_for(state="visible", timeout=30000)
            input_box = input_boxes.locator('visible=true').first
            
            # 使用 Playwright 的 fill 填寫，如果失敗則改用按鍵模擬
            await input_box.focus()
            await page.keyboard.type(prompt)
        except Exception as e:
            print(f"找不到輸入框或輸入失敗: {e}")
            print("📸 正在擷取錯誤畫面以供除錯...")
            await page.screenshot(path="error_screenshot.png", full_page=True)
            print("畫面已儲存為 error_screenshot.png，請提供給我看看畫面卡在哪裡！")
            await browser.close()
            return
            
        # 準備下載按鈕的選擇器 (涵蓋各種可能的寫法)
        download_locator = page.locator(
            "button:has-text('Download'), button:has-text('下載'), "
            "[aria-label*='Download' i], [aria-label*='下載'], "
            "[title*='Download' i], [title*='下載']"
        )
        # 紀錄送出前，畫面上已經有幾個下載按鈕 (避開舊專案的干擾)
        initial_dl_count = await download_locator.count()
        print(f"目前畫面上已存在 {initial_dl_count} 個下載按鈕。")

        # 2. 點擊生成按鈕
        print("點擊生成按鈕...")
        try:
            # 尋找包含生成/建立相關字眼的按鈕，將 button 改為廣泛的標籤，並擴充文字
            generate_btn = page.locator("button, [role='button']", has_text=re.compile(r"Create|Generate|建立|生成|执行|送出|Submit|Run", re.IGNORECASE)).first
            
            if await generate_btn.is_visible(timeout=5000):
                await generate_btn.click()
            else:
                print("畫面上找不到帶有文字的生成按鈕，嘗試使用快捷鍵 (Ctrl+Enter) 送出...")
                await input_box.focus()
                await page.keyboard.press("Control+Enter")
                await page.wait_for_timeout(500)
                await page.keyboard.press("Enter") # 順便試試看純 Enter
        except Exception as e:
            print(f"找不到生成按鈕或點擊失敗: {e}")
            print("📸 正在擷取錯誤畫面...")
            await page.screenshot(path="error_generate.png", full_page=True)
            print("畫面已儲存為 error_generate.png！")
            await browser.close()
            return
            
        # 3. 智能等待與點擊圖片
        print("等待圖片生成中 (固定等待 45 秒，讓模型有充足時間運算)...")
        await page.wait_for_timeout(45000)
        
        try:
            print("正在畫面中尋找生成的圖片...")
            # 掃描畫面上所有的 img 標籤
            img_locators = page.locator("img")
            target_img = None
            
            # 找出畫面上尺寸大於 200x200 的圖片 (用來過濾掉頭像、Logo等小圖)
            for i in range(await img_locators.count()):
                img = img_locators.nth(i)
                box = await img.bounding_box()
                if box and box['width'] > 200 and box['height'] > 200:
                    target_img = img
                    
            if not target_img:
                raise Exception("畫面上找不到任何大張圖片，可能生圖失敗了。")
                
            print("找到圖片！點擊開啟預覽...")
            await target_img.click()
            await page.wait_for_timeout(2000) # 等待預覽浮窗彈出
            
            print("準備下載...")
            async with page.expect_download(timeout=30000) as download_info:
                # 在預覽窗中尋找下載按鈕 (加入簡體中文「下载」)
                download_locator = page.locator(
                    "button:has-text('Download'), button:has-text('下載'), button:has-text('下载'), "
                    "[aria-label*='Download' i], [aria-label*='下載'], [aria-label*='下载'], "
                    "[title*='Download' i], [title*='下載'], [title*='下载']"
                )
                
                if await download_locator.count() > 0:
                    await download_locator.first.click(force=True)
                else:
                    # 如果還是找不到實體按鈕，可能是純圖示。這邊做一個備案：使用 JavaScript 直接觸發右鍵另存的功能
                    print("找不到下載按鈕！嘗試透過腳本強制作圖...")
                    img_src = await target_img.get_attribute("src")
                    if img_src:
                        await page.evaluate(f'''(url) => {{
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'download.png';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }}''', img_src)
                    else:
                        raise Exception("無法取得圖片網址。")

                # Google Flow 可能會跳出選單問你要下載一般畫質還是 4K 高畫質
                try:
                    hq_btn = page.locator("button, div[role='button']", has_text=re.compile(r"高畫質|高清|4K|High-Resolution", re.IGNORECASE)).first
                    if await hq_btn.is_visible(timeout=3000):
                        print("選擇高畫質下載...")
                        await hq_btn.click()
                except:
                    pass # 沒有跳出選項就繼續
            
            download = await download_info.value
            
            # 處理儲存路徑 (自動放進 picture 資料夾)
            picture_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "picture")
            os.makedirs(picture_dir, exist_ok=True)
            output_path = os.path.join(picture_dir, os.path.basename(output_filename))
            
            print(f"圖片正在儲存至: {output_path}")
            await download.save_as(output_path)
            print("✅ 下載完成！")
            
        except Exception as e:
            print(f"等待生圖或下載過程中發生錯誤: {e}")
            print("📸 正在擷取錯誤畫面以供除錯...")
            await page.screenshot(path="error_download.png", full_page=True)
            print("畫面已儲存為 error_download.png！")
            
        # 等待一下再關閉瀏覽器
        await page.wait_for_timeout(3000)
        await browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Google Flow 自動生圖 Agent")
    parser.add_argument("-p", "--prompt", type=str, required=True, help="要生成的圖片提示詞 (Prompt)")
    parser.add_argument("-o", "--output", type=str, required=True, help="儲存的圖片檔名 (例如: my_image.png)")
    parser.add_argument("--profile", type=str, default="./chrome_profile", help="Chrome 使用者設定檔路徑 (用於保存登入狀態)")
    
    args = parser.parse_args()
    
    asyncio.run(generate_and_download_image(args.prompt, args.output, args.profile))
