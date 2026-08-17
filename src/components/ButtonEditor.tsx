import React, { useState } from 'react';
import { Plus, Trash2, Wand2, HelpCircle, Hash, Link as LinkIcon, Palette, Volume2, Sparkles, Type, Sliders, Copy, Check } from 'lucide-react';
import {
  CustomButtonConfig,
  ColorScheme,
  ButtonShape,
  ClickAnimation,
  SoundEffect,
  PostMode,
  TextColor,
  TextSize,
  FontFamily,
  BorderStyle,
  ShadowStyle,
  CardBgStyle,
  DiagnosticQuestion,
} from '../types';
import { AVAILABLE_ICONS } from './IconResolver';
import { normalizeHashtags } from '../utils/encoder';

interface ButtonEditorProps {
  config: CustomButtonConfig;
  onChange: (updated: CustomButtonConfig) => void;
  onOpenAiAssistant: () => void;
}

export const ButtonEditor: React.FC<ButtonEditorProps> = ({
  config,
  onChange,
  onOpenAiAssistant,
}) => {
  const [hashtagInput, setHashtagInput] = useState(config.hashtags.join(', '));
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const updateField = <K extends keyof CustomButtonConfig>(
    field: K,
    value: CustomButtonConfig[K]
  ) => {
    onChange({ ...config, [field]: value });
  };

  const handleHashtagBlur = () => {
    const cleaned = normalizeHashtags(hashtagInput);
    updateField('hashtags', cleaned);
  };

  const handleOutcomeChange = (index: number, text: string) => {
    const newOutcomes = [...config.outcomes];
    newOutcomes[index] = text;
    updateField('outcomes', newOutcomes);
  };

  const handleWeightChange = (index: number, weightNum: number) => {
    const weights = config.outcomeWeights ? [...config.outcomeWeights] : config.outcomes.map(() => 1);
    weights[index] = Math.max(1, weightNum);
    updateField('outcomeWeights', weights);
  };

  const handleRarityChange = (index: number, rarityStr: string) => {
    const rarities = config.outcomeRarities ? [...config.outcomeRarities] : config.outcomes.map(() => 'NORMAL');
    rarities[index] = rarityStr;
    updateField('outcomeRarities', rarities);
  };

  const addOutcome = () => {
    const newOutcomes = [...config.outcomes, '新しいバリエーションテキスト'];
    const newWeights = config.outcomeWeights ? [...config.outcomeWeights, 1] : undefined;
    const newRarities = config.outcomeRarities ? [...config.outcomeRarities, 'NORMAL'] : undefined;

    onChange({
      ...config,
      outcomes: newOutcomes,
      outcomeWeights: newWeights,
      outcomeRarities: newRarities,
    });
  };

  const removeOutcome = (index: number) => {
    if (config.outcomes.length <= 1) return;
    const newOutcomes = config.outcomes.filter((_, i) => i !== index);
    const newWeights = config.outcomeWeights ? config.outcomeWeights.filter((_, i) => i !== index) : undefined;
    const newRarities = config.outcomeRarities ? config.outcomeRarities.filter((_, i) => i !== index) : undefined;

    onChange({
      ...config,
      outcomes: newOutcomes,
      outcomeWeights: newWeights,
      outcomeRarities: newRarities,
    });
  };

  // Helper for total weights sum
  const getTotalWeights = () => {
    if (!config.outcomeWeights || config.outcomeWeights.length !== config.outcomes.length) {
      return config.outcomes.length;
    }
    return config.outcomeWeights.reduce((sum, w) => sum + (Math.max(1, w) || 1), 0);
  };

  // Diagnostic Questions editor helpers
  const handleAddDiagnosticQuestion = () => {
    const current = config.diagnosticQuestions || [];
    const newQ: DiagnosticQuestion = {
      id: 'q_' + Date.now().toString(36),
      question: '質問本文を入力してください',
      options: [
        { label: '選択肢 A', outcomeIndex: 0 },
        { label: '選択肢 B', outcomeIndex: 1 % Math.max(1, config.outcomes.length) },
      ],
    };
    updateField('diagnosticQuestions', [...current, newQ]);
  };

  const colorSchemes: { id: ColorScheme; label: string; color: string }[] = [
    { id: 'blue', label: 'スカイ', color: 'bg-sky-500' },
    { id: 'sunset', label: 'サンセット', color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
    { id: 'neon', label: 'ネオン', color: 'bg-gradient-to-r from-cyan-400 to-emerald-400' },
    { id: 'sakura', label: 'サクラ', color: 'bg-gradient-to-r from-pink-500 to-rose-400' },
    { id: 'emerald', label: 'エメラルド', color: 'bg-emerald-500' },
    { id: 'dark', label: 'ダークナイト', color: 'bg-slate-900 border border-slate-700' },
    { id: 'gold', label: 'ゴールド', color: 'bg-gradient-to-r from-amber-300 to-yellow-500' },
    { id: 'purple', label: 'パープル', color: 'bg-gradient-to-r from-purple-600 to-indigo-600' },
    { id: 'mint', label: 'ミントグリーン', color: 'bg-gradient-to-r from-teal-400 to-green-500' },
    { id: 'rainbow', label: 'レインボー', color: 'bg-gradient-to-r from-red-500 via-green-500 to-purple-500' },
    { id: 'cyber', label: 'サイバーパンク', color: 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500' },
    { id: 'custom', label: 'カスタムカラー', color: 'bg-slate-400 border border-dashed border-slate-600' },
  ];

  const textColors: { id: TextColor; label: string; preview: string }[] = [
    { id: 'auto', label: '自動 (適正色)', preview: 'bg-slate-200 text-slate-800' },
    { id: 'white', label: 'ホワイト (白)', preview: 'bg-slate-900 text-white font-bold' },
    { id: 'black', label: 'ブラック (黒)', preview: 'bg-white text-slate-950 font-bold border' },
    { id: 'yellow', label: 'イエロー (黄)', preview: 'bg-slate-900 text-yellow-300 font-bold' },
    { id: 'cyan', label: 'ネオンシアン', preview: 'bg-slate-900 text-cyan-300 font-bold' },
    { id: 'pink', label: 'ビビッドピンク', preview: 'bg-slate-900 text-pink-300 font-bold' },
    { id: 'gold', label: 'ゴールド (金)', preview: 'bg-slate-900 text-amber-300 font-bold' },
    { id: 'custom', label: '自由カラー選択', preview: 'bg-purple-100 text-purple-700 font-bold' },
  ];

  const fontFamilies: { id: FontFamily; label: string; styleClass: string }[] = [
    { id: 'sans', label: '標準ゴシック', styleClass: 'font-sans' },
    { id: 'rounded', label: '丸ゴシック (ポップ)', styleClass: 'font-sans rounded-font' },
    { id: 'serif', label: '明朝風 (高級・和風)', styleClass: 'font-serif' },
    { id: 'mono', label: 'ドット・レトロ (Mono)', styleClass: 'font-mono' },
    { id: 'black', label: '極太インパクト', styleClass: 'font-black uppercase' },
  ];

  const textSizes: { id: TextSize; label: string }[] = [
    { id: 'sm', label: '小 (標準より小さめ)' },
    { id: 'base', label: '中 (標準)' },
    { id: 'lg', label: '大 (見やすい)' },
    { id: 'xl', label: '特大 (超インパクト)' },
  ];

  const buttonSizes: { id: 'compact' | 'normal' | 'lg' | 'hero'; label: string }[] = [
    { id: 'compact', label: 'コンパクト (小)' },
    { id: 'normal', label: '標準 (Normal)' },
    { id: 'lg', label: 'ラージ (大)' },
    { id: 'hero', label: 'ヒーロー (超特大)' },
  ];

  const borders: { id: BorderStyle; label: string }[] = [
    { id: 'none', label: '枠線なし' },
    { id: 'thin', label: '細枠線 (1px)' },
    { id: 'thick', label: '太枠線 (4px)' },
    { id: 'double', label: '二重枠線 (Double)' },
    { id: 'dashed', label: '点線 (Dashed)' },
    { id: 'neon', label: 'ネオン発光枠線' },
  ];

  const shadows: { id: ShadowStyle; label: string }[] = [
    { id: 'soft', label: '標準シャドウ (Soft)' },
    { id: 'strong', label: '強力立体シャドウ (Strong)' },
    { id: 'glow', label: 'ネオン発光 (Glow)' },
    { id: 'none', label: 'フラット (影なし)' },
  ];

  const cardBgStyles: { id: CardBgStyle; label: string; preview: string }[] = [
    { id: 'dark', label: '🌙 ダークナイト', preview: 'bg-slate-900 border border-slate-700' },
    { id: 'white', label: '☀️ クリーンホワイト', preview: 'bg-white border border-slate-300' },
    { id: 'slate', label: '🌫️ ライトスレート', preview: 'bg-slate-200 border border-slate-300' },
    { id: 'sunset', label: '🌅 夕焼けサンセット', preview: 'bg-gradient-to-r from-amber-500 to-rose-500' },
    { id: 'sakura', label: '🌸 淡いサクラピンク', preview: 'bg-pink-100 border border-pink-300' },
    { id: 'mint', label: '🌿 さわやかミント', preview: 'bg-teal-100 border border-teal-300' },
    { id: 'cyber', label: '🌌 サイバーナイト', preview: 'bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950' },
    { id: 'custom', label: '🎨 自由カスタムカラー', preview: 'bg-purple-200 border border-purple-400' },
  ];

  const shapes: { id: ButtonShape; label: string }[] = [
    { id: 'pill', label: '丸型 (Pill)' },
    { id: 'rounded', label: '角丸 (Rounded)' },
    { id: 'square', label: '四角 (Square)' },
    { id: 'retro3d', label: '3Dボタン (Retro)' },
  ];

  const animations: { id: ClickAnimation; label: string }[] = [
    { id: 'confetti', label: '🎉 クラッカー紙吹雪' },
    { id: 'hearts', label: '💖 ハート爆発' },
    { id: 'sparkles', label: '✨ キラキラ粒子' },
    { id: 'stars', label: '⭐ 星のキラめき' },
    { id: 'fireworks', label: '🎆 盛大な花火' },
    { id: 'fire', label: '🔥 激アツ爆発' },
    { id: 'snow', label: '❄️ 舞い散る雪' },
    { id: 'bounce', label: '弾む (Bounce)' },
  ];

  const sounds: { id: SoundEffect; label: string }[] = [
    { id: 'fanfare', label: '🎺 ファンファーレ' },
    { id: 'trumpet', label: '📯 トランペット' },
    { id: 'drumroll', label: '🥁 ドラムロール' },
    { id: 'magic', label: '🪄 魔法のチャイム' },
    { id: 'applause', label: '👏 歓声・拍手' },
    { id: 'pop', label: '🎈 ポップ音' },
    { id: 'coin', label: '🪙 コイン音' },
    { id: 'click', label: '🖱️ クリック音' },
    { id: 'none', label: 'ミュート (無音)' },
  ];

  const variableTags = [
    { tag: '{name}', desc: 'ユーザー入力名' },
    { tag: '{count}', desc: '累計クリック数' },
    { tag: '{date}', desc: '現在の年月日' },
    { tag: '{time}', desc: '現在の時刻' },
    { tag: '{rare}', desc: 'ガチャレア度' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg p-6 md:p-8 space-y-8 text-slate-900 dark:text-slate-100">
      {/* Header & AI Quick Generator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            ⚙️ ボタンの設定・カスタマイズ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            確率ガチャ・診断クイズ・デザイン・文字・効果音を自由自在にカスタマイズできます。
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer shrink-0"
        >
          <Wand2 className="w-4 h-4" />
          AIでボタン案を自動生成
        </button>
      </div>

      {/* Dynamic Variable Helper Chips */}
      <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 space-y-1.5">
        <div className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center justify-between">
          <span>💡 使える動的変数タグ (クリックでコピー):</span>
          <span className="text-[10px] font-normal opacity-80">前置き・後置き・結果文面で使用可能</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {variableTags.map((vt) => (
            <button
              key={vt.tag}
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(vt.tag);
                setCopiedTag(vt.tag);
                setTimeout(() => setCopiedTag(null), 1500);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 text-xs font-mono font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer"
            >
              <span>{vt.tag}</span>
              <span className="text-[10px] font-sans text-slate-500 dark:text-slate-400">
                ({vt.desc})
              </span>
              {copiedTag === vt.tag ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3 opacity-40" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Basic Info Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          1. 基本情報
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              タイトル (サイト・カード用)
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="例: 今日の運勢ガチャ"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ボタンの表示テキスト
            </label>
            <input
              type="text"
              value={config.buttonText}
              onChange={(e) => updateField('buttonText', e.target.value)}
              placeholder="例: 𝕏 今日の運勢を占う"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            説明文 (任意)
          </label>
          <input
            type="text"
            value={config.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="例: ボタンを押して今日のラッキー運勢を占おう！結果をそのままXでシェア！"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* 2. Output Mode & Content Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            2. ボタンの動作モードとポスト内容
          </h3>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold flex-wrap gap-1">
            <button
              type="button"
              onClick={() => updateField('mode', 'random')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                config.mode === 'random'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🎲 ガチャ(確率設定)
            </button>
            <button
              type="button"
              onClick={() => updateField('mode', 'single')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                config.mode === 'single'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              📌 固定メッセージ
            </button>
            <button
              type="button"
              onClick={() => updateField('mode', 'input')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                config.mode === 'input'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ✍️ 名前・テキスト入力
            </button>
            <button
              type="button"
              onClick={() => {
                updateField('mode', 'diagnostic');
                if (!config.diagnosticQuestions || config.diagnosticQuestions.length === 0) {
                  handleAddDiagnosticQuestion();
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                config.mode === 'diagnostic'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              🧠 診断クイズ
            </button>
          </div>
        </div>

        {/* Diagnostic Mode Questions Editor */}
        {config.mode === 'diagnostic' && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                🧠 診断クイズの質問と選択肢分岐設定
              </p>
              <button
                type="button"
                onClick={handleAddDiagnosticQuestion}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 質問を追加
              </button>
            </div>

            {(config.diagnosticQuestions || []).map((q, qIdx) => (
              <div key={q.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    質問 {qIdx + 1}
                  </span>
                  {(config.diagnosticQuestions || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = (config.diagnosticQuestions || []).filter((_, i) => i !== qIdx);
                        updateField('diagnosticQuestions', filtered);
                      }}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => {
                    const questions = [...(config.diagnosticQuestions || [])];
                    questions[qIdx].question = e.target.value;
                    updateField('diagnosticQuestions', questions);
                  }}
                  placeholder="質問文を入力"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                />

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500">選択肢 (結果番号の紐付け):</span>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => {
                          const questions = [...(config.diagnosticQuestions || [])];
                          questions[qIdx].options[optIdx].label = e.target.value;
                          updateField('diagnosticQuestions', questions);
                        }}
                        placeholder={`選択肢 ${optIdx + 1}`}
                        className="flex-1 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                      />
                      <span className="text-[10px] text-slate-400">➔ 結果</span>
                      <select
                        value={opt.outcomeIndex}
                        onChange={(e) => {
                          const questions = [...(config.diagnosticQuestions || [])];
                          questions[qIdx].options[optIdx].outcomeIndex = Number(e.target.value);
                          updateField('diagnosticQuestions', questions);
                        }}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 font-bold"
                      >
                        {config.outcomes.map((outText, oIdx) => (
                          <option key={oIdx} value={oIdx}>
                            #{oIdx + 1}: {outText.slice(0, 12)}...
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Mode Config */}
        {config.mode === 'input' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
            <p className="text-xs text-amber-800 dark:text-amber-300">
              💡 ボタンを押す前に、ユーザーに名前や言葉を入力してもらえます。テキスト内の <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">{'{name}'}</code> が自動置換されます。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  入力ラベル
                </label>
                <input
                  type="text"
                  value={config.inputLabel || ''}
                  onChange={(e) => updateField('inputLabel', e.target.value)}
                  placeholder="例: あなたの名前"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  プレースホルダー
                </label>
                <input
                  type="text"
                  value={config.inputPlaceholder || ''}
                  onChange={(e) => updateField('inputPlaceholder', e.target.value)}
                  placeholder="例: 山田太郎"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Outcomes List */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {config.mode === 'random'
              ? '🎲 ガチャ・結果バリエーション (確率重み＆レア度設定付き):'
              : 'ポストされるテキスト:'}
          </label>

          {config.outcomes.map((text, idx) => {
            const weight = config.outcomeWeights?.[idx] ?? 1;
            const rarity = config.outcomeRarities?.[idx] ?? 'NORMAL';
            const total = getTotalWeights();
            const pct = Math.round(((Math.max(1, weight) || 1) / total) * 100);

            return (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                    placeholder={`結果テキスト ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Optional Weight & Rarity controls for Random mode */}
                {config.mode === 'random' && (
                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                    {/* Rarity selector */}
                    <select
                      value={rarity}
                      onChange={(e) => handleRarityChange(idx, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px] font-bold bg-white dark:bg-slate-900"
                    >
                      <option value="SSR">✨ SSR</option>
                      <option value="SR">🌟 SR</option>
                      <option value="R">🔹 R</option>
                      <option value="NORMAL">⚪ Normal</option>
                    </select>

                    {/* Weight input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-semibold">重み:</span>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={weight}
                        onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                        className="w-14 px-1.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold bg-white dark:bg-slate-900 text-center"
                      />
                      <span className="text-[10px] font-bold text-sky-500 w-10 text-right">
                        {pct}%
                      </span>
                    </div>

                    {config.outcomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOutcome(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {config.mode === 'random' && (
            <button
              type="button"
              onClick={addOutcome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-sky-400 text-sky-600 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-400 dark:hover:bg-sky-950/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              結果バリエーションを追加
            </button>
          )}
        </div>

        {/* Auto open X & Counter toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                ⚡ ダイレクト𝕏投稿移動
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                押し時に投稿画面を新タブで開く
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.autoOpenX !== false}
                onChange={(e) => updateField('autoOpenX', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                🔢 回数カウンターバッジ
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                ボタン上に「〇回押されました」を表示
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.showCounter === true}
                onChange={(e) => updateField('showCounter', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Text & Typography Customization */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Type className="w-4 h-4 text-sky-500" />
          3. 文字の色＆フォントスタイル設定
        </h3>

        {/* Text Color Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            文字の色 (フォントカラー)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {textColors.map((tc) => (
              <button
                key={tc.id}
                type="button"
                onClick={() => updateField('textColor', tc.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  config.textColor === tc.id || (!config.textColor && tc.id === 'auto')
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 ring-2 ring-sky-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`px-2 py-0.5 rounded text-[10px] ${tc.preview}`}>Aa</span>
                <span className="truncate">{tc.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Text Color Picker if 'custom' */}
          {config.textColor === 'custom' && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                お好みの文字色を選択:
              </label>
              <input
                type="color"
                value={config.customTextColor || '#ffffff'}
                onChange={(e) => updateField('customTextColor', e.target.value)}
                className="w-10 h-8 rounded border-0 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.customTextColor || '#ffffff'}
                onChange={(e) => updateField('customTextColor', e.target.value)}
                placeholder="#ffffff"
                className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 font-mono w-24"
              />
            </div>
          )}
        </div>

        {/* Font Family, Text Size, Button Size & Text Glow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              フォントデザイン (種類)
            </label>
            <select
              value={config.fontFamily || 'sans'}
              onChange={(e) => updateField('fontFamily', e.target.value as FontFamily)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {fontFamilies.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              文字の大きさ (サイズ)
            </label>
            <select
              value={config.textSize || 'base'}
              onChange={(e) => updateField('textSize', e.target.value as TextSize)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {textSizes.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {ts.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ボタン自体の大きさ
            </label>
            <select
              value={config.buttonSize || 'normal'}
              onChange={(e) => updateField('buttonSize', e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {buttonSizes.map((bs) => (
                <option key={bs.id} value={bs.id}>
                  {bs.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Glow toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={config.textGlow === true}
                onChange={(e) => updateField('textGlow', e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                ✨ 文字のネオン発光エフェクト
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Hashtags & Target URL Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          4. ハッシュタグ＆添付URL設定
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-sky-500" />
              ハッシュタグ (カンマまたはスペース区切り)
            </label>
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onBlur={handleHashtagBlur}
              placeholder="例: 今日の運勢, ガチャ, Xボタン"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-sky-500" />
              投稿に付属させるWeb URL (任意)
            </label>
            <input
              type="url"
              value={config.targetUrl || ''}
              onChange={(e) => updateField('targetUrl', e.target.value)}
              placeholder="未入力時はこのボタンのWeb遊戯URLが自動付属"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              ※ 未入力時は、フォロワーが𝕏からタップして直接大画面で遊べるWebリンクが自動挿入されます。
            </p>
          </div>
        </div>
      </div>

      {/* 5. Button Design & Effects */}
      <div className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-500" />
          5. 背景カラー＆ボタンデザインのカスタマイズ
        </h3>

        {/* 1. Background color BEHIND the button (Stage/Card Background) */}
        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
          <div>
            <label className="block text-xs font-bold text-purple-900 dark:text-purple-200 mb-0.5">
              🖼️ ボタンの後ろの背景色 (ステージ/カード全体の背景)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              ボタンが配置される枠線カード・ステージの背景カラーを変更できます
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cardBgStyles.map((cb) => (
              <button
                key={cb.id}
                type="button"
                onClick={() => updateField('cardBgStyle', cb.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  config.cardBgStyle === cb.id || (!config.cardBgStyle && cb.id === 'dark')
                    ? 'border-purple-500 bg-white dark:bg-slate-900 ring-2 ring-purple-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg shrink-0 shadow-xs ${cb.preview}`} />
                <span className="truncate text-[11px] font-semibold">{cb.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Stage Background Color Picker */}
          {config.cardBgStyle === 'custom' && (
            <div className="mt-2 flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ステージ背景の自由色を選択:
              </label>
              <input
                type="color"
                value={config.customCardBgColor || '#0f172a'}
                onChange={(e) => updateField('customCardBgColor', e.target.value)}
                className="w-10 h-8 rounded border-0 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.customCardBgColor || '#0f172a'}
                onChange={(e) => updateField('customCardBgColor', e.target.value)}
                placeholder="#0f172a"
                className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 font-mono w-24"
              />
            </div>
          )}
        </div>

        {/* 2. Button's OWN background color */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            🔘 ボタン本体のグラデーション / カラー
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {colorSchemes.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => updateField('colorScheme', c.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                  config.colorScheme === c.id
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`w-7 h-7 rounded-full shadow-sm ${c.color}`} />
                <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Button Background Color Picker */}
          {config.colorScheme === 'custom' && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ボタン本体の自由色を選択:
              </label>
              <input
                type="color"
                value={config.customBgColor || '#38bdf8'}
                onChange={(e) => updateField('customBgColor', e.target.value)}
                className="w-10 h-8 rounded border-0 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={config.customBgColor || '#38bdf8'}
                onChange={(e) => updateField('customBgColor', e.target.value)}
                placeholder="#38bdf8"
                className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 font-mono w-24"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Shape */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ボタンの形状
            </label>
            <select
              value={config.shape}
              onChange={(e) => updateField('shape', e.target.value as ButtonShape)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {shapes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Border */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              枠線スタイル
            </label>
            <select
              value={config.borderStyle || 'none'}
              onChange={(e) => updateField('borderStyle', e.target.value as BorderStyle)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {borders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shadow */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ボタンの影 (シャドウ)
            </label>
            <select
              value={config.shadowStyle || 'soft'}
              onChange={(e) => updateField('shadowStyle', e.target.value as ShadowStyle)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {shadows.map((sh) => (
                <option key={sh.id} value={sh.id}>
                  {sh.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Icon */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              アイコン
            </label>
            <select
              value={config.icon}
              onChange={(e) => updateField('icon', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {AVAILABLE_ICONS.map((i) => (
                <option key={i.name} value={i.name}>
                  {i.label} ({i.name})
                </option>
              ))}
            </select>
          </div>

          {/* Click Animation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              押し時の演出
            </label>
            <select
              value={config.animation}
              onChange={(e) => updateField('animation', e.target.value as ClickAnimation)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {animations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Effect */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              効果音
            </label>
            <select
              value={config.sound}
              onChange={(e) => updateField('sound', e.target.value as SoundEffect)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
            >
              {sounds.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Post & Card Branding Options */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            ⚙️ 𝕏投稿 & カード表示オプション
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Title in X post toggle */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={config.includeTitleInPost !== false}
                onChange={(e) => updateField('includeTitleInPost', e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  𝕏投稿に【ボタン名】を含める
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  例: 【{config.title || '清楚度判定ボタン'}】結果テキスト...
                </span>
              </div>
            </label>

            {/* Bottom Card Footer Badge toggle */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={config.showCardFooterBadge !== false}
                onChange={(e) => updateField('showCardFooterBadge', e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  カード下部に銘柄帯を表示
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  「{config.title || 'ボタン名'} | みんなのボタンメーカー」
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

