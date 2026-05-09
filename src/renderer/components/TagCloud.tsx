import { useState, useRef } from 'react'
import { useTagStore } from '../store/tagStore'
import ConfirmDialog from './ConfirmDialog'

const TAG_COLORS = ['#0052FF', '#05B169', '#F4B000', '#CF202F', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

export default function TagCloud() {
  const { tags, createTag, deleteTag } = useTagStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleCreate = () => {
    if (!newTagName.trim()) return
    createTag(newTagName.trim(), newTagColor)
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0])
    setIsCreating(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-3">
        <span className="text-xs font-semibold text-coinbase-muted uppercase tracking-wider">标签</span>
        <button
          onClick={() => {
            setIsCreating(!isCreating)
            setTimeout(() => inputRef.current?.focus(), 100)
          }}
          className="p-1 rounded-coinbase-xs hover:bg-coinbase-surface-strong transition-colors text-coinbase-muted-soft hover:text-coinbase-body"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {isCreating && (
        <div className="mb-3 px-3 space-y-2 animate-slide-up">
          <input
            ref={inputRef}
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') setIsCreating(false)
            }}
            placeholder="标签名称"
            className="w-full px-3 py-1.5 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-md text-xs text-coinbase-body placeholder-coinbase-muted-soft"
          />
          <div className="flex flex-wrap gap-1.5">
            {TAG_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`w-5 h-5 rounded-coinbase-full transition-all ${
                  newTagColor === color ? 'ring-2 ring-coinbase-primary ring-offset-1 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleCreate}
              disabled={!newTagName.trim()}
              className="flex-1 px-2 py-1.5 bg-coinbase-primary-btn text-white rounded-coinbase-pill hover:bg-coinbase-primary-btn-hover transition-colors text-xs font-semibold disabled:opacity-40"
            >
              创建
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 px-2 py-1.5 bg-coinbase-surface-strong text-coinbase-body rounded-coinbase-pill hover:bg-coinbase-hairline transition-colors text-xs font-medium"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 px-3">
        {tags.length === 0 ? (
          <span className="text-xs text-coinbase-muted-soft px-1">暂无标签</span>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="relative group/tag">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-coinbase-md text-xs font-medium bg-gray-100/80 border border-gray-200/50"
              >
                <span className="w-2 h-2 rounded-coinbase-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                {tag.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(tag.id)
                  }}
                  className="ml-1.5 hover:opacity-80 opacity-60 transition-opacity"
                  title="删除标签"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="删除标签"
        message="确定要删除此标签吗？"
        onConfirm={() => {
          if (deleteTarget) {
            deleteTag(deleteTarget)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
