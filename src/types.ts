export type ColorScheme =
  | 'blue'
  | 'sunset'
  | 'neon'
  | 'sakura'
  | 'emerald'
  | 'dark'
  | 'gold'
  | 'purple'
  | 'mint'
  | 'rainbow'
  | 'cyber'
  | 'custom';

export type TextColor =
  | 'auto'
  | 'white'
  | 'black'
  | 'yellow'
  | 'cyan'
  | 'pink'
  | 'gold'
  | 'custom';

export type TextSize = 'sm' | 'base' | 'lg' | 'xl';

export type ButtonSize = 'compact' | 'normal' | 'lg' | 'hero';

export type FontFamily = 'sans' | 'rounded' | 'serif' | 'mono' | 'black';

export type ButtonShape = 'pill' | 'rounded' | 'square' | 'retro3d';

export type BorderStyle = 'none' | 'thin' | 'thick' | 'dashed' | 'neon' | 'double';

export type ShadowStyle = 'none' | 'soft' | 'strong' | 'glow';

export type CardBgStyle =
  | 'dark'
  | 'white'
  | 'slate'
  | 'sunset'
  | 'sakura'
  | 'mint'
  | 'cyber'
  | 'custom';

export type ClickAnimation =
  | 'confetti'
  | 'hearts'
  | 'sparkles'
  | 'fireworks'
  | 'snow'
  | 'bounce'
  | 'stars'
  | 'fire';

export type SoundEffect =
  | 'none'
  | 'click'
  | 'pop'
  | 'fanfare'
  | 'coin'
  | 'trumpet'
  | 'drumroll'
  | 'magic'
  | 'applause';

export type PostMode = 'random' | 'single' | 'input' | 'diagnostic';

export interface DiagnosticOption {
  label: string;
  outcomeIndex: number;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: DiagnosticOption[];
}

export interface CustomButtonConfig {
  id: string;
  title: string;
  description?: string;
  buttonText: string;
  subText?: string;
  icon: string;
  colorScheme: ColorScheme;
  customBgColor?: string; // Hex color for custom bg
  textColor?: TextColor; // Text color option
  customTextColor?: string; // Custom hex text color
  textSize?: TextSize; // Text size
  buttonSize?: ButtonSize; // Button size (compact, normal, lg, hero)
  fontFamily?: FontFamily; // Font style
  borderStyle?: BorderStyle; // Border style
  customBorderColor?: string; // Hex for custom border color
  shadowStyle?: ShadowStyle; // Shadow intensity
  textGlow?: boolean; // Neon text glow
  cardBgStyle?: CardBgStyle; // Background style behind the button
  customCardBgColor?: string; // Custom hex color for stage background behind button
  shape: ButtonShape;
  animation: ClickAnimation;
  sound: SoundEffect;
  mode: PostMode;
  outcomes: string[]; // List of messages for random mode or single message
  outcomeWeights?: number[]; // Probability weights for random mode (e.g. [10, 30, 60])
  outcomeRarities?: string[]; // Rarity tags for random mode (e.g. ['SSR', 'SR', 'N'])
  diagnosticQuestions?: DiagnosticQuestion[]; // Questions for diagnostic mode
  inputLabel?: string; // For input mode e.g. "あなたの名前"
  inputPlaceholder?: string;
  hashtags: string[]; // e.g. ['今日の運勢', 'Xボタン']
  targetUrl?: string; // Custom link attached to tweet
  prefixText?: string; // Text added before outcome
  suffixText?: string; // Text added after outcome
  autoOpenX?: boolean; // Automatically open X post page when clicked (default true)
  includeTitleInPost?: boolean; // Include 【Title】 in X post text (default true)
  showCardFooterBadge?: boolean; // Show bottom overlay badge like "タイトル | みんなのボタンメーカー" (default true)
  showCounter?: boolean; // Show click counter badge on button
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

