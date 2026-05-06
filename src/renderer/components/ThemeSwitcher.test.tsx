import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeSwitcher from './ThemeSwitcher'
import { useThemeStore } from '../store/themeStore'

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    useThemeStore.getState().switchTheme('enhanced-morandi')
  })

  it('渲染时显示 3 个主题选项', () => {
    render(<ThemeSwitcher />)
    expect(screen.getByText('增强莫兰迪')).toBeInTheDocument()
    expect(screen.getByText('明亮')).toBeInTheDocument()
    expect(screen.getByText('深色')).toBeInTheDocument()
  })

  it('当前主题标记为选中状态', () => {
    useThemeStore.getState().switchTheme('bright')
    render(<ThemeSwitcher />)
    const brightOption = screen.getByText('明亮').closest('button')
    expect(brightOption).toHaveAttribute('aria-pressed', 'true')
  })

  it('点击主题选项调用 switchTheme', () => {
    render(<ThemeSwitcher />)
    fireEvent.click(screen.getByText('明亮'))
    expect(useThemeStore.getState().currentThemeId).toBe('bright')
  })

  it('每个主题显示颜色预览色块', () => {
    render(<ThemeSwitcher />)
    const colorSwatches = document.querySelectorAll('[data-testid="color-swatch"]')
    expect(colorSwatches.length).toBeGreaterThanOrEqual(3)
  })
})
