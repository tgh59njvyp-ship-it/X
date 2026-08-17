import React from 'react';
import { CardBgStyle } from '../types';

export interface CardBgStyleResult {
  className: string;
  style?: React.CSSProperties;
  isDark: boolean;
}

export const getCardBgStyleObj = (
  style?: CardBgStyle,
  customColor?: string
): CardBgStyleResult => {
  if (style === 'custom' && customColor) {
    return {
      className: 'border border-slate-300 dark:border-slate-700 shadow-xl',
      style: { backgroundColor: customColor },
      isDark: false,
    };
  }

  switch (style) {
    case 'white':
      return {
        className: 'bg-white text-slate-900 border border-slate-200 shadow-xl',
        isDark: false,
      };
    case 'slate':
      return {
        className: 'bg-slate-100 text-slate-900 border border-slate-300 shadow-xl',
        isDark: false,
      };
    case 'sunset':
      return {
        className: 'bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 text-white border border-rose-400/50 shadow-xl',
        isDark: true,
      };
    case 'sakura':
      return {
        className: 'bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 text-slate-900 border border-pink-300 shadow-xl',
        isDark: false,
      };
    case 'mint':
      return {
        className: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 text-slate-900 border border-teal-300 shadow-xl',
        isDark: false,
      };
    case 'cyber':
      return {
        className: 'bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white border border-purple-800/60 shadow-2xl',
        isDark: true,
      };
    case 'dark':
    default:
      return {
        className: 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-800 shadow-2xl',
        isDark: true,
      };
  }
};
