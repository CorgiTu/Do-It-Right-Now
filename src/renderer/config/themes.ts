export interface ThemeColors {
  bg: string
  'bg-alt': string
  text: string
  'text-light': string
  border: string
  shadow: string
  hover: string
  accent: string
  'accent-hover': string
  'accent-light': string
  ink: string
  'muted-soft': string
  'semantic-up': string
  'semantic-down': string
  'on-primary': string
  'surface-strong': string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
}

export const themes: Theme[] = [
  {
    id: 'coinbase-light',
    name: 'Coinbase',
    colors: {
      bg: '#FFFFFF',
      'bg-alt': '#F7F7F7',
      text: '#5B616E',
      'text-light': '#7C828A',
      border: '#DEE1E6',
      shadow: 'rgba(0, 0, 0, 0.04)',
      hover: '#EEF0F3',
      accent: '#0052FF',
      'accent-hover': '#003ECC',
      'accent-light': 'rgba(0, 82, 255, 0.1)',
      ink: '#0A0B0D',
      'muted-soft': '#A8ACB3',
      'semantic-up': '#05B169',
      'semantic-down': '#CF202F',
      'on-primary': '#FFFFFF',
      'surface-strong': '#EEF0F3',
    },
  },
  {
    id: 'coinbase-dark',
    name: 'Coinbase Dark',
    colors: {
      bg: '#0A0B0D',
      'bg-alt': '#16181C',
      text: '#A8ACB3',
      'text-light': '#7C828A',
      border: '#2B2F36',
      shadow: 'rgba(0, 0, 0, 0.2)',
      hover: '#2B2F36',
      accent: '#0052FF',
      'accent-hover': '#3B82F6',
      'accent-light': 'rgba(0, 82, 255, 0.15)',
      ink: '#FFFFFF',
      'muted-soft': '#5B616E',
      'semantic-up': '#05B169',
      'semantic-down': '#CF202F',
      'on-primary': '#FFFFFF',
      'surface-strong': '#2B2F36',
    },
  },
]

export const DEFAULT_THEME_ID = themes[0].id
