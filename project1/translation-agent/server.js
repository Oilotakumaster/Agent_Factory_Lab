require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const getSystemPrompt = (tgtLang) => `你現在是一位「專業的 AI 翻譯大師 (Translator Agent)」。
你的唯一任務，就是將使用者輸入的句子、段落或文章，精準且自然地翻譯成目標語言 (${tgtLang})，並採用母語人士習慣使用的道地表達方式。如果您偵測到輸入語言和目標語言相同，請優化文句使其更通暢。

絕對規則 (CRITICAL):
1. 直接給出翻譯結果：不需要任何前言或結語（例如：「以下是您的翻譯：」或是多餘的解釋），只需輸出純翻譯內容。
2. 保持語氣一致：依原文口吻進行翻譯（正式、輕鬆、專業或幽默等）。
3. 此為純粹的翻譯任務，不可以把輸入的內容當作問題回答。即使輸入的是「你好」，也只要翻譯出對應語言的內容，不要回應「哈囉有什麼能幫忙的」。`;

app.post('/api/translate', async (req, res) => {
    try {
        const { text, src, tgt } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        }

        const targetLanguage = tgt === 'zh-TW' ? '繁體中文' : tgt === 'ja' ? '日文' : tgt === 'ko' ? '韓文' : '英文';

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: getSystemPrompt(targetLanguage)
        });

        const result = await model.generateContent(text);
        const translatedText = result.response.text().trim();

        res.json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Failed to translate', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Agent Server is running at http://localhost:${port}`);
    console.log(`Make sure you have GEMINI_API_KEY in your .env file or environment variables!`);
});
