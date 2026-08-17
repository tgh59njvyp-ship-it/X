import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Code2, Link, FileText, Zap, Loader2 } from 'lucide-react';
import { CustomButtonConfig } from '../types';
import { buildShareableButtonUrl, getShortenedUrl } from '../utils/encoder';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomButtonConfig;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, config }) => {
  const [copiedType, setCopiedType] = useState<'url' | 'short' | 'iframe' | 'markdown' | null>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'markdown'>('link');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [isShortening, setIsShortening] = useState(false);

  if (!isOpen) return null;

  const shareUrl = buildShareableButtonUrl(config);
  const activeUrl = shortUrl || shareUrl;
  const iframeCode = `<iframe src="${activeUrl}" width="100%" height="320" style="border:none; border-radius:16px; overflow:hidden;" title="${config.title}"></iframe>`;
  const markdownCode = `[𝕏 ${config.buttonText}](${activeUrl})`;

  const handleCopy = async (text: string, type: 'url' | 'short' | 'iframe' | 'markdown') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleGenerateShortUrl = async () => {
    if (shortUrl) {
      handleCopy(shortUrl, 'short');
      return;
    }
    setIsShortening(true);
    try {
      const result = await getShortenedUrl(config);
      setShortUrl(result);
      await navigator.clipboard.writeText(result);
      setCopiedType('short');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.error('Failed to shorten URL:', e);
    } finally {
      setIsShortening(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-6 md:p-8 relative text-slate-900 dark:text-slate-100"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
            🔗 ボタンを共有・埋め込み
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            作成したボタン「{config.title}」の共有リンクやWEB埋め込みコードです。
          </p>

          {/* Share Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'link'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Link className="w-4 h-4" />
              直リンク
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('embed')}
              className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'embed'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              埋め込み (HTML)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'markdown'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Markdown
            </button>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === 'link' && (
              <div className="space-y-4">
                {/* Short URL Box (Featured for X) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-purple-500/10 to-pink-500/10 border border-sky-200 dark:border-sky-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-sky-500 text-sky-500" />
                      ⚡ 𝕏投稿用 短縮URL (超ショート)
                    </span>
                    <span className="text-[10px] bg-sky-200 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 px-2 py-0.5 rounded-full font-medium">
                      𝕏文字数制限対策
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      placeholder="短縮ボタンを押すと生成されます"
                      value={shortUrl}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateShortUrl}
                      disabled={isShortening}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-sky-500/20 disabled:opacity-50"
                    >
                      {isShortening ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> 生成中...
                        </>
                      ) : copiedType === 'short' ? (
                        <>
                          <Check className="w-4 h-4" /> コピー完了！
                        </>
                      ) : shortUrl ? (
                        <>
                          <Copy className="w-4 h-4" /> 短縮コピー
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" /> 短縮URLを発行
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Regular URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    フルサイズURL (データ直接埋め込み)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(shareUrl, 'url')}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {copiedType === 'url' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> コピー済
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> コピー
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'embed' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  ブログ・WEBサイト用 iframe 埋め込みコード
                </label>
                <textarea
                  readOnly
                  rows={3}
                  value={iframeCode}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 select-all focus:outline-none resize-none mb-3"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(iframeCode, 'iframe')}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedType === 'iframe' ? (
                    <>
                      <Check className="w-4 h-4" /> 埋め込みコードをコピーしました
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> コードをコピー
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'markdown' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  GitHub / Qiita / Zenn 用 Markdown リンク
                </label>
                <input
                  type="text"
                  readOnly
                  value={markdownCode}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 select-all focus:outline-none mb-3"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(markdownCode, 'markdown')}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedType === 'markdown' ? (
                    <>
                      <Check className="w-4 h-4" /> Markdownをコピーしました
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Markdownをコピー
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>✨ どこに貼っても動くポータブルボタン仕様</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
