import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'
import { themes, DEFAULT_THEME_ID } from '../config/themes'

describe('themeStore', () => {
  it('初始化时使用默认主题', () => {
    const store = useThemeStore.getState()
    expect(store.currentThemeId).toBe(DEFAULT_THEME_ID)
  })

  it('切换主题并保存到 localStorage', () => {
    useThemeStore.getState().switchTheme('bright')
    expect(useThemeStore.getState().currentThemeId).toBe('bright')
    expect(localStorage.getItem('todo-app-theme')).toBe('bright')
  })

  it('切换主题时应用 CSS 变量到 document root', () => {
    useThemeStore.getState().switchTheme('dark')
    const root = document.documentElement
    const accentColor = getComputedStyle(root).getPropertyValue('--color-accent').trim()
    expect(accentColor).toBe('#4da6ff')
  })

  it('getCurrentTheme返回当前主题对象', () => {
    useThemeStore.getState().switchTheme('bright')
    const currentTheme = useThemeStore.getState().getCurrentTheme()
    expect(currentTheme).toBeDefined()
    expect(currentTheme!.name).toBe('明亮')
    expect(currentTheme!.accent).toBe('#3498db')
  })

  it('切换到不存在的主题时不改变当前主题', () => {
    useThemeStore.getState().switchTheme('bright')
    const store = useThemeStore.getState()
    const originalTheme = store.currentThemeId
    store.switchTheme('non-existent-theme')
    expect(store.currentThemeId).toBe(originalTheme)
  })
})
