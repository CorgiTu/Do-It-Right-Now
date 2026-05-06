import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useTagStore } from '../store/tagStore'
import { useSubtaskStore } from '../store/subtaskStore'
import type { Todo } from '../db/types'
import ConfirmDialog from './ConfirmDialog'
import DueDatePicker from './DueDatePicker'
import ReminderPicker from './ReminderPicker'
import SubtaskList from './SubtaskList'
import RecurrencePicker from './RecurrencePicker'
import { getRecurrenceDescription } from '../utils/recurrence'

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { selectTask, toggleTask, deleteTask } = useTaskStore()
  const tags = useTagStore((state) => state.tags)
  const taskTagMap = useTagStore((state) => state.taskTagMap)
  const { loadSubtasks, getSubtaskStats } = useSubtaskStore()

  const taskTagIds = taskTagMap[task.id] || []
  const displayedTags = taskTagIds
    .slice(0, 3)
    .map((id) => tags.find((t) => t.id === id))
    .filter(Boolean)
  const remainingCount = Math.max(0, taskTagIds.length - 3)

  const subtaskStats = getSubtaskStats(task.id)
  const hasSubtasks = subtaskStats.total > 0
  const subtaskProgress = hasSubtasks ? Math.round((subtaskStats.completed / subtaskStats.total) * 100) : 0
  const allSubtasksCompleted = hasSubtasks && subtaskStats.completed === subtaskStats.total

  useEffect(() => {
    loadSubtasks(task.id)
  }, [task.id])

  useEffect(() => {
    if (task.autoCompleteOnSubtasksDone && allSubtasksCompleted && !task.completed) {
      toggleTask(task.id)
    }
  }, [allSubtasksCompleted, task.autoCompleteOnSubtasksDone, task.completed, task.id])

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleTask(task.id)
    if (onToggleComplete) {
      onToggleComplete()
    }
  }

  const handleTaskClick = () => {
    selectTask(task.id)
  }

  const handleDeleteConfirm = () => {
    deleteTask(task.id)
    setShowDeleteDialog(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div
        data-testid="task-item"
        className={`sortable-item group flex items-start gap-3 p-4 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'bg-[var(--color-accent-light)] bg-opacity-40 border-[var(--color-accent)]'
            : task.completed
            ? 'bg-gray-50 border-[var(--color-border)]'
            : 'bg-white border-[var(--color-border)]'
        } ${dragHandleProps ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}`}
        onClick={handleTaskClick}
      >
        {dragHandleProps && (
          <div
            {...dragHandleProps.listeners}
            {...dragHandleProps.attributes}
            className="drag-handle mt-1 flex-shrink-0 p-1.5 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
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
            checked={task.completed}
            onChange={handleCheckboxClick}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-[var(--color-accent-light)] text-[var(--color-accent)] focus:ring-[var(--color-accent-light)] focus:ring-offset-0 cursor-pointer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`block ${task.completed ? 'line-through text-[var(--color-text-light)]' : 'text-[var(--color-text)]'}`}
            >
              {task.content}
            </span>
            {task.isRecurring && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200" title="重复任务">
                🔄 {getRecurrenceDescription({ pattern: task.recurrencePattern, interval: 1 })}
              </span>
            )}
          </div>
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
          </div>
          {hasSubtasks && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>子任务进度</span>
                <span>{subtaskStats.completed}/{subtaskStats.total}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    subtaskProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            </div>
          )}
          <SubtaskList taskId={task.id} />
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={task.autoCompleteOnSubtasksDone || false}
                onChange={(e) => {
                  e.stopPropagation()
                  const { updateTaskContent } = useTaskStore.getState()
                  updateTaskContent(task.id, { autoCompleteOnSubtasksDone: e.target.checked })
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-3 h-3 rounded border-gray-300 text-green-500 focus:ring-green-400"
              />
              <span>所有子任务完成后自动完成</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteDialog(true)
            }}
            className="p-1.5 rounded hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-light)] opacity-0 group-hover:opacity-100"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="确认删除"
        message="确定要删除此任务吗？"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  )
}
