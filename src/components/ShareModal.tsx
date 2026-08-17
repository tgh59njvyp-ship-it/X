import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Code2, Link, FileText, QrCode } from 'lucide-react';
import { CustomButtonConfig } from '../types';
import { buildShareableButtonUrl } from '../utils/encoder';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomButtonConfig;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, config }) => {
  const [copiedType, setCopiedType] = useState<'url' | 'iframe' | 'markdown' | null>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'markdown'>('link');

  if (!isOpen) return null;

  const shareUrl = buildShareableButtonUrl(config);
  const iframeCode = `<iframe src="${shareUrl}" width="100%" height="320" style="border:none; border-radius:16px; overflow:hidden;" title="${config.title}"></iframe>`;
  const markdownCode = `[𝕏 ${config.buttonText}](${shareUrl})`;

  const handleCopy = async (text: string, type: 'url' | 'iframe' | 'markdown') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
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
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  共有用URL (誰でもこのボタンを遊べます)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(shareUrl, 'url')}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {copiedType === 'url' ? (
                      <>
                        <Check className="w-4 h-4" /> コピー済
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> コピー
                      </>
                    )}
                  </button>
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
