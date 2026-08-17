import React from 'react';
import { motion } from 'motion/react';
import { Play, Edit3, Sparkles } from 'lucide-react';
import { PRESET_TEMPLATES } from '../data/presets';
import { CustomButtonConfig } from '../types';
import { ButtonCard } from './ButtonCard';

interface GalleryViewProps {
  onSelectPlay: (config: CustomButtonConfig) => void;
  onSelectRemix: (config: CustomButtonConfig) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onSelectPlay, onSelectRemix }) => {
  return (
    <div className="space-y-8">
      {/* Gallery Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
          <Sparkles className="w-3.5 h-3.5" />
          人気のテンプレート集
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          すぐに遊べる＆作れるボタンギャラリー
        </h2>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
          人気のボタンテンプレートを選んでそのまま遊ぶか、アレンジしてオリジナルボタンを作れます！
        </p>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRESET_TEMPLATES.map((tmpl) => {
          const fullConfig: CustomButtonConfig = {
            ...tmpl.config,
            id: tmpl.id,
            createdAt: Date.now(),
          };

          return (
            <motion.div
              key={tmpl.id}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between overflow-hidden relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {tmpl.category}
                  </span>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg">
                    {tmpl.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                  {tmpl.description}
                </p>

                {/* Preview Mini Button */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-6 flex justify-center pointer-events-none">
                  <ButtonCard config={fullConfig} onPress={() => {}} isCompact />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onSelectPlay(fullConfig)}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  遊んでみる
                </button>
                <button
                  type="button"
                  onClick={() => onSelectRemix(fullConfig)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  アレンジして作る
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
