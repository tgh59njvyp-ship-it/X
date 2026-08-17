import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { CustomButtonConfig } from '../types';
import { IconResolver } from './IconResolver';
import { playSound } from '../utils/audio';
import { pickRandomOutcome } from '../utils/encoder';

interface ButtonCardProps {
  config: CustomButtonConfig;
  onPress: (userInput?: string, outcomeResult?: { text: string; rarity?: string }) => void;
  isCompact?: boolean;
}

export const ButtonCard: React.FC<ButtonCardProps> = ({ config, onPress, isCompact = false }) => {
  const [userInput, setUserInput] = useState('');
  const [clickCount, setClickCount] = useState(0);

  // State for Diagnostic Quiz Mode
  const [diagStep, setDiagStep] = useState(0);
  const [selectedDiagOptions, setSelectedDiagOptions] = useState<number[]>([]);

  // State for Gacha Draw History
  const [drawHistory, setDrawHistory] = useState<Record<string, number>>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handlePress = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Play Sound Effect
    playSound(config.sound);

    // Trigger Visual Animations
    triggerAnimation(config.animation);

    let resultObj: { text: string; rarity?: string } | undefined;

    if (config.mode === 'random') {
      const picked = pickRandomOutcome(config);
      resultObj = { text: picked.text, rarity: picked.rarity };

      // Record in draw history
      const key = picked.rarity ? `[${picked.rarity}] ${picked.text}` : picked.text;
      setDrawHistory((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    }

    // Execute callback
    onPress(userInput, resultObj);
  };

  const handleSelectDiagOption = (outcomeIdx: number) => {
    const newAnswers = [...selectedDiagOptions, outcomeIdx];
    setSelectedDiagOptions(newAnswers);

    const questions = config.diagnosticQuestions || [];
    if (diagStep + 1 < questions.length) {
      setDiagStep((prev) => prev + 1);
    } else {
      // Diagnostic completed! Determine outcome
      playSound(config.sound);
      triggerAnimation(config.animation);

      // Simple calculation: pick the outcomeIndex of the last answer or most frequent answer
      const finalOutcomeIdx = outcomeIdx % (config.outcomes.length || 1);
      const chosenOutcome = config.outcomes[finalOutcomeIdx] || config.outcomes[0] || '診断結果完了！';

      onPress(userInput, { text: chosenOutcome });

      // Reset diagnostic state
      setDiagStep(0);
      setSelectedDiagOptions([]);
    }
  };

  const triggerAnimation = (anim: CustomButtonConfig['animation']) => {
    if (typeof window === 'undefined') return;

    try {
      if (anim === 'confetti') {
        confetti({
          particleCount: 90,
          spread: 80,
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
          particleCount: 50,
          scalar: 1.2,
          shapes: ['circle'],
        });
      } else if (anim === 'sparkles' || anim === 'stars') {
        confetti({
          particleCount: 80,
          spread: 120,
          startVelocity: 45,
          colors: ['#38bdf8', '#c084fc', '#fde047', '#f43f5e'],
          shapes: ['star', 'circle'],
        });
      } else if (anim === 'fireworks' || anim === 'fire') {
        const count = 220;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f97316', '#ef4444', '#eab308'] });
        fire(0.2, { spread: 60, colors: ['#ef4444', '#dc2626'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#eab308', '#f97316'] });
      } else if (anim === 'snow') {
        confetti({
          particleCount: 80,
          spread: 120,
          startVelocity: 15,
          ticks: 150,
          origin: { y: 0.2 },
          colors: ['#ffffff', '#e0f2fe', '#bae6fd'],
        });
      } else if (anim === 'bounce') {
        confetti({
          particleCount: 40,
          spread: 60,
          startVelocity: 25,
          colors: ['#a855f7', '#ec4899'],
        });
      }
    } catch (e) {
      console.warn('Animation error:', e);
    }
  };

  // Color & Background mappings
  const getColorClasses = () => {
    if (config.colorScheme === 'custom') {
      return ''; // Inline styles handled below
    }

    switch (config.colorScheme) {
      case 'sunset':
        return 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500';
      case 'neon':
        return 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400';
      case 'sakura':
        return 'bg-gradient-to-r from-pink-500 via-rose-400 to-fuchsia-500';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600';
      case 'dark':
        return 'bg-slate-900 border border-slate-700';
      case 'gold':
        return 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600';
      case 'mint':
        return 'bg-gradient-to-r from-teal-400 via-emerald-300 to-green-500';
      case 'rainbow':
        return 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient-x';
      case 'cyber':
        return 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500';
      case 'blue':
      default:
        return 'bg-sky-500 hover:bg-sky-600';
    }
  };

  // Text color mappings
  const getTextColorStyle = (): { className: string; style?: React.CSSProperties } => {
    if (config.textColor === 'custom' && config.customTextColor) {
      return { className: '', style: { color: config.customTextColor } };
    }

    switch (config.textColor) {
      case 'white':
        return { className: 'text-white' };
      case 'black':
        return { className: 'text-slate-950 font-bold' };
      case 'yellow':
        return { className: 'text-yellow-300 font-extrabold drop-shadow' };
      case 'cyan':
        return { className: 'text-cyan-300 font-extrabold drop-shadow' };
      case 'pink':
        return { className: 'text-pink-300 font-extrabold drop-shadow' };
      case 'gold':
        return { className: 'text-amber-300 font-extrabold drop-shadow' };
      case 'auto':
      default:
        if (config.colorScheme === 'neon' || config.colorScheme === 'gold') {
          return { className: 'text-slate-950 font-extrabold' };
        }
        return { className: 'text-white' };
    }
  };

  // Text size mappings
  const getTextSizeClasses = (size?: CustomButtonConfig['textSize']) => {
    switch (size) {
      case 'sm':
        return 'text-sm md:text-base';
      case 'lg':
        return 'text-lg md:text-xl font-bold';
      case 'xl':
        return 'text-xl md:text-2xl font-black tracking-tight';
      case 'base':
      default:
        return 'text-base md:text-lg';
    }
  };

  // Button size mappings (Button Size freedom)
  const getButtonSizeClasses = (size?: CustomButtonConfig['buttonSize']) => {
    switch (size) {
      case 'compact':
        return 'py-2.5 px-5 text-sm min-h-[44px]';
      case 'lg':
        return 'py-5 px-9 text-lg min-h-[64px]';
      case 'hero':
        return 'py-6 px-10 text-xl font-black tracking-wide min-h-[72px] scale-105';
      case 'normal':
      default:
        return 'py-4 px-8 min-h-[56px]';
    }
  };

  // Font family mappings
  const getFontFamilyClasses = (font?: CustomButtonConfig['fontFamily']) => {
    switch (font) {
      case 'rounded':
        return 'font-sans rounded-font tracking-wide';
      case 'serif':
        return 'font-serif tracking-normal';
      case 'mono':
        return 'font-mono tracking-wider';
      case 'black':
        return 'font-black uppercase tracking-tight';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  // Border style mappings
  const getBorderClasses = (border?: CustomButtonConfig['borderStyle']) => {
    switch (border) {
      case 'thin':
        return 'border border-white/40';
      case 'thick':
        return 'border-4 border-slate-900/40 dark:border-white/40';
      case 'double':
        return 'border-4 border-double border-white/80';
      case 'dashed':
        return 'border-2 border-dashed border-white/60';
      case 'neon':
        return 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]';
      case 'none':
      default:
        return '';
    }
  };

  // Shadow style mappings
  const getShadowClasses = (shadow?: CustomButtonConfig['shadowStyle']) => {
    switch (shadow) {
      case 'none':
        return 'shadow-none';
      case 'strong':
        return 'shadow-2xl shadow-black/50 hover:shadow-black/70';
      case 'glow':
        return 'shadow-lg shadow-sky-500/50 hover:shadow-sky-400/80 hover:brightness-110';
      case 'soft':
      default:
        return 'shadow-lg shadow-slate-900/20 hover:shadow-xl';
    }
  };

  // Shape mappings
  const getShapeClasses = (shape: CustomButtonConfig['shape']) => {
    switch (shape) {
      case 'pill':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg';
      case 'retro3d':
        return 'rounded-2xl border-b-4 border-slate-950/40 active:border-b-0 active:translate-y-1';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  };

  const textColorObj = getTextColorStyle();
  const diagQuestions = config.diagnosticQuestions || [];
  const currentDiagQuestion = config.mode === 'diagnostic' ? diagQuestions[diagStep] : null;

  return (
    <div className={`w-full flex flex-col items-center justify-center ${isCompact ? 'p-2' : 'p-6'}`}>
      {/* Title & Description Header */}
      {!isCompact && (
        <div className="text-center mb-6 max-w-lg flex flex-col items-center">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-1.5">
            {config.title || 'カスタムボタン'}
          </h3>

          {/* Mode Pill Badge */}
          <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60 mb-2">
            {config.mode === 'random'
              ? '🎲 ランダムガチャ'
              : config.mode === 'input'
              ? '✍️ 名前入力式'
              : config.mode === 'diagnostic'
              ? '🧠 診断クイズ'
              : '📌 固定ポスト'}
          </span>

          {config.description && (
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
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

      {/* Diagnostic Quiz Mode Interface */}
      {config.mode === 'diagnostic' && currentDiagQuestion ? (
        <div className="w-full max-w-sm mb-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-md">
          <div className="text-xs font-bold text-sky-500 mb-1">
            質問 {diagStep + 1} / {diagQuestions.length}
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            {currentDiagQuestion.question}
          </p>

          <div className="space-y-2">
            {currentDiagQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDiagOption(opt.outcomeIndex)}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-500 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-between"
              >
                <span>{opt.label}</span>
                <span className="text-sky-500">➔</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Primary Interactive Button */
        <motion.button
          type="button"
          whileHover={{ scale: config.shape === 'retro3d' ? 1 : 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePress}
          style={{
            backgroundColor:
              config.colorScheme === 'custom' ? config.customBgColor || '#38bdf8' : undefined,
            borderColor: config.customBorderColor || undefined,
            ...(textColorObj.style || {}),
          }}
          className={`relative inline-flex items-center justify-center gap-3 transition-all duration-150 cursor-pointer select-none w-full max-w-sm ${getColorClasses()} ${getShapeClasses(
            config.shape
          )} ${getButtonSizeClasses(config.buttonSize)} ${getBorderClasses(
            config.borderStyle
          )} ${getShadowClasses(config.shadowStyle)} ${getFontFamilyClasses(
            config.fontFamily
          )} ${getTextSizeClasses(config.textSize)} ${textColorObj.className} ${
            config.textGlow ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''
          }`}
        >
          <IconResolver name={config.icon} className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
          <div className="flex flex-col items-center justify-center text-center leading-snug">
            <span>{config.buttonText || 'ポチッと押す！'}</span>
            {config.subText && (
              <span className="text-[11px] opacity-85 font-normal tracking-wide mt-0.5">
                {config.subText}
              </span>
            )}
          </div>

          {/* Counter Badge if enabled */}
          {config.showCounter && clickCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-md border border-white"
            >
              {clickCount}回!
            </motion.span>
          )}
        </motion.button>
      )}

      {/* Gacha Draw History Toggle for Random Mode */}
      {!isCompact && config.mode === 'random' && clickCount > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-500 underline cursor-pointer flex items-center gap-1"
          >
            📊 ガチャ結果の試行履歴 ({clickCount}回試行)
          </button>

          {showHistoryModal && (
            <div className="mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs space-y-1 max-w-sm w-full">
              <div className="font-bold text-slate-700 dark:text-slate-300 mb-1 border-b pb-1">
                これまでのガチャ獲得履歴:
              </div>
              {Object.entries(drawHistory).map(([item, count]) => (
                <div key={item} className="flex justify-between items-center text-[11px]">
                  <span className="truncate max-w-[220px] text-slate-600 dark:text-slate-400">
                    {item}
                  </span>
                  <span className="font-bold text-sky-500">{count}回</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Overlay Pill Badge */}
      {!isCompact && config.showCardFooterBadge !== false && (
        <div className="mt-6 flex items-center justify-center sm:justify-start w-full">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-semibold bg-slate-800/85 text-slate-100 shadow-md border border-slate-700/80 backdrop-blur-xs">
            <span className="truncate max-w-[200px]">{config.title || 'カスタムボタン'}</span>
            <span className="opacity-50">|</span>
            <span className="opacity-90 text-[11px] font-normal">みんなのボタンメーカー</span>
          </span>
        </div>
      )}
    </div>
  );
};

