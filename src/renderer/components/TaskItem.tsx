import { useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useTagStore } from '../store/tagStore'
import type { Todo } from '../db/types'
import ConfirmDialog from './ConfirmDialog'
import DueDatePicker from './DueDatePicker'
import ReminderPicker from './ReminderPicker'
import TagPicker from './TagPicker'

interface TaskItemProps {
  task: Todo
  isSelected?: boolean
  onToggleComplete?: () => void
  dragHandleProps?: {
    listeners: any
    attributes: Record<string, any>
  }
}

export default function TaskItem({ task, isSelected = false, onToggleComplete, dragHandleProps }: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.content)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [autoOpenTagPicker, setAutoOpenTagPicker] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)
  const tagPickerOpenRef = useRef(false)
  const { toggleTaskSelection, updateTaskContent, deleteTask } = useTaskStore()
  const tags = useTagStore((state) => state.tags)
  const taskTagMap = useTagStore((state) => state.taskTagMap)

  const taskTagIds = taskTagMap[task.id] || []
  const displayedTags = taskTagIds
    .slice(0, 3)
    .map((id) => tags.find((t) => t.id === id))
    .filter(Boolean)
  const remainingCount = Math.max(0, taskTagIds.length - 3)

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
      }
      setEditing(false)
      setAutoOpenTagPicker(false)
    } else if (e.key === 'Escape') {
      setEditValue(task.content)
      setEditing(false)
      setAutoOpenTagPicker(false)
    }
  }

  const handleEditBlur = () => {
    if (tagPickerOpenRef.current) {
      return
    }
    setEditValue(task.content)
    setEditing(false)
    setAutoOpenTagPicker(false)
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
        className={`sortable-item group flex items-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 ${
          isSelected
            ? 'bg-[var(--color-accent-light)] bg-opacity-40 border-[var(--color-accent)]'
            : task.completed
            ? 'bg-white border-[var(--color-border)]'
            : 'bg-white border-[var(--color-border)]'
        } ${dragHandleProps ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}`}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        {dragHandleProps && (
          <div
            {...dragHandleProps.listeners}
            {...dragHandleProps.attributes}
            className="drag-handle mt-1 flex-shrink-0 p-1.5 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            title="拖动排序"
          >
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </div>
        )}
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggle}
            className="w-5 h-5 rounded border-[var(--color-accent-light)] text-[var(--color-accent)] focus:ring-[var(--color-accent-light)] focus:ring-offset-0 cursor-pointer"
          />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                ref={editRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleEditBlur}
                className="w-full px-3 py-2 border border-[var(--color-accent-light)] rounded bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none text-base"
              />
              <TagPicker
                taskId={task.id}
                currentTagIds={taskTagIds}
                initialOpen={autoOpenTagPicker}
                onOpenChange={(open) => {
                  tagPickerOpenRef.current = open
                }}
                onChange={(tagIds) => {
                  setAutoOpenTagPicker(false)
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                onDoubleClick={handleDoubleClick}
                className={`block cursor-pointer ${task.completed ? 'line-through text-[var(--color-text-light)]' : 'text-[var(--color-text)]'}`}
                title="双击编辑"
              >
                {task.content}
              </span>
              {task.isRecurring && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200" title="每日重复">
                  🔄 每日
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[var(--color-text-light)] opacity-70">{formatDate(task.createdAt)}</span>
            <DueDatePicker taskId={task.id} dueDate={task.dueDate} />
            <ReminderPicker taskId={task.id} reminder={task.reminder} dueDate={task.dueDate} />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {displayedTags.map((tag) => tag && (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs text-white"
                style={{ backgroundColor: tag.color }}
                title={tag.name}
              >
                {tag.name.length > 8 ? `${tag.name.slice(0, 8)}...` : tag.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-400 text-white">
                +{remainingCount}
              </span>
            )}
            {!editing && taskTagIds.length < 10 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  tagPickerOpenRef.current = true
                  setEditing(true)
                  setEditValue(task.content)
                  setAutoOpenTagPicker(true)
                  setTimeout(() => editRef.current?.focus(), 0)
                }}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs border border-dashed border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                title="添加标签"
              >
                + 标签
              </button>
            )}
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
