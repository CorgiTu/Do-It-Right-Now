import { create } from 'zustand'
import { themes, DEFAULT_THEME_ID } from '../config/themes'
import type { ThemeId } from '../types/theme'

interface ThemeState {
  themeId: ThemeId
  setTheme: (id: ThemeId) => void
  applyTheme: () => void
}

function getTheme(id: ThemeId) {
  return themes.find(t => t.id === id) || themes[0]
}

function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'coinbase-light' || stored === 'coinbase-dark') {
      return stored
    }
  } catch { }
  return DEFAULT_THEME_ID as ThemeId
}

export function applyThemeColors(themeId: ThemeId) {
  const theme = getTheme(themeId)
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  localStorage.setItem('theme', themeId)
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeId: getStoredTheme(),
  setTheme: (id: ThemeId) => {
    set({ themeId: id })
    applyThemeColors(id)
  },
  applyTheme: () => {
    const storedId = getStoredTheme()
    applyThemeColors(storedId)
    set({ themeId: storedId })
  },
}))
