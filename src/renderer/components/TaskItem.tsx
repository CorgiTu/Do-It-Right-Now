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

  const handleCheckboxChange = () => {
    if (onToggleComplete) {
      onToggleComplete()
    } else {
      toggleTask(task.id)
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
        className={`sortable-item group flex items-start gap-3 p-4 rounded-coinbase-lg transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'bg-coinbase-primary/5 shadow-sm border border-coinbase-primary/20'
            : task.completed
            ? 'bg-gray-50/40 shadow-sm opacity-60'
            : 'bg-white shadow-sm border border-transparent hover:border-gray-200/60'
        } ${dragHandleProps ? 'hover:shadow-md hover:-translate-y-0.5' : ''}`}
        onClick={handleTaskClick}
      >
        {dragHandleProps && (
          <div
            {...dragHandleProps.listeners}
            {...dragHandleProps.attributes}
            className="drag-handle mt-1 flex-shrink-0 p-1.5 rounded-coinbase-sm hover:bg-coinbase-surface-strong cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            title="拖动排序"
          >
            <svg className="w-4 h-4 text-coinbase-muted-soft" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </div>
        )}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleCheckboxChange}
            className="w-5 h-5 rounded-coinbase-xs border-coinbase-hairline text-coinbase-primary focus:ring-coinbase-primary/20 cursor-pointer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`block text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}
            >
              {task.content}
            </span>
            {task.isRecurring && (
              <span className="text-xs text-coinbase-semantic-up bg-coinbase-semantic-up/5 px-2 py-0.5 rounded-md border border-coinbase-semantic-up/10" title="重复任务">
                🔄 {getRecurrenceDescription({ pattern: task.recurrencePattern, interval: 1 })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">{formatDate(task.createdAt)}</span>
            <DueDatePicker taskId={task.id} dueDate={task.dueDate} />
            <ReminderPicker taskId={task.id} reminder={task.reminder} dueDate={task.dueDate} />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {displayedTags.map((tag) => tag && (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100/80 border border-gray-200/50"
              >
                <span className="w-1.5 h-1.5 rounded-coinbase-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                {tag.name.length > 8 ? `${tag.name.slice(0, 8)}...` : tag.name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-200/60 text-gray-500">+{remainingCount}</span>
            )}
          </div>
          {hasSubtasks && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-coinbase-muted mb-1">
                <span>子任务进度</span>
                <span>{subtaskStats.completed}/{subtaskStats.total}</span>
              </div>
              <div className="w-full h-1.5 bg-coinbase-hairline-soft rounded-coinbase-full overflow-hidden">
                <div
                  className={`h-full rounded-coinbase-full transition-all duration-300 ${
                    subtaskProgress === 100 ? 'bg-coinbase-semantic-up' : 'bg-coinbase-primary'
                  }`}
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            </div>
          )}
          <SubtaskList taskId={task.id} />
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-coinbase-muted cursor-pointer">
              <input
                type="checkbox"
                checked={task.autoCompleteOnSubtasksDone || false}
                onChange={(e) => {
                  e.stopPropagation()
                  const { updateTaskContent } = useTaskStore.getState()
                  updateTaskContent(task.id, { autoCompleteOnSubtasksDone: e.target.checked })
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-3 h-3 rounded-coinbase-xs border-coinbase-hairline text-coinbase-semantic-up focus:ring-coinbase-semantic-up/20"
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
            className="p-1.5 rounded-coinbase-sm hover:bg-coinbase-surface-strong transition-colors text-coinbase-muted opacity-0 group-hover:opacity-100"
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
