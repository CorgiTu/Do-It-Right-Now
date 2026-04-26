import { useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import type { Todo } from '../db/types'
import ConfirmDialog from './ConfirmDialog'
import DueDatePicker from './DueDatePicker'
import ReminderPicker from './ReminderPicker'

interface TaskItemProps {
  task: Todo
  isSelected?: boolean
  onToggleComplete?: () => void
}

export default function TaskItem({ task, isSelected = false, onToggleComplete }: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.content)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)
  const { toggleTaskSelection, updateTaskContent, deleteTask } = useTaskStore()

  const handleToggle = () => {
    toggleTaskSelection(task.id)
  }

  const handleCompleteToggle = () => {
    if (onToggleComplete) {
      onToggleComplete()
    }
  }

  const handleDoubleClick = () => {
    setEditing(true)
    setEditValue(task.content)
    setTimeout(() => editRef.current?.focus(), 0)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const trimmed = editValue.trim()
      if (trimmed) {
        updateTaskContent(task.id, { content: trimmed })
        setEditing(false)
      }
      // 空内容时保持编辑状态，不退出
    } else if (e.key === 'Escape') {
      setEditValue(task.content)
      setEditing(false)
    }
  }

  const handleEditBlur = () => {
    // 同 ESC 行为：恢复原内容，退出编辑模式
    setEditValue(task.content)
    setEditing(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    deleteTask(task.id)
    setShowDeleteDialog(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div
        data-testid="task-item"
        className={`group flex items-start gap-3 p-4 rounded-lg shadow-sm hover:shadow-md border border-[var(--color-border)] hover:border-[var(--color-accent-light)] transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'bg-[var(--color-accent-light)] bg-opacity-40'
            : task.completed
            ? 'bg-white'
            : 'bg-white'
        }`}
        onContextMenu={handleContextMenu}
      >
        <div className="mt-1 flex-shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggle}
            className="w-5 h-5 rounded border-[var(--color-accent-light)] text-[var(--color-accent)] focus:ring-[var(--color-accent-light)] focus:ring-offset-0 cursor-pointer"
          />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={editRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={handleEditBlur}
              className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-accent-light)] rounded text-[var(--color-text)] focus:outline-none"
            />
          ) : (
            <span
              onDoubleClick={handleDoubleClick}
              className={`block transition-colors duration-200 ${task.completed ? 'line-through text-[var(--color-text-light)]' : 'text-[var(--color-text)]'}`}
            >
              {task.content}
            </span>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[var(--color-text-light)] opacity-70">{formatDate(task.createdAt)}</span>
            <DueDatePicker taskId={task.id} dueDate={task.dueDate} />
            <ReminderPicker taskId={task.id} reminder={task.reminder} dueDate={task.dueDate} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleCompleteToggle}
            className="p-1.5 rounded hover:bg-[var(--color-hover)] transition-colors text-[var(--color-accent)] opacity-0 group-hover:opacity-100"
            title={task.completed ? '标记未完成' : '标记完成'}
          >
            ✓
          </button>
          <button
            onClick={() => {
              setEditing(true)
              setEditValue(task.content)
              setTimeout(() => editRef.current?.focus(), 0)
            }}
            className="p-1.5 rounded hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-light)] opacity-0 group-hover:opacity-100"
            title="编辑"
          >
            ✏️
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="确认删除"
        message="确定要删除此任务吗？"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}
