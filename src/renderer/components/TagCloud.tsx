import { useState, useRef, useEffect } from 'react'
import { useTagStore } from '../store/tagStore'
import { TAG_COLORS } from '../db/types'

export default function TagCloud() {
  const tags = useTagStore((state) => state.tags)
  const selectedTagIds = useTagStore((state) => state.selectedTagIds)
  const selectTag = useTagStore((state) => state.selectTag)
  const clearTagFilter = useTagStore((state) => state.clearTagFilter)
  const updateTag = useTagStore((state) => state.updateTag)
  const deleteTag = useTagStore((state) => state.deleteTag)
  const getTaskTags = useTagStore((state) => state.getTaskTags)
  const createTag = useTagStore((state) => state.createTag)

  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tagId: string } | null>(null)
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; color: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ tagId: string; taskCount: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const newTagInputRef = useRef<HTMLInputElement>(null)

  const hasActiveFilter = selectedTagIds.length > 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (editingTag && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingTag])

  useEffect(() => {
    if (isCreating && newTagInputRef.current) {
      newTagInputRef.current.focus()
    }
  }, [isCreating])

  const handleCreateNewTag = async () => {
    const trimmed = newTagName.trim()
    if (!trimmed) return

    const result = await createTag(trimmed, newTagColor)
    if (result.success) {
      setIsCreating(false)
      setNewTagName('')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, tagId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tagId })
  }

  const handleEdit = () => {
    if (!contextMenu) return
    const tag = tags.find((t) => t.id === contextMenu.tagId)
    if (tag) {
      setEditingTag({ id: tag.id, name: tag.name, color: tag.color })
    }
    setContextMenu(null)
  }

  const handleDelete = () => {
    if (!contextMenu) return
    const taskTags = getTaskTags(contextMenu.tagId)
    const taskCount = taskTags.length

    if (taskCount > 0) {
      setShowDeleteConfirm({ tagId: contextMenu.tagId, taskCount })
    } else {
      deleteTag(contextMenu.tagId)
    }
    setContextMenu(null)
  }

  const handleSaveEdit = () => {
    if (!editingTag) return
    const trimmed = editingTag.name.trim()
    if (trimmed) {
      updateTag(editingTag.id, { name: trimmed })
    }
    setEditingTag(null)
  }

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      deleteTag(showDeleteConfirm.tagId)
      setShowDeleteConfirm(null)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider">
          标签
        </h3>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearTagFilter}
            className="text-xs text-[var(--color-accent)] hover:underline"
          >
            清除筛选
          </button>
        )}
      </div>

      {tags.length === 0 && !isCreating && (
        <div className="py-2">
          <p className="text-xs text-[var(--color-text-light)] opacity-60 mb-2">暂无标签</p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
          >
            <span>+</span> 创建标签
          </button>
        </div>
      )}

      {isCreating && (
        <div className="mb-2 space-y-2">
          <div className="flex gap-2">
            <input
              ref={newTagInputRef}
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNewTag()
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setNewTagName('')
                }
              }}
              placeholder="标签名称"
              maxLength={20}
              className="flex-1 px-2 py-1 text-xs border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={handleCreateNewTag}
              disabled={!newTagName.trim()}
              className="px-2 py-1 text-xs text-white bg-[var(--color-accent)] rounded disabled:opacity-50"
            >
              创建
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setNewTagName('')
              }}
              className="px-2 py-1 text-xs text-[var(--color-text-light)] hover:underline"
            >
              取消
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {TAG_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewTagColor(color)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  newTagColor === color ? 'border-[var(--color-text)] scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => selectTag(tag.id)}
                onContextMenu={(e) => handleContextMenu(e, tag.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-150 ${
                  isSelected
                    ? 'ring-2 ring-offset-1'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                  color: isSelected ? '#fff' : tag.color,
                  ringColor: tag.color,
                }}
                title={tag.name}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#fff' : tag.color }}
                />
                <span className="truncate max-w-[80px]">{tag.name}</span>
                <span className="opacity-60 text-[10px]">{tag.usageCount}</span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            <span>+</span>
          </button>
        </div>
      )}

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-[var(--color-border)] py-1 min-w-[120px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            type="button"
            onClick={handleEdit}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--color-hover)] transition-colors"
          >
            编辑标签
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            删除标签
          </button>
        </div>
      )}

      {editingTag && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 min-w-[300px] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">编辑标签</h3>
            <input
              ref={inputRef}
              type="text"
              value={editingTag.name}
              onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit()
                if (e.key === 'Escape') setEditingTag(null)
              }}
              placeholder="标签名称"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded text-sm focus:outline-none focus:border-[var(--color-accent)] mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTag(null)}
                className="px-4 py-1.5 text-sm text-[var(--color-text-light)] hover:underline"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-sm text-white bg-[var(--color-accent)] rounded hover:opacity-90"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 min-w-[340px] border border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">确认删除</h3>
            <p className="text-sm text-[var(--color-text-light)] mb-4">
              此标签关联 {showDeleteConfirm.taskCount} 个任务，删除后这些任务将失去此标签。
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-1.5 text-sm text-[var(--color-text-light)] hover:underline"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
