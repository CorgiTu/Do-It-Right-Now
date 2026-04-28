import { useState } from 'react'
import ThemeSwitcher from './ThemeSwitcher'

export default function SettingsPanel() {
  const [resetMessage, setResetMessage] = useState('')

  const handleResetData = async () => {
    try {
      localStorage.removeItem('todo-app-tasks-v2')
      localStorage.removeItem('todo-app-lists-v2')
      setResetMessage('数据已重置，页面将刷新')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setResetMessage('重置失败：' + (error as Error).message)
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">主题设置</h3>
      <ThemeSwitcher />
      
      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">调试工具</h3>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          重置数据
        </button>
        {resetMessage && (
          <p className="mt-2 text-sm text-gray-600">{resetMessage}</p>
        )}
      </div>
    </div>
  )
}
