import { useState, useRef } from 'react'
import { useSubtaskStore } from '../store/subtaskStore'
import type { Subtask } from '../db/types'

interface SubtaskItemProps {
  subtask: Subtask
}

export default function SubtaskItem({ subtask }: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(subtask.content)
  const { toggleSubtask, deleteSubtask, updateSubtaskContent } = useSubtaskStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    toggleSubtask(subtask.id, subtask.taskId)
  }

  const handleDelete = () => {
    deleteSubtask(subtask.id, subtask.taskId)
  }

  const handleDoubleClick = () => {
    setEditValue(subtask.content)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== subtask.content) {
      updateSubtaskContent(subtask.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(subtask.content)
    }
  }

  return (
    <div className="group flex items-center gap-2 px-1 py-1.5 rounded-coinbase-xs hover:bg-coinbase-surface-soft transition-colors">
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={handleToggle}
        className="w-4 h-4 rounded-coinbase-xs border-coinbase-hairline text-coinbase-primary focus:ring-coinbase-primary/20 flex-shrink-0 cursor-pointer"
      />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-0.5 bg-coinbase-canvas border border-coinbase-hairline rounded-coinbase-xs text-sm text-coinbase-body transition-all"
          autoFocus
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer ${
            subtask.completed
              ? 'line-through text-coinbase-muted-soft'
              : 'text-coinbase-body'
          }`}
          onDoubleClick={handleDoubleClick}
          title="双击编辑"
        >
          {subtask.content}
        </span>
      )}

      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-coinbase-xs hover:bg-coinbase-surface-strong transition-all text-coinbase-muted-soft hover:text-coinbase-semantic-down"
        title="删除子任务"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
