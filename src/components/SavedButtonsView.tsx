import React from 'react';
import { motion } from 'motion/react';
import { Play, Edit3, Share2, Copy, Trash2, Plus, Sparkles } from 'lucide-react';
import { CustomButtonConfig } from '../types';
import { ButtonCard } from './ButtonCard';

interface SavedButtonsViewProps {
  savedButtons: CustomButtonConfig[];
  onPlay: (config: CustomButtonConfig) => void;
  onEdit: (config: CustomButtonConfig) => void;
  onShare: (config: CustomButtonConfig) => void;
  onDuplicate: (config: CustomButtonConfig) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

export const SavedButtonsView: React.FC<SavedButtonsViewProps> = ({
  savedButtons,
  onPlay,
  onEdit,
  onShare,
  onDuplicate,
  onDelete,
  onCreateNew,
}) => {
  if (savedButtons.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          まだ作成したボタンがありません
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          あなただけのオリジナルのX(Twitter)ボタンを作成してみましょう！「新規ボタンを作る」から簡単に1分で作成できます。
        </p>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors cursor-pointer shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          新規ボタンを作る
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            💾 作成したボタン ({savedButtons.length}件)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            お使いのブラウザに保存されているあなたが作ったボタン一覧です。
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          新しいボタンを追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedButtons.map((cfg) => (
          <motion.div
            key={cfg.id}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {new Date(cfg.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {cfg.mode === 'random' ? '🎲 ランダム' : cfg.mode === 'input' ? '✍️ 入力型' : '📌 固定'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {cfg.title}
              </h3>
              {cfg.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {cfg.description}
                </p>
              )}

              {/* Preview Button */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 mb-4 flex justify-center pointer-events-none">
                <ButtonCard config={cfg} onPress={() => {}} isCompact />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPlay(cfg)}
                  className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  遊ぶ
                </button>
                <button
                  type="button"
                  onClick={() => onShare(cfg)}
                  className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="共有リンク"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  共有
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(cfg)}
                  className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="編集"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  編集
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => onDuplicate(cfg)}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  複製
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(cfg.id)}
                  className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  削除
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
