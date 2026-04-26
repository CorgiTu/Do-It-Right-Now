import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPanel from './SettingsPanel'

describe('SettingsPanel', () => {
  it('渲染时包含主题设置标题', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('主题设置')).toBeInTheDocument()
  })

  it('渲染时包含主题切换组件', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('增强莫兰迪')).toBeInTheDocument()
    expect(screen.getByText('明亮')).toBeInTheDocument()
    expect(screen.getByText('深色')).toBeInTheDocument()
  })
})
