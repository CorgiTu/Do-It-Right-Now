import { useState } from 'react'
import ThemeSwitcher from './ThemeSwitcher'

export default function SettingsPanel() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">主题设置</h3>
      <ThemeSwitcher />
    </div>
  )
}
