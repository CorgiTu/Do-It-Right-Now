import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  listId?: string
}

export default function AddTaskModal({ isOpen, onClose, listId }: AddTaskModalProps) {
  const [content, setContent] = useState('')
  const { addTask } = useTaskStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleAdd = async () => {
    const trimmed = content.trim()
    if (trimmed) {
      await addTask(trimmed, listId)
      setContent('')
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-[var(--color-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] max-w-md w-full mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">添加任务</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-light)]"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入任务内容..."
            className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-accent-light)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
          />
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-hover)] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
