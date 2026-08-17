/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomButtonConfig } from './types';
import { PRESET_TEMPLATES } from './data/presets';
import {
  getButtonFromUrlHash,
  buildShareableButtonUrl,
  encodeButtonConfig,
  buildXIntentUrl,
} from './utils/encoder';
import { Header } from './components/Header';
import { ButtonCard } from './components/ButtonCard';
import { OutcomeDisplay } from './components/OutcomeDisplay';
import { ButtonEditor } from './components/ButtonEditor';
import { GalleryView } from './components/GalleryView';
import { SavedButtonsView } from './components/SavedButtonsView';
import { ShareModal } from './components/ShareModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { getCardBgStyleObj } from './utils/theme';
import { Bookmark, Share2, Sparkles, Plus, Check, Play, Edit3, ArrowLeft } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'x_post_buttons_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'gallery' | 'saved'>('editor');

  // Shared button mode if loaded from URL hash (#btn=...)
  const [sharedButton, setSharedButton] = useState<CustomButtonConfig | null>(null);

  // Current button being created/edited
  const [currentConfig, setCurrentConfig] = useState<CustomButtonConfig>(() => {
    const defaultTmpl = PRESET_TEMPLATES[0].config;
    return {
      ...defaultTmpl,
      id: 'btn_' + Date.now().toString(36),
      createdAt: Date.now(),
    };
  });

  // Drawn outcome text state
  const [outcomeText, setOutcomeText] = useState<string | null>(null);
  const [lastUserInput, setLastUserInput] = useState<string | undefined>(undefined);

  // Saved buttons list
  const [savedButtons, setSavedButtons] = useState<CustomButtonConfig[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  // Modal controls
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Parse URL hash on mount & hash change
  useEffect(() => {
    const checkHash = () => {
      const parsedFromUrl = getButtonFromUrlHash();
      if (parsedFromUrl) {
        setSharedButton(parsedFromUrl);
      } else {
        setSharedButton(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Save to LocalStorage helper
  const saveButtonsToStorage = (buttons: CustomButtonConfig[]) => {
    setSavedButtons(buttons);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(buttons));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Handle Button Press (Draw outcome)
  const handlePressButton = (cfg: CustomButtonConfig, userInput?: string) => {
    setLastUserInput(userInput);
    const outcomes = cfg.outcomes && cfg.outcomes.length > 0 ? cfg.outcomes : ['ポストする内容'];

    let chosenText = outcomes[0];
    if (cfg.mode === 'random') {
      const randIdx = Math.floor(Math.random() * outcomes.length);
      chosenText = outcomes[randIdx];
    } else {
      chosenText = outcomes[0];
    }

    setOutcomeText(chosenText);

    // If autoOpenX is enabled (default true), immediately launch X post window
    if (cfg.autoOpenX !== false) {
      let fullMessage = chosenText;
      if (cfg.mode === 'input' && userInput) {
        fullMessage = fullMessage.replace('{input}', userInput).replace('{name}', userInput);
      }
      const prefix = cfg.prefixText ? cfg.prefixText.trim() + '\n' : '';
      const suffix = cfg.suffixText ? '\n' + cfg.suffixText.trim() : '';
      const postBody = `${prefix}${fullMessage}${suffix}`;

      const intentUrl = buildXIntentUrl({
        text: postBody,
        hashtags: cfg.hashtags,
        targetUrl: cfg.targetUrl,
      });

      try {
        window.open(intentUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.error('Failed to open X intent:', e);
      }
    }
  };

  // Save Current Button
  const handleSaveCurrentButton = () => {
    const existingIdx = savedButtons.findIndex((b) => b.id === currentConfig.id);
    let updatedList: CustomButtonConfig[];

    if (existingIdx >= 0) {
      updatedList = [...savedButtons];
      updatedList[existingIdx] = currentConfig;
    } else {
      updatedList = [currentConfig, ...savedButtons];
    }

    saveButtonsToStorage(updatedList);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Handle Create New Button
  const handleCreateNew = () => {
    const defaultTmpl = PRESET_TEMPLATES[0].config;
    setCurrentConfig({
      ...defaultTmpl,
      id: 'btn_' + Date.now().toString(36),
      title: '新しいカスタムボタン',
      createdAt: Date.now(),
    });
    setOutcomeText(null);
    setActiveTab('editor');
  };

  // Duplicate button
  const handleDuplicate = (cfg: CustomButtonConfig) => {
    const newConfig: CustomButtonConfig = {
      ...cfg,
      id: 'btn_' + Date.now().toString(36),
      title: `${cfg.title} (コピー)`,
      createdAt: Date.now(),
    };
    saveButtonsToStorage([newConfig, ...savedButtons]);
  };

  // Delete button
  const handleDelete = (id: string) => {
    if (confirm('このボタンを削除しますか？')) {
      const filtered = savedButtons.filter((b) => b.id !== id);
      saveButtonsToStorage(filtered);
    }
  };

  // Select preset from gallery
  const handleSelectGalleryPlay = (cfg: CustomButtonConfig) => {
    setCurrentConfig(cfg);
    setOutcomeText(null);
    setActiveTab('editor');
  };

  const handleSelectGalleryRemix = (cfg: CustomButtonConfig) => {
    const newConfig: CustomButtonConfig = {
      ...cfg,
      id: 'btn_' + Date.now().toString(36),
      title: `${cfg.title} (アレンジ)`,
      createdAt: Date.now(),
    };
    setCurrentConfig(newConfig);
    setOutcomeText(null);
    setActiveTab('editor');
  };

  // If user opened a shared button via URL hash (`#btn=...`)
  if (sharedButton) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between max-w-4xl mx-auto w-full rounded-b-2xl shadow-sm">
          <div
            onClick={() => {
              window.location.hash = '';
              setSharedButton(null);
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="w-8 h-8 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm shadow group-hover:scale-105 transition-transform">
              𝕏
            </span>
            <span className="font-extrabold text-sm sm:text-base">X Post Button Maker</span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
              setSharedButton(null);
              handleCreateNew();
            }}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            自分もボタンを作る
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 w-full flex-1 flex flex-col items-center justify-center">
          {/* Button Play Card */}
          {(() => {
            const sharedStyle = getCardBgStyleObj(sharedButton.cardBgStyle, sharedButton.customCardBgColor);
            return (
              <div
                className={`w-full rounded-3xl p-6 md:p-8 text-center mb-6 transition-all duration-300 ${sharedStyle.className}`}
                style={sharedStyle.style}
              >
                <ButtonCard
                  config={sharedButton}
                  onPress={(input) => handlePressButton(sharedButton, input)}
                />

                {!outcomeText && (
                  <p className={`text-xs mt-2 flex items-center justify-center gap-1 ${sharedStyle.isDark ? 'text-sky-300' : 'text-slate-600'}`}>
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    ボタンを押すと、結果文面がセットされた𝕏投稿画面が開きます
                  </p>
                )}
              </div>
            );
          })()}

          {/* Outcome Card */}
          {outcomeText && (
            <OutcomeDisplay
              config={sharedButton}
              outcomeText={outcomeText}
              userInput={lastUserInput}
              onReroll={() => handlePressButton(sharedButton, lastUserInput)}
              onOpenShare={() => setIsShareModalOpen(true)}
            />
          )}

          {/* Prominent CTA Box to create a new button */}
          <div className="w-full mt-6 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 p-0.5 rounded-3xl shadow-lg">
            <div className="bg-white dark:bg-slate-900 rounded-[23px] p-6 text-center space-y-3">
              <div className="inline-flex p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg">
                あなたもオリジナルの𝕏ボタンを作ってみませんか？
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                おみくじ・ガチャ・進捗報告・診断ボタンなど、誰でも簡単に作れてすぐ共有できます！(完全無料・登録不要)
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '';
                    setSharedButton(null);
                    handleCreateNew();
                  }}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs md:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  新しいボタンを作るサイトへ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '';
                    setCurrentConfig({ ...sharedButton, id: 'btn_' + Date.now().toString(36) });
                    setSharedButton(null);
                    setActiveTab('editor');
                  }}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  このボタンをアレンジ作成
                </button>
              </div>
            </div>
          </div>
        </main>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          config={sharedButton}
        />

        <footer className="p-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/50 dark:border-slate-900">
          X Post Button Maker • 押してXでシェアしよう
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* App Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedButtons.length}
        onCreateNew={handleCreateNew}
      />

      {/* Main App Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* TAB 1: Editor & Interactive Live Preview */}
        {activeTab === 'editor' && (
          <div className="space-y-8">
            {/* Live Interactive Preview Stage */}
            {(() => {
              const liveStyle = getCardBgStyleObj(currentConfig.cardBgStyle, currentConfig.customCardBgColor);
              return (
                <div
                  className={`rounded-3xl p-6 md:p-10 relative overflow-hidden transition-all duration-300 ${liveStyle.className}`}
                  style={liveStyle.style}
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between gap-2 mb-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      liveStyle.isDark
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-sky-100 text-sky-800 border-sky-300'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      リアルタイムプレビュー (動作確認)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveCurrentButton}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        {savedToast ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            保存しました！
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            マイボタンに保存
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className={`px-3.5 py-1.5 rounded-xl border font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                          liveStyle.isDark
                            ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                            : 'border-slate-300 hover:bg-slate-100 text-slate-800 bg-white/80'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        共有/埋め込み
                      </button>
                    </div>
                  </div>

                  {/* The Live Button Card */}
                  <div className="py-4">
                    <ButtonCard
                      config={currentConfig}
                      onPress={(input) => handlePressButton(currentConfig, input)}
                    />

                    {!outcomeText && (
                      <div className={`mt-4 pt-4 border-t text-center space-y-2 ${
                        liveStyle.isDark ? 'border-slate-800/80' : 'border-slate-300/80'
                      }`}>
                        <p className={`text-xs font-medium flex items-center justify-center gap-1.5 ${
                          liveStyle.isDark ? 'text-sky-300' : 'text-sky-700'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                          ボタンを押すと、結果テキストがセットされた𝕏(Twitter)の投稿画面が即座に開きます！
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handleCreateNew}
                            className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                              liveStyle.isDark
                                ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                                : 'bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 border-slate-900/20'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            新しく別のボタンを作る
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Revealed Outcome Display in Editor */}
                  <AnimatePresence>
                    {outcomeText && (
                      <OutcomeDisplay
                        config={currentConfig}
                        outcomeText={outcomeText}
                        userInput={lastUserInput}
                        onReroll={() => handlePressButton(currentConfig, lastUserInput)}
                        onOpenShare={() => setIsShareModalOpen(true)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}

            {/* Button Editor Form */}
            <ButtonEditor
              config={currentConfig}
              onChange={setCurrentConfig}
              onOpenAiAssistant={() => setIsAiModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: Gallery of Templates */}
        {activeTab === 'gallery' && (
          <GalleryView
            onSelectPlay={handleSelectGalleryPlay}
            onSelectRemix={handleSelectGalleryRemix}
          />
        )}

        {/* TAB 3: Saved My Buttons */}
        {activeTab === 'saved' && (
          <SavedButtonsView
            savedButtons={savedButtons}
            onPlay={(cfg) => {
              setCurrentConfig(cfg);
              setOutcomeText(null);
              setActiveTab('editor');
            }}
            onEdit={(cfg) => {
              setCurrentConfig(cfg);
              setOutcomeText(null);
              setActiveTab('editor');
            }}
            onShare={(cfg) => {
              setCurrentConfig(cfg);
              setIsShareModalOpen(true);
            }}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
          />
        )}
      </main>

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={currentConfig}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyConfig={(generated) => {
          setCurrentConfig((prev) => ({
            ...prev,
            ...generated,
          }));
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          X Post Button Maker • 誰でもボタンが作れる＆Xに自動ポストできるWEBツール
        </p>
        <p className="mt-1 opacity-75">
          ランダムガチャ・単一テキスト・ユーザー入力対応 | ハッシュタグ＆カスタムURLサポート
        </p>
      </footer>
    </div>
  );
}
