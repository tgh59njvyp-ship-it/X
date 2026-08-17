import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { CustomButtonConfig } from '../types';
import { IconResolver } from './IconResolver';
import { playSound } from '../utils/audio';

interface ButtonCardProps {
  config: CustomButtonConfig;
  onPress: (userInput?: string) => void;
  isCompact?: boolean;
}

export const ButtonCard: React.FC<ButtonCardProps> = ({ config, onPress, isCompact = false }) => {
  const [userInput, setUserInput] = useState('');
  const [isPressing, setIsPressing] = useState(false);

  const handlePress = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 200);

    // Play Sound Effect
    playSound(config.sound);

    // Trigger Visual Animations
    triggerAnimation(config.animation);

    // Execute callback
    onPress(userInput);
  };

  const triggerAnimation = (anim: CustomButtonConfig['animation']) => {
    if (typeof window === 'undefined') return;

    try {
      if (anim === 'confetti') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#ec4899', '#eab308', '#10b981', '#a855f7'],
        });
      } else if (anim === 'hearts') {
        const defaults = {
          spread: 360,
          ticks: 100,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
          colors: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af'],
        };
        confetti({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          shapes: ['circle'],
        });
      } else if (anim === 'sparkles') {
        confetti({
          particleCount: 50,
          spread: 100,
          startVelocity: 40,
          colors: ['#38bdf8', '#c084fc', '#fde047'],
        });
      }
    } catch (e) {
      console.warn('Animation error:', e);
    }
  };

  // Color mappings
  const getColorClasses = (scheme: CustomButtonConfig['colorScheme']) => {
    switch (scheme) {
      case 'sunset':
        return 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-105';
      case 'neon':
        return 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:brightness-105';
      case 'sakura':
        return 'bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:brightness-105';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-105';
      case 'dark':
        return 'bg-slate-900 border border-slate-700 text-slate-100 shadow-xl shadow-slate-900/40 hover:bg-slate-800 hover:border-slate-600';
      case 'gold':
        return 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60 hover:brightness-105';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:brightness-105';
      case 'blue':
      default:
        return 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50';
    }
  };

  // Shape mappings
  const getShapeClasses = (shape: CustomButtonConfig['shape']) => {
    switch (shape) {
      case 'pill':
        return 'rounded-full px-8 py-4';
      case 'square':
        return 'rounded-lg px-6 py-4';
      case 'retro3d':
        return 'rounded-2xl px-8 py-4 border-b-4 border-slate-950/30 active:border-b-0 active:translate-y-1';
      case 'rounded':
      default:
        return 'rounded-2xl px-8 py-4';
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${isCompact ? 'p-2' : 'p-6'}`}>
      {/* Title & Description Header */}
      {!isCompact && (
        <div className="text-center mb-6 max-w-lg">
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            {config.title || 'カスタムボタン'}
          </h3>
          {config.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {config.description}
            </p>
          )}
        </div>
      )}

      {/* Input Field if mode === 'input' */}
      {config.mode === 'input' && (
        <div className="w-full max-w-sm mb-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {config.inputLabel || '入力項目:'}
          </label>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={config.inputPlaceholder || 'ここに入力してね'}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
        </div>
      )}

      {/* Primary Interactive Button */}
      <motion.button
        type="button"
        whileHover={{ scale: config.shape === 'retro3d' ? 1 : 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePress}
        className={`relative inline-flex items-center justify-center gap-3 transition-all duration-150 cursor-pointer select-none font-semibold text-base md:text-lg w-full max-w-sm ${getColorClasses(
          config.colorScheme
        )} ${getShapeClasses(config.shape)}`}
      >
        <IconResolver name={config.icon} className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
        <div className="flex flex-col items-center justify-center text-center leading-snug">
          <span>{config.buttonText || 'ポチッと押す！'}</span>
          {config.subText && (
            <span className="text-[11px] opacity-85 font-normal tracking-wide">
              {config.subText}
            </span>
          )}
        </div>
      </motion.button>
    </div>
  );
};
