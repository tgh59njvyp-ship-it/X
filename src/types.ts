export type ColorScheme =
  | 'blue'
  | 'sunset'
  | 'neon'
  | 'sakura'
  | 'emerald'
  | 'dark'
  | 'gold'
  | 'purple';

export type ButtonShape = 'pill' | 'rounded' | 'square' | 'retro3d';

export type ClickAnimation = 'confetti' | 'hearts' | 'sparkles' | 'bounce';

export type SoundEffect = 'none' | 'click' | 'pop' | 'fanfare' | 'coin';

export type PostMode = 'random' | 'single' | 'input';

export interface CustomButtonConfig {
  id: string;
  title: string;
  description?: string;
  buttonText: string;
  subText?: string;
  icon: string;
  colorScheme: ColorScheme;
  shape: ButtonShape;
  animation: ClickAnimation;
  sound: SoundEffect;
  mode: PostMode;
  outcomes: string[]; // List of messages for random mode or single message
  inputLabel?: string; // For input mode e.g. "あなたの名前"
  inputPlaceholder?: string;
  hashtags: string[]; // e.g. ['今日の運勢', 'Xボタン']
  targetUrl?: string; // Custom link attached to tweet
  prefixText?: string; // Text added before outcome
  suffixText?: string; // Text added after outcome
  autoOpenX?: boolean; // Automatically open X post page when clicked (default true)
  createdAt: number;
  authorName?: string;
}

export interface PresetTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  badge: string;
  config: Omit<CustomButtonConfig, 'id' | 'createdAt'>;
}
