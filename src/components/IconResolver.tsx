import React from 'react';
import {
  Sparkles,
  Heart,
  Star,
  Flame,
  Coffee,
  Gamepad2,
  Gift,
  Dices,
  Trophy,
  Zap,
  Send,
  LucideProps,
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'Sparkles', label: 'キラキラ', icon: Sparkles },
  { name: 'Heart', label: 'ハート', icon: Heart },
  { name: 'Star', label: 'スター', icon: Star },
  { name: 'Flame', label: '炎', icon: Flame },
  { name: 'Coffee', label: 'カフェ', icon: Coffee },
  { name: 'Gamepad', label: 'ゲーム', icon: Gamepad2 },
  { name: 'Gift', label: 'ギフト', icon: Gift },
  { name: 'Dice', label: 'サイコロ', icon: Dices },
  { name: 'Trophy', label: 'トロフィー', icon: Trophy },
  { name: 'Zap', label: '稲妻', icon: Zap },
  { name: 'Send', label: '送信', icon: Send },
];

interface IconResolverProps extends LucideProps {
  name: string;
}

export const IconResolver: React.FC<IconResolverProps> = ({ name, ...props }) => {
  const item = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === name.toLowerCase());
  const Component = item ? item.icon : Sparkles;
  return <Component {...props} />;
};
