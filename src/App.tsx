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
} from './utils/encoder';
import { Header } from './components/Header';
import { ButtonCard } from './components/ButtonCard';
import { OutcomeDisplay } from './components/OutcomeDisplay';
import { ButtonEditor } from './components/ButtonEditor';
import { GalleryView } from './components/GalleryView';
import { SavedButtonsView } from './components/SavedButtonsView';
import { ShareModal } from './components/ShareModal';
import { AiAssistantModal } from './components/AiAssistantModal';
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

    if (cfg.mode === 'random') {
      const randIdx = Math.floor(Math.random() * outcomes.length);
      setOutcomeText(outcomes[randIdx]);
    } else {
      setOutcomeText(outcomes[0]);
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
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm">
              𝕏
            </span>
            <span className="font-extrabold text-sm sm:text-base">X Post Button Maker</span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
              setSharedButton(null);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            自分もボタンを作る
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 w-full flex-1 flex flex-col items-center justify-center">
          {/* Button Play Card */}
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-center mb-6">
            <ButtonCard
              config={sharedButton}
              onPress={(input) => handlePressButton(sharedButton, input)}
            />
          </div>

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

          {/* Remix Option */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '';
                setCurrentConfig({ ...sharedButton, id: 'btn_' + Date.now().toString(36) });
                setSharedButton(null);
                setActiveTab('editor');
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 underline transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              このボタンをカスタマイズして自分のボタンを作る
            </button>
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
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
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
                    className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
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
