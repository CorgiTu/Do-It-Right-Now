import { useState, useEffect, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useTagStore } from '../store/tagStore'
import type { Todo } from '../db/types'
import DueDatePicker from './DueDatePicker'
import ReminderPicker from './ReminderPicker'
import TagPicker from './TagPicker'
import SubtaskList from './SubtaskList'
import ConfirmDialog from './ConfirmDialog'
import TaskTimeline from './TaskTimeline'

interface TaskDetailSidebarProps {
  showToast: (message: string) => void
}

export default function TaskDetailSidebar({ showToast }: TaskDetailSidebarProps) {
  const { selectedTaskId, deselectTask, tasks, updateTaskContent, deleteTask } = useTaskStore()
  const { tags, taskTagMap } = useTagStore()
  const [editValue, setEditValue] = useState('')
  const [originalValue, setOriginalValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const editRef = useRef<HTMLTextAreaElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null

  useEffect(() => {
    if (selectedTask) {
      setEditValue(selectedTask.content)
      setOriginalValue(selectedTask.content)
      setNotesValue(selectedTask.notes || '')
    }
  }, [selectedTask?.id])

  useEffect(() => {
    if (selectedTaskId && editRef.current) {
      editRef.current.focus()
    }
  }, [selectedTaskId])

  const handleSaveContent = async () => {
    const trimmed = editValue.trim()
    if (!trimmed) {
      showToast('任务内容不能为空')
      return
    }
    try {
      setIsSaving(true)
      await updateTaskContent(selectedTaskId!, { content: trimmed })
      setOriginalValue(trimmed)
      showToast('保存成功')
      deselectTask()
    } catch (error) {
      showToast('保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditValue(originalValue)
    deselectTask()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveContent()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleDeleteConfirm = async () => {
    await deleteTask(selectedTaskId!)
    setShowDeleteDialog(false)
    deselectTask()
    showToast('删除成功')
  }

  const handleClose = () => {
    deselectTask()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!selectedTaskId || !selectedTask) {
    return null
  }

  const taskTagIds = taskTagMap[selectedTask.id] || []
  const displayedTags = taskTagIds
    .map((id) => tags.find((t) => t.id === id))
    .filter(Boolean)

  const charCount = editValue.length
  const maxChars = 200

  return (
    <>
      <div
        ref={sidebarRef}
        className="fixed inset-y-0 right-0 w-[420px] bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl z-40 flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">任务详情</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-light)]"
            title="关闭"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Task Content */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">任务内容</label>
            <div className="relative">
              <textarea
                ref={editRef}
                value={editValue}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setEditValue(e.target.value)
                  }
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none text-base min-h-[80px]"
                maxLength={maxChars}
              />
              <div className="absolute bottom-2 right-2 text-xs text-[var(--color-text-light)]">
                {charCount}/{maxChars}
              </div>
            </div>
            {!editValue.trim() && (
              <p className="mt-1 text-xs text-red-500">任务内容不能为空</p>
            )}
          </div>

          {/* Due Date & Reminder */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--color-text)]">日期设置</label>
            <div className="flex items-center gap-3">
              <DueDatePicker taskId={selectedTask.id} dueDate={selectedTask.dueDate} />
              <ReminderPicker taskId={selectedTask.id} reminder={selectedTask.reminder} dueDate={selectedTask.dueDate} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">标签</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {displayedTags.map((tag) => tag && (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded text-xs text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <TagPicker
              taskId={selectedTask.id}
              currentTagIds={taskTagIds}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">备注</label>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={() => {
                if (notesValue !== selectedTask.notes) {
                  updateTaskContent(selectedTask.id, { notes: notesValue || null })
                }
              }}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none min-h-[100px]"
              placeholder="添加备注..."
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">子任务</label>
            <SubtaskList taskId={selectedTask.id} />
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">操作记录</label>
            <TaskTimeline taskId={selectedTask.id} />
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
            >
              删除任务
            </button>
          </div>

          {/* Created At */}
          <div className="text-xs text-[var(--color-text-light)] pb-4">
            创建于 {formatDate(selectedTask.createdAt)}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex gap-3">
          <button
            onClick={handleSaveContent}
            className="flex-1 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors text-sm font-medium"
          >
            保存
          </button>
          <button
            onClick={handleCancelEdit}
            className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-hover)] transition-colors text-sm"
          >
            取消
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="确认删除"
        message="确定要删除此任务吗？此操作不可撤销。"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  )
}
