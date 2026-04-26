import { create } from 'zustand'
import { themes, DEFAULT_THEME_ID, getThemeById } from '../config/themes'
import type { ThemeColors } from '../types/theme'

const THEME_STORAGE_KEY = 'todo-app-theme'

interface ThemeStore {
  currentThemeId: string
  switchTheme: (themeId: string) => void
  getCurrentTheme: () => ThemeColors | undefined
}

function applyThemeToCSS(theme: ThemeColors): void {
  const root = document.documentElement
  root.style.setProperty('--color-bg', theme.bg)
  root.style.setProperty('--color-bg-alt', theme.bgAlt)
  root.style.setProperty('--color-text', theme.text)
  root.style.setProperty('--color-text-light', theme.textLight)
  root.style.setProperty('--color-border', theme.border)
  root.style.setProperty('--color-shadow', theme.shadow)
  root.style.setProperty('--color-hover', theme.hover)
  root.style.setProperty('--color-accent', theme.accent)
  root.style.setProperty('--color-accent-hover', theme.accentHover)
  root.style.setProperty('--color-accent-light', theme.accentLight)
}

function getInitialThemeId(): string {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved && getThemeById(saved)) {
      return saved
    }
  } catch (e) {
    // localStorage not available
  }
  return DEFAULT_THEME_ID
}

const initialThemeId = getInitialThemeId()
const initialTheme = getThemeById(initialThemeId)
if (initialTheme) {
  applyThemeToCSS(initialTheme)
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  currentThemeId: initialThemeId,

  switchTheme: (themeId: string) => {
    const theme = getThemeById(themeId)
    if (!theme) return

    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
    } catch (e) {
      // localStorage not available
    }

    applyThemeToCSS(theme)
    set({ currentThemeId: themeId })
  },

  getCurrentTheme: () => {
    const { currentThemeId } = get()
    return getThemeById(currentThemeId)
  },
}))
