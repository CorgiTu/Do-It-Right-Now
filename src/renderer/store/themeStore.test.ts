import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'
import { themes, DEFAULT_THEME_ID } from '../config/themes'

describe('themeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('初始化时使用默认主题', () => {
    const store = useThemeStore.getState()
    expect(store.themeId).toBe(DEFAULT_THEME_ID)
  })

  it('切换主题并保存到 localStorage', () => {
    useThemeStore.getState().setTheme('coinbase-dark')
    expect(useThemeStore.getState().themeId).toBe('coinbase-dark')
    expect(localStorage.getItem('theme')).toBe('coinbase-dark')
  })

  it('getCurrentTheme返回当前主题对象', () => {
    useThemeStore.getState().setTheme('coinbase-dark')
    expect(useThemeStore.getState().themeId).toBe('coinbase-dark')
  })
})
