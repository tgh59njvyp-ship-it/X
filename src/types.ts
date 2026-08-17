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

export type FontFamily = 'sans' | 'rounded' | 'serif' | 'mono' | 'black';

export type ButtonShape = 'pill' | 'rounded' | 'square' | 'retro3d';

export type BorderStyle = 'none' | 'thin' | 'thick' | 'dashed' | 'neon';

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

export type ClickAnimation = 'confetti' | 'hearts' | 'sparkles' | 'fireworks' | 'snow' | 'bounce';

export type SoundEffect = 'none' | 'click' | 'pop' | 'fanfare' | 'coin' | 'trumpet';

export type PostMode = 'random' | 'single' | 'input';

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
  fontFamily?: FontFamily; // Font style
  borderStyle?: BorderStyle; // Border style
  shadowStyle?: ShadowStyle; // Shadow intensity
  cardBgStyle?: CardBgStyle; // Background style behind the button
  customCardBgColor?: string; // Custom hex color for stage background behind button
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
