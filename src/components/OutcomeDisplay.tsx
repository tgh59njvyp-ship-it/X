import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Copy, Check, RefreshCw, Share2, Sparkles, Globe } from 'lucide-react';
import { CustomButtonConfig } from '../types';
import {
  buildShareableButtonUrl,
  buildXIntentUrl,
  formatPostText,
  getShortenedUrl,
  normalizeHashtags,
} from '../utils/encoder';

interface OutcomeDisplayProps {
  config: CustomButtonConfig;
  outcomeText: string;
  userInput?: string;
  onReroll: () => void;
  onOpenShare: () => void;
}

export const OutcomeDisplay: React.FC<OutcomeDisplayProps> = ({
  config,
  outcomeText,
  userInput,
  onReroll,
  onOpenShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>('');

  const fullShareableUrl = buildShareableButtonUrl(config);

  // Auto-generate short URL when result is displayed
  useEffect(() => {
    let active = true;
    getShortenedUrl(config).then((res) => {
      if (active && res) {
        setShortUrl(res);
      }
    });
    return () => {
      active = false;
    };
  }, [config]);

  // Format full post content using standard formatPostText
  const postBody = formatPostText(config, outcomeText, userInput);

  const hashtags = normalizeHashtags(config.hashtags);
  const effectiveShareUrl = shortUrl || fullShareableUrl;
  const targetUrl = config.targetUrl || effectiveShareUrl;

  // Generate official X Intent URL with attached short web link
  const xIntentUrl = buildXIntentUrl({
    text: postBody,
    hashtags,
    targetUrl: config.targetUrl,
    shareableUrl: effectiveShareUrl,
  });

  const handleCopy = async () => {
    try {
      const hashtagStr = hashtags.map((h) => `#${h}`).join(' ');
      const copyText = `${postBody}\n${hashtagStr}\n${targetUrl}`.trim();
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 my-6 text-slate-900 dark:text-slate-100 relative overflow-hidden"
    >
      {/* Background Subtle Accent */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-sky-500/10 dark:bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Outcome Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          <Sparkles className="w-3.5 h-3.5" />
          結果が出ました！
        </span>
        <button
          type="button"
          onClick={onReroll}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          もう一度引く
        </button>
      </div>

      {/* Main Revealed Result Box */}
      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 mb-6 text-base md:text-lg leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100 font-medium font-sans shadow-inner">
        {postBody}

        {/* Display Hashtags & URL attached */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5 text-xs">
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-sky-600 dark:text-sky-400 font-normal">
              {hashtags.map((tag) => (
                <span key={tag} className="bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Globe className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="text-[11px]">𝕏投稿に添えられるWebリンク:</span>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:underline truncate text-[11px] font-mono flex items-center gap-0.5"
            >
              {targetUrl}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Primary X Post Button */}
          <a
            href={xIntentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-black/20 cursor-pointer text-center"
          >
            {/* Custom X Logo SVG */}
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            𝕏 でポストする
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>

          {/* Big Screen Web Browser Button */}
          <a
            href={effectiveShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/80 text-sky-700 dark:text-sky-300 font-bold text-sm transition-all cursor-pointer shrink-0 shadow-xs"
            title="新しいタブの大画面Webブラウザで開く"
          >
            <Globe className="w-4 h-4 text-sky-500 shrink-0" />
            Web大画面で遊ぶ
          </a>
        </div>

        <div className="flex items-center gap-3">
          {/* Copy Text Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                コピー完了！
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                テキストとリンクをコピー
              </>
            )}
          </button>

          {/* Share Button Link Button */}
          <button
            type="button"
            onClick={onOpenShare}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            title="このボタンを共有・埋め込み"
          >
            <Share2 className="w-3.5 h-3.5" />
            ボタン共有・リンク発行
          </button>
        </div>
      </div>
    </motion.div>
  );
};
