import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeSwitcher from './ThemeSwitcher'
import { useThemeStore } from '../store/themeStore'

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.getState().setTheme('coinbase-light')
  })

  it('渲染时显示所有主题选项', () => {
    render(<ThemeSwitcher />)
    expect(screen.getByText('Coinbase')).toBeInTheDocument()
    expect(screen.getByText('Coinbase Dark')).toBeInTheDocument()
  })

  it('当前主题标记为选中状态', () => {
    useThemeStore.getState().setTheme('coinbase-dark')
    render(<ThemeSwitcher />)
    const darkOption = screen.getByText('Coinbase Dark').closest('button')
    expect(darkOption).toHaveClass('bg-coinbase-primary')
  })

  it('点击主题选项调用 setTheme', () => {
    render(<ThemeSwitcher />)
    fireEvent.click(screen.getByText('Coinbase Dark'))
    expect(useThemeStore.getState().themeId).toBe('coinbase-dark')
  })
})
