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

// Short URL Persistence Store
const SHORT_URLS_FILE = path.join(process.cwd(), 'short_urls.json');
let shortUrlsMap = new Map<string, any>();

function loadShortUrls() {
  try {
    if (fs.existsSync(SHORT_URLS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SHORT_URLS_FILE, 'utf-8'));
      Object.entries(data).forEach(([key, val]) => {
        shortUrlsMap.set(key, val);
      });
    }
  } catch (e) {
    console.error('Failed to load short URLs file:', e);
  }
}

function saveShortUrls() {
  try {
    const obj: Record<string, any> = {};
    shortUrlsMap.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(SHORT_URLS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save short URLs file:', e);
  }
}

function generateShortKey(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

loadShortUrls();

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

  // Short URL Creator API
  app.post('/api/shorten', (req, res) => {
    try {
      const { config, btnData, longUrl } = req.body;
      let finalBtnData = btnData;

      if (!finalBtnData && config) {
        // Encode config if passed
        const jsonStr = JSON.stringify(config);
        const encodedBytes = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        );
        finalBtnData = Buffer.from(encodedBytes).toString('base64');
      }

      if (!finalBtnData && longUrl) {
        const match = longUrl.match(/btn=([^&#]+)/);
        if (match) {
          finalBtnData = match[1];
        } else {
          finalBtnData = longUrl;
        }
      }

      if (!finalBtnData) {
        return res.status(400).json({ success: false, error: 'Data is required' });
      }

      // Check if short key already exists
      for (const [key, val] of shortUrlsMap.entries()) {
        if (val.btnData === finalBtnData) {
          const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
          const protocol = req.headers['x-forwarded-proto'] || 'https';
          return res.json({
            success: true,
            shortKey: key,
            shortUrl: `${protocol}://${host}/b/${key}`,
          });
        }
      }

      let shortKey = generateShortKey();
      while (shortUrlsMap.has(shortKey)) {
        shortKey = generateShortKey();
      }

      shortUrlsMap.set(shortKey, {
        btnData: finalBtnData,
        config: config || null,
        createdAt: new Date().toISOString(),
      });
      saveShortUrls();

      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const shortUrl = `${protocol}://${host}/b/${shortKey}`;

      return res.json({
        success: true,
        shortKey,
        shortUrl,
      });
    } catch (err: any) {
      console.error('Error in /api/shorten:', err);
      return res.status(500).json({ success: false, error: 'Shortening failed' });
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
      let preloadedBtnData = '';

      // Check if URL matches short route /b/:id
      const shortMatch = req.path.match(/^\/b\/([a-zA-Z0-9]+)$/);
      if (shortMatch) {
        const shortKey = shortMatch[1];
        const entry = shortUrlsMap.get(shortKey);
        if (entry) {
          preloadedBtnData = entry.btnData;
          const config = entry.config || decodeBtnParam(entry.btnData);
          if (config && config.title) {
            pageTitle = `${config.title} | X Post Button Maker`;
            if (config.description) {
              pageDesc = config.description;
            } else if (config.outcomes && config.outcomes.length > 0) {
              pageDesc = `「${config.title}」を押して結果を𝕏にポストしよう！`;
            }
          }
        }
      } else if (req.query.btn && typeof req.query.btn === 'string') {
        preloadedBtnData = req.query.btn;
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

      if (preloadedBtnData) {
        const injectedScript = `<script>window.__PRELOADED_BTN_DATA__="${preloadedBtnData}";</script>`;
        html = html.replace('</head>', `${injectedScript}</head>`);
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
