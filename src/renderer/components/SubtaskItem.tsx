import { useState, useRef } from 'react'
import type { Subtask } from '../db/types'

interface SubtaskItemProps {
  subtask: Subtask
  onToggle: () => void
  onDelete: () => void
}

export default function SubtaskItem({ subtask, onToggle, onDelete }: SubtaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(subtask.content)
  const editRef = useRef<HTMLInputElement>(null)

  const handleToggle = () => {
    onToggle()
  }

  const handleDoubleClick = () => {
    setEditing(true)
    setEditValue(subtask.content)
    setTimeout(() => editRef.current?.focus(), 0)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const trimmed = editValue.trim()
      if (trimmed) {
        onToggle()
      }
      setEditing(false)
    } else if (e.key === 'Escape') {
      setEditValue(subtask.content)
      setEditing(false)
    }
  }

  const handleEditBlur = () => {
    setEditValue(subtask.content)
    setEditing(false)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onDelete()
  }

  return (
    <div
      data-testid="subtask-item"
      className={`group flex items-center gap-2 py-2 px-3 rounded-md transition-colors duration-150 hover:bg-gray-50 ${
        subtask.completed ? 'opacity-60' : ''
      }`}
      onContextMenu={handleContextMenu}
    >
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={handleToggle}
        className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400 cursor-pointer"
      />
      {editing ? (
        <input
          ref={editRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditBlur}
          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded bg-white focus:outline-none focus:border-green-400"
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={`flex-1 text-sm cursor-pointer select-none ${
            subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'
          }`}
          title="双击编辑"
        >
          {subtask.content}
        </span>
      )}
      <button
        onClick={() => {
          if (confirm('确定要删除此子任务吗？')) {
            onDelete()
          }
        }}
        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        title="删除子任务"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
