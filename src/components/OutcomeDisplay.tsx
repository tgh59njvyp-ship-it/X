import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Copy, Check, RefreshCw, Share2, Sparkles } from 'lucide-react';
import { CustomButtonConfig } from '../types';
import { buildXIntentUrl, normalizeHashtags } from '../utils/encoder';

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

  // Format full post content
  let fullMessage = outcomeText;
  if (config.mode === 'input' && userInput) {
    fullMessage = fullMessage.replace('{input}', userInput).replace('{name}', userInput);
  }

  const prefix = config.prefixText ? config.prefixText.trim() + '\n' : '';
  const suffix = config.suffixText ? '\n' + config.suffixText.trim() : '';

  const postBody = `${prefix}${fullMessage}${suffix}`;

  const hashtags = normalizeHashtags(config.hashtags);
  const targetUrl = config.targetUrl || '';

  // Generate official X Intent URL
  const xIntentUrl = buildXIntentUrl({
    text: postBody,
    hashtags,
    targetUrl,
  });

  const handleCopy = async () => {
    try {
      const hashtagStr = hashtags.map((h) => `#${h}`).join(' ');
      const copyText = `${postBody}\n${hashtagStr} ${targetUrl}`.trim();
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
        {(hashtags.length > 0 || targetUrl) && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-2 text-xs text-sky-600 dark:text-sky-400 font-normal">
            {hashtags.map((tag) => (
              <span key={tag} className="bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
            {targetUrl && (
              <span className="text-slate-500 dark:text-slate-400 underline truncate max-w-xs">
                {targetUrl}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions Section */}
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

        {/* Copy Text Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              コピー完了！
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              コピー
            </>
          )}
        </button>

        {/* Share Button Link Button */}
        <button
          type="button"
          onClick={onOpenShare}
          className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors cursor-pointer shrink-0"
          title="このボタンを共有・埋め込み"
        >
          <Share2 className="w-4 h-4" />
          ボタン共有
        </button>
      </div>
    </motion.div>
  );
};
