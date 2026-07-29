export type Theme = 'sunset' | 'neon' | 'pastel' | 'cherry' | 'ocean' | 'midnight';

export interface ThemeConfig {
  label: string;
  gradient: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentText: string;
  buttonGradient: string;
  textPrimary: string;
  textSecondary: string;
  emoji: string;
  dark: boolean;
}

export const themes: Record<Theme, ThemeConfig> = {
  sunset: {
    label: 'Sunset', emoji: '🌅', dark: false,
    gradient: 'from-orange-400 via-pink-500 to-rose-500',
    cardBg: 'bg-white/90', cardBorder: 'border-orange-200',
    accent: 'bg-orange-500', accentText: 'text-orange-600',
    buttonGradient: 'from-orange-500 to-pink-500',
    textPrimary: 'text-gray-900', textSecondary: 'text-gray-600',
  },
  neon: {
    label: 'Neon', emoji: '💚', dark: true,
    gradient: 'from-green-400 via-cyan-500 to-blue-600',
    cardBg: 'bg-gray-900/90', cardBorder: 'border-green-400',
    accent: 'bg-green-400', accentText: 'text-green-400',
    buttonGradient: 'from-green-400 to-cyan-500',
    textPrimary: 'text-white', textSecondary: 'text-gray-300',
  },
  pastel: {
    label: 'Pastel', emoji: '🌸', dark: false,
    gradient: 'from-purple-300 via-pink-300 to-rose-200',
    cardBg: 'bg-white/90', cardBorder: 'border-purple-200',
    accent: 'bg-purple-400', accentText: 'text-purple-600',
    buttonGradient: 'from-purple-400 to-pink-400',
    textPrimary: 'text-gray-900', textSecondary: 'text-gray-600',
  },
  cherry: {
    label: 'Cherry', emoji: '🍒', dark: false,
    gradient: 'from-red-500 via-rose-500 to-pink-600',
    cardBg: 'bg-white/90', cardBorder: 'border-red-200',
    accent: 'bg-rose-500', accentText: 'text-rose-600',
    buttonGradient: 'from-red-500 to-rose-500',
    textPrimary: 'text-gray-900', textSecondary: 'text-gray-600',
  },
  ocean: {
    label: 'Ocean', emoji: '🌊', dark: false,
    gradient: 'from-blue-400 via-cyan-400 to-teal-500',
    cardBg: 'bg-white/90', cardBorder: 'border-blue-200',
    accent: 'bg-cyan-500', accentText: 'text-cyan-700',
    buttonGradient: 'from-blue-500 to-teal-500',
    textPrimary: 'text-gray-900', textSecondary: 'text-gray-600',
  },
  midnight: {
    label: 'Midnight', emoji: '🌙', dark: true,
    gradient: 'from-indigo-900 via-purple-900 to-blue-900',
    cardBg: 'bg-white/10', cardBorder: 'border-indigo-400/40',
    accent: 'bg-indigo-400', accentText: 'text-indigo-300',
    buttonGradient: 'from-indigo-500 to-purple-500',
    textPrimary: 'text-white', textSecondary: 'text-indigo-200',
  },
};

export interface CustomGradient {
  from: string;
  via: string;
  to: string;
}

export function getGradientStyle(
  theme: Theme,
  custom?: CustomGradient | null
): { className?: string; style?: React.CSSProperties } {
  if (custom?.from && custom?.via && custom?.to) {
    return {
      style: {
        background: `linear-gradient(to bottom right, ${custom.from}, ${custom.via}, ${custom.to})`,
      },
    };
  }
  return { className: `bg-gradient-to-br ${themes[theme].gradient}` };
}

export function formatSlotDate(startsAt: string | Date | null | undefined, fallback: string): string {
  if (!startsAt) return fallback;
  const d = new Date(startsAt);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}
