import { useState, useEffect, useRef } from 'react'
import { useSubtaskStore } from '../store/subtaskStore'
import SubtaskItem from './SubtaskItem'

interface SubtaskListProps {
  taskId: string
  initialOpen?: boolean
}

export default function SubtaskList({ taskId, initialOpen = false }: SubtaskListProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [newSubtaskContent, setNewSubtaskContent] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { subtaskMap, loadSubtasks, addSubtask, toggleSubtask, deleteSubtask, getSubtaskStats } = useSubtaskStore()

  const subtasks = subtaskMap[taskId] || []
  const stats = getSubtaskStats(taskId)

  useEffect(() => {
    loadSubtasks(taskId)
  }, [taskId])

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  const handleAddSubtask = () => {
    const trimmed = newSubtaskContent.trim()
    if (trimmed) {
      addSubtask(taskId, trimmed)
      setNewSubtaskContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask()
    } else if (e.key === 'Escape') {
      setNewSubtaskContent('')
      setIsAdding(false)
    }
  }

  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-full"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span>子任务</span>
        {stats.total > 0 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {stats.completed}/{stats.total}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-2">
          {stats.total > 0 && (
            <div className="mb-3">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            {subtasks.map((subtask) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                onToggle={() => toggleSubtask(subtask.id, taskId)}
                onDelete={() => deleteSubtask(subtask.id, taskId)}
              />
            ))}
          </div>

          {isAdding ? (
            <div className="flex items-center gap-2 mt-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={newSubtaskContent}
                onChange={(e) => setNewSubtaskContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddSubtask}
                placeholder="添加子任务..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:border-green-400"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>添加子任务</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
