import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function decodeBtnParam(btnStr: string) {
  try {
    const decodedBytes = Buffer.from(btnStr, 'base64').toString('utf-8');
    const jsonString = decodeURIComponent(
      Array.prototype.map
        .call(decodedBytes, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonString);
  } catch {
    try {
      return JSON.parse(Buffer.from(btnStr, 'base64').toString('utf-8'));
    } catch {
      return null;
    }
  }
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Serve static files from public directory if exists
  const publicPath = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }

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

  let vite: any = null;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  // HTML Page Handler with Dynamic OGP Meta Tags for X (Twitter) unfurling
  app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.match(/\.(js|css|jpg|jpeg|png|svg|ico|json|map)$/)) {
      if (vite) return vite.middlewares(req, res, next);
      return next();
    }

    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const baseUrl = `${protocol}://${host}`;
      const fullImageUrl = `${baseUrl}/og-image.jpg`;

      let pageTitle = 'X Post Button Maker – カスタム𝕏投稿ボタン＆ガチャ作成ツール';
      let pageDesc =
        '誰でも簡単に𝕏(Twitter)で遊べるオリジナルボタンやガチャ、診断クイズを作成・共有できる無料ツール！ワンタップで𝕏に投稿できます。';

      if (req.query.btn && typeof req.query.btn === 'string') {
        const config = decodeBtnParam(req.query.btn);
        if (config && config.title) {
          pageTitle = `${config.title} | X Post Button Maker`;
          if (config.description) {
            pageDesc = config.description;
          } else if (config.outcomes && config.outcomes.length > 0) {
            pageDesc = `「${config.title}」を押して結果を𝕏にポストしよう！`;
          }
        }
      }

      let html = '';
      if (process.env.NODE_ENV !== 'production' && vite) {
        const indexHtmlPath = path.join(process.cwd(), 'index.html');
        html = fs.readFileSync(indexHtmlPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
      } else {
        const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(distIndexPath)) {
          html = fs.readFileSync(distIndexPath, 'utf-8');
        } else {
          const indexHtmlPath = path.join(process.cwd(), 'index.html');
          html = fs.readFileSync(indexHtmlPath, 'utf-8');
        }
      }

      // Replace meta tags with dynamic title, description, and full image URL
      html = html
        .replace(/<title>.*?<\/title>/gi, `<title>${escapeHtml(pageTitle)}</title>`)
        .replace(
          /<meta property="og:title" content=".*?" \/>/gi,
          `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`
        )
        .replace(
          /<meta property="og:description" content=".*?" \/>/gi,
          `<meta property="og:description" content="${escapeHtml(pageDesc)}" />`
        )
        .replace(
          /<meta property="og:image" content=".*?" \/>/gi,
          `<meta property="og:image" content="${fullImageUrl}" />`
        )
        .replace(
          /<meta name="twitter:title" content=".*?" \/>/gi,
          `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`
        )
        .replace(
          /<meta name="twitter:description" content=".*?" \/>/gi,
          `<meta name="twitter:description" content="${escapeHtml(pageDesc)}" />`
        )
        .replace(
          /<meta name="twitter:image" content=".*?" \/>/gi,
          `<meta name="twitter:image" content="${fullImageUrl}" />`
        );

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (e) {
      if (vite) return vite.middlewares(req, res, next);
      next(e);
    }
  });

  if (vite) {
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
