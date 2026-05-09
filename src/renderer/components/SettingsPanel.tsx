import ThemeSwitcher from './ThemeSwitcher'
import { useListStore } from '../store/listStore'
import { useTaskStore } from '../store/taskStore'

export default function SettingsPanel() {
  const { lists } = useListStore()
  const { initializeDailyTasks } = useTaskStore()

  const handleResetData = () => {
    if (window.confirm('确定要重置所有数据吗？此操作不可恢复。')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <ThemeSwitcher />

      <div className="pt-4 border-t border-gray-200/60">
        <h3 className="text-sm font-semibold text-coinbase-ink mb-2 px-1">工作日任务设置</h3>
        <p className="text-xs text-gray-400 mb-3 px-1">选择需要自动生成每日任务的工作日</p>
        <div className="flex gap-2">
          {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => (
            <label
              key={day}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={[0, 1, 2, 3, 4].includes(i)}
                onChange={() => { }}
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200/60">
        <h3 className="text-sm font-semibold text-coinbase-semantic-down mb-2 px-1">数据管理</h3>
        <div className="px-1">
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-coinbase-semantic-down/10 text-coinbase-semantic-down rounded-coinbase-pill hover:bg-coinbase-semantic-down/20 transition-colors text-sm font-medium"
          >
            重置所有数据
          </button>
        </div>
      </div>
    </div>
  )
}
