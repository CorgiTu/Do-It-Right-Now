import type { ThemeColors } from '../types/theme'

export const themes: ThemeColors[] = [
  {
    name: '增强莫兰迪',
    id: 'enhanced-morandi',
    bg: '#f8f7f4',
    bgAlt: '#f2f1ee',
    text: '#5a5a5a',
    textLight: '#9a9a9a',
    border: '#e8e6e1',
    shadow: 'rgba(0, 0, 0, 0.06)',
    hover: '#f0eeea',
    accent: '#7a9ba8',
    accentHover: '#6b8a97',
    accentLight: '#c5d9e2',
  },
  {
    name: '明亮',
    id: 'bright',
    bg: '#ffffff',
    bgAlt: '#f8f9fa',
    text: '#2c3e50',
    textLight: '#7f8c8d',
    border: '#e9ecef',
    shadow: 'rgba(0, 0, 0, 0.08)',
    hover: '#f1f3f5',
    accent: '#3498db',
    accentHover: '#2980b9',
    accentLight: '#d6eaf8',
  },
  {
    name: '深色',
    id: 'dark',
    bg: '#1a1d21',
    bgAlt: '#222529',
    text: '#e8e8e8',
    textLight: '#9e9e9e',
    border: '#3a3d41',
    shadow: 'rgba(0, 0, 0, 0.3)',
    hover: '#2c3036',
    accent: '#4da6ff',
    accentHover: '#66b3ff',
    accentLight: '#3d5a73',
  },
]

export const DEFAULT_THEME_ID = 'enhanced-morandi'

export function getThemeById(id: string): ThemeColors | undefined {
  return themes.find(theme => theme.id === id)
}
