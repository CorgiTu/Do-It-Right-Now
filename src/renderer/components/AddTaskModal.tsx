import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import TagPicker from './TagPicker'
import { useTagStore } from '../store/tagStore'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  listId?: string
}

export default function AddTaskModal({ isOpen, onClose, listId }: AddTaskModalProps) {
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { addTask } = useTaskStore()
  const tags = useTagStore((state) => state.tags)
  const taskTagMap = useTagStore((state) => state.taskTagMap)

  useEffect(() => {
    if (isOpen) {
      setContent('')
      setSelectedTagIds([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) return

    await addTask(trimmed, listId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-coinbase-surface-card rounded-coinbase-xl shadow-coinbase-hover border border-coinbase-hairline p-5 max-w-lg w-full mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-coinbase-ink">添加任务</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-coinbase-sm hover:bg-coinbase-surface-strong transition-colors text-coinbase-muted"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') onClose()
            }}
            placeholder="输入任务内容..."
            className="w-full px-4 py-3 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-md text-coinbase-body placeholder-coinbase-muted-soft focus:outline-none focus:ring-2 focus:ring-coinbase-primary/20 focus:border-coinbase-primary transition-all"
            maxLength={200}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-coinbase-body-strong mb-2">标签</label>
          <TagPicker
            taskId=""
            currentTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="flex-1 px-4 py-2.5 bg-coinbase-primary-btn text-white rounded-coinbase-pill hover:bg-coinbase-primary-btn-hover transition-colors text-sm font-semibold disabled:opacity-40"
          >
            添加
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-coinbase-hairline text-coinbase-body rounded-coinbase-pill hover:bg-coinbase-surface-strong transition-colors text-sm font-medium"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
