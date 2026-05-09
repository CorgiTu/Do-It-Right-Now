import { useState, useEffect } from 'react'
import { useSubtaskStore } from '../store/subtaskStore'
import SubtaskItem from './SubtaskItem'

interface SubtaskListProps {
  taskId: string
}

export default function SubtaskList({ taskId }: SubtaskListProps) {
  const [value, setValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const { subtaskMap, addSubtask, getSubtaskStats } = useSubtaskStore()

  const taskSubtasks = (subtaskMap[taskId] || []).filter(s => s.taskId === taskId)
  const stats = getSubtaskStats(taskId)

  useEffect(() => {
    if (stats.total > 0) {
      setIsExpanded(true)
    }
  }, [stats.total])

  const handleAdd = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    addSubtask(taskId, trimmed)
    setValue('')
    setIsExpanded(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
    if (e.key === 'Escape') {
      setValue('')
    }
  }

  return (
    <div className="mt-3">
      {stats.total > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-coinbase-muted hover:text-coinbase-body transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            子任务 ({stats.completed}/{stats.total})
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-0.5 mb-2 animate-slide-up">
          {taskSubtasks.map(subtask => (
            <SubtaskItem key={subtask.id} subtask={subtask} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="添加子任务..."
            className="w-full px-3 py-1.5 bg-gray-50/60 border border-gray-200/60 rounded-lg text-xs text-gray-700 placeholder-gray-400 transition-all focus:bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300/30"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!value.trim()}
          className="px-3 py-1.5 text-gray-500 hover:text-gray-800 transition-colors text-xs font-medium disabled:opacity-30"
        >
          添加
        </button>
      </div>
    </div>
  )
}
