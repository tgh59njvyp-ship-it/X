import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Button Creator Helper API
  app.post('/api/ai/generate-button', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `ユーザーのリクエストに基づいて、X(Twitter)投稿用のインタラクティブなボタンの構成案を作成してください。

ユーザーのリクエスト: "${prompt}"

出力は必ず以下のJSON形式に従ってください:
{
  "title": "ボタンのタイトル (例: 今日の運勢ガチャ)",
  "description": "ボタンの説明文 (例: ボタンを押して今日のラッキー運勢を占おう！)",
  "buttonText": "ボタンのラベル (例: 𝕏 運勢を引く！)",
  "mode": "random" などのモード ("random" または "single"),
  "outcomes": [
    "投稿文1 (大吉！今日は最高の成果が得られる日✨)",
    "投稿文2 (中吉！美味しいランチを食べると運気UP🍔)",
    "投稿文3 (小吉！焦らずマイペースに進めよう☕)"
  ],
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2"],
  "targetUrl": "付属させたいURL (空文字可)",
  "colorScheme": "blue" (blue, sunset, neon, sakura, emerald, dark, gold, purple から選択),
  "icon": "Sparkles" (Sparkles, Heart, Star, Flame, Coffee, Gamepad, Gift, Dice, Trophy, Zap から選択)
}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              buttonText: { type: Type.STRING },
              mode: { type: Type.STRING },
              outcomes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              targetUrl: { type: Type.STRING },
              colorScheme: { type: Type.STRING },
              icon: { type: Type.STRING },
            },
            required: ['title', 'description', 'buttonText', 'outcomes', 'hashtags'],
          },
        },
      });

      const text = response.text || '{}';
      const data = JSON.parse(text);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'AI生成に失敗しました。',
      });
    }
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
