import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 提供靜態網頁檔案
app.use(express.static(path.join(__dirname, 'public')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("⚠️ 警告: 尚未設定 GEMINI_API_KEY 環境變數");
}

// 代理 Client 端 WebSocket 到 Google Gemini Live API
wss.on('connection', (clientWs) => {
    console.log("🟢 網頁端已連線至 Node 中繼伺服器");

    // 設定 Gemini Live API 的 WebSocket URL
    const host = 'generativelanguage.googleapis.com';
    const wsUrl = `wss://${host}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
    
    const geminiWs = new WebSocket(wsUrl);

    geminiWs.on('open', () => {
        console.log("🚀 成功連線至 Google Gemini Live API");
        
        // 連線後必須先發送 Setup 訊息
        // 註：這裡先預設使用 2.0-flash-exp (或 3.1 preview 若您的專案已獲准使用)
        const setupMsg = {
            setup: {
                model: 'models/gemini-2.0-flash-exp', 
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: "Aoede" // 可替換為 Puck, Charon, Kore 等
                            }
                        }
                    }
                }
            }
        };
        geminiWs.send(JSON.stringify(setupMsg));
    });

    // 接收來自 Gemini 的訊息 (包含語音資料)，原封不動轉發給網頁端
    geminiWs.on('message', (data) => {
        const msgStr = data.toString();
        // 為了避免印出超長音訊 Base64，我們只印出開頭的部分
        console.log("⬇️ 收到 Gemini 訊息前 200 字元:", msgStr.substring(0, 200));
        
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(msgStr);
        }
    });

    geminiWs.on('close', (code, reason) => console.log(`🔴 Gemini Live API 連線已關閉 (Code: ${code}, Reason: ${reason.toString()})`));
    geminiWs.on('error', (err) => console.error("❌ Gemini API 連線錯誤:", err));

    // 接收來自網頁端的語音/文字訊息，原封不動轉發給 Gemini
    clientWs.on('message', (data) => {
        if (geminiWs.readyState === WebSocket.OPEN) {
            geminiWs.send(data);
        }
    });

    clientWs.on('close', () => {
        console.log("網頁端斷線，關閉 Gemini 連線");
        geminiWs.close();
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`\n伺服器已啟動: http://localhost:${PORT}`);
    console.log(`WebSocket 監聽中...`);
});
