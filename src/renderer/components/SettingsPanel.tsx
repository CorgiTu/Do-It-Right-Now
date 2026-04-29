import { useState, useEffect } from 'react'
import ThemeSwitcher from './ThemeSwitcher'
import { useListStore } from '../store/listStore'

export default function SettingsPanel() {
  const [resetMessage, setResetMessage] = useState('')
  const { lists, updateList } = useListStore()
  const [dailyListId, setDailyListId] = useState<string | ''>('')

  useEffect(() => {
    const savedDailyListId = localStorage.getItem('todo-app-daily-list-id')
    if (savedDailyListId) {
      setDailyListId(savedDailyListId)
    }
  }, [])

  const handleResetData = async () => {
    try {
      localStorage.removeItem('todo-app-tasks-v2')
      localStorage.removeItem('todo-app-lists-v2')
      localStorage.removeItem('todo-app-daily-list-id')
      setResetMessage('数据已重置，页面将刷新')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setResetMessage('重置失败：' + (error as Error).message)
    }
  }

  const handleDailyListChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newListId = e.target.value
    setDailyListId(newListId)
    
    if (newListId) {
      localStorage.setItem('todo-app-daily-list-id', newListId)
      const list = lists.find(l => l.id === newListId)
      if (list) {
        await updateList(newListId, { isDailyList: true })
      }
      window.location.reload()
    } else {
      localStorage.removeItem('todo-app-daily-list-id')
      window.location.reload()
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">主题设置</h3>
      <ThemeSwitcher />
      
      <div className="mt-6 pt-6 border-t border-t border-[var(--color-border)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">每日任务设置</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              指定每日任务分组
            </label>
            <select
              value={dailyListId}
              onChange={handleDailyListChange}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">不设置每日任务分组</option>
              {lists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name} {list.isDailyList ? '✓' : ''}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--color-text-light)]">
              💡 被指定的分组中的任务将自动设置为每日重复，每天自动重置完成状态
            </p>
          </div>
        </div>
      </div>
      
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
