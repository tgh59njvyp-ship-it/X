import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wand2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { CustomButtonConfig } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyConfig: (generated: Partial<CustomButtonConfig>) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyConfig,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate-button', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'AI生成に失敗しました');
      }

      const generated = data.data;
      onApplyConfig({
        title: generated.title || 'AI作成ボタン',
        description: generated.description || '',
        buttonText: generated.buttonText || '𝕏 ポストする',
        mode: generated.mode === 'single' ? 'single' : 'random',
        outcomes: generated.outcomes || ['AIで生成されたテキスト'],
        hashtags: generated.hashtags || ['AIボタン'],
        targetUrl: generated.targetUrl || '',
        colorScheme: generated.colorScheme || 'purple',
        icon: generated.icon || 'Sparkles',
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI生成中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    '猫好きのための今日の挨拶ボタン',
    'エンジニアの作業進捗報告と自分への言い訳ガチャ',
    'ゲームの今日の勝率・戦績報告ボタン',
    '今日頑張った自分を全力で褒めるボタン',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-6 md:p-8 relative text-slate-900 dark:text-slate-100"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
              <Wand2 className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold">AI ボタン作成アシスタント</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            どんなボタンを作りたいかアイデアを入力すると、Gemini AIがタイトル・ボタン文字・ランダム出力テキスト・ハッシュタグを自動生成します！
          </p>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                作成したいボタンのテーマ・テーマキーワード
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例: 「毎日の勉強報告用ボタン」「今日のラッキーおやつガチャ」など"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Quick Prompts */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                💡 アイデア例をクリック:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 dark:bg-slate-800 dark:hover:bg-purple-900/30 dark:text-slate-300 dark:hover:text-purple-300 transition-colors text-left cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gemini AIが生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AIでボタン案を自動作成する
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
