import { describe, it, expect } from 'vitest'
import { themes, DEFAULT_THEME_ID, getThemeById } from './themes'

describe('themes', () => {
  it('包含3个预设主题', () => {
    expect(themes).toHaveLength(3)
  })

  it('包含增强莫兰迪主题', () => {
    const morandi = themes.find(t => t.id === 'enhanced-morandi')
    expect(morandi).toBeDefined()
    expect(morandi!.name).toBe('增强莫兰迪')
  })

  it('包含明亮主题', () => {
    const bright = themes.find(t => t.id === 'bright')
    expect(bright).toBeDefined()
    expect(bright!.name).toBe('明亮')
  })

  it('包含深色主题', () => {
    const dark = themes.find(t => t.id === 'dark')
    expect(dark).toBeDefined()
    expect(dark!.name).toBe('深色')
  })

  it('默认主题是增强莫兰迪', () => {
    expect(DEFAULT_THEME_ID).toBe('enhanced-morandi')
  })

  it('getThemeById可以通过id找到主题', () => {
    expect(getThemeById('bright')).toBeDefined()
    expect(getThemeById('bright')!.name).toBe('明亮')
  })

  it('getThemeById找不到时返回undefined', () => {
    expect(getThemeById('non-existent')).toBeUndefined()
  })

  it('每个主题都有完整的颜色定义', () => {
    themes.forEach(theme => {
      expect(theme.name).toBeDefined()
      expect(theme.id).toBeDefined()
      expect(theme.bg).toBeDefined()
      expect(theme.bgAlt).toBeDefined()
      expect(theme.text).toBeDefined()
      expect(theme.textLight).toBeDefined()
      expect(theme.border).toBeDefined()
      expect(theme.shadow).toBeDefined()
      expect(theme.hover).toBeDefined()
      expect(theme.accent).toBeDefined()
      expect(theme.accentHover).toBeDefined()
      expect(theme.accentLight).toBeDefined()
    })
  })

  it('明亮主题使用明亮的配色', () => {
    const bright = getThemeById('bright')!
    expect(bright.bg).toBe('#ffffff')
    expect(bright.accent).toBe('#3498db')
  })

  it('深色主题使用深色的配色', () => {
    const dark = getThemeById('dark')!
    expect(dark.bg).toBe('#1a1d21')
    expect(dark.accent).toBe('#4da6ff')
  })
})
