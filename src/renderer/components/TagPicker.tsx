import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTagStore } from '../store/tagStore'
import { TAG_COLORS } from '../db/types'

interface TagPickerProps {
  taskId: string
  currentTagIds: string[]
  onChange: (tagIds: string[]) => void
  initialOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function TagPicker({ taskId, currentTagIds, onChange, initialOpen = false, onOpenChange }: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [searchValue, setSearchValue] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0])
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialOpen) {
      setIsOpen(true)
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
        })
      }
      onOpenChange?.(true)
    }
  }, [initialOpen])

  const tags = useTagStore((state) => state.tags)
  const addTagToTask = useTagStore((state) => state.addTagToTask)
  const removeTagFromTask = useTagStore((state) => state.removeTagFromTask)
  const createTag = useTagStore((state) => state.createTag)

  const isAtLimit = currentTagIds.length >= 10

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-tagpicker]')) {
        setIsOpen(false)
        setSearchValue('')
        setShowColorPicker(false)
        onOpenChange?.(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const updatePosition = () => {
    if (!isOpen || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const dropdownHeight = 320
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top: number
    if (spaceBelow >= dropdownHeight) {
      top = rect.bottom + 8
    } else if (spaceAbove >= dropdownHeight) {
      top = rect.top - dropdownHeight - 8
    } else {
      top = spaceBelow > spaceAbove ? rect.bottom + 8 : rect.top - dropdownHeight - 8
    }

    setPosition({
      top,
      left: rect.left,
    })
  }

  useEffect(() => {
    if (!isOpen) return
    updatePosition()

    const scrollContainers = document.querySelectorAll('main, [class*="overflow"]')
    const handleScroll = () => updatePosition()

    scrollContainers.forEach(el => el.addEventListener('scroll', handleScroll, true))
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      scrollContainers.forEach(el => el.removeEventListener('scroll', handleScroll, true))
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = 320
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      let top: number
      if (spaceBelow >= dropdownHeight) {
        top = rect.bottom + 8
      } else if (spaceAbove >= dropdownHeight) {
        top = rect.top - dropdownHeight - 8
      } else {
        top = spaceBelow > spaceAbove ? rect.bottom + 8 : rect.top - dropdownHeight - 8
      }

      setPosition({
        top,
        left: rect.left,
      })
    }
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    setSearchValue('')
    setShowColorPicker(false)
    onOpenChange?.(nextOpen)
  }

  const handleTagClick = async (tagId: string) => {
    if (currentTagIds.includes(tagId)) {
      await removeTagFromTask(taskId, tagId)
      onChange(currentTagIds.filter((id) => id !== tagId))
    } else {
      if (isAtLimit) return
      await addTagToTask(taskId, tagId)
      onChange([...currentTagIds, tagId])
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromTask(taskId, tagId)
    onChange(currentTagIds.filter((id) => id !== tagId))
  }

  const handleCreateTag = async () => {
    const trimmed = searchValue.trim()
    if (!trimmed) return

    const result = await createTag(trimmed, selectedColor)
    if (result.success) {
      setSearchValue('')
      setShowColorPicker(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const trimmed = searchValue.trim()
      if (trimmed && !tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
        handleCreateTag()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchValue('')
    }
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const currentTags = tags.filter((tag) => currentTagIds.includes(tag.id))

  return (
    <>
      <div data-tagpicker>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          onMouseDown={(e) => e.preventDefault()}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors text-[var(--color-text-light)] hover:text-[var(--color-accent)]"
        >
          <span className="text-sm">🏷️</span>
          <span>
            {currentTagIds.length > 0 ? `${currentTagIds.length} 标签` : '添加标签'}
          </span>
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            data-tagpicker
            className="fixed z-[999] w-72 bg-white rounded-lg shadow-xl border border-[var(--color-border)] p-3"
            style={{ top: position.top, left: position.left }}
          >
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="搜索或创建标签"
                  className="flex-1 px-2 py-1 text-sm border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {searchValue &&
                !tags.some((t) => t.name.toLowerCase() === searchValue.toLowerCase()) && (
                  <div className="mb-2">
                    {!showColorPicker ? (
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(true)}
                        className="w-full text-left text-xs text-[var(--color-accent)] hover:underline"
                      >
                        + 创建标签 "{searchValue}"
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {TAG_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setSelectedColor(color)}
                              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                selectedColor === color ? 'border-[var(--color-text)] scale-110' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateTag}
                            className="px-2 py-1 text-xs bg-[var(--color-accent)] text-white rounded hover:opacity-90"
                          >
                            确认创建
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowColorPicker(false)}
                            className="px-2 py-1 text-xs text-[var(--color-text-light)] hover:underline"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {tags.length === 0 ? (
              <div className="text-center py-4 text-sm text-[var(--color-text-light)]">
                <p className="mb-2">暂无标签</p>
                <p className="text-xs opacity-70">在上方输入标签名称并按回车创建</p>
              </div>
            ) : (
              <div className="border-t border-[var(--color-border)] pt-2">
                <p className="text-xs text-[var(--color-text-light)] mb-2">选择标签：</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredTags.length === 0 && searchValue ? (
                    <p className="text-xs text-[var(--color-text-light)] text-center py-2">
                      没有找到匹配的标签
                    </p>
                  ) : (
                    filteredTags.map((tag) => {
                      const isSelected = currentTagIds.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagClick(tag.id)}
                          onMouseDown={(e) => e.preventDefault()}
                          className={`w-full text-left px-2 py-1 rounded text-sm flex items-center gap-2 transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-accent-light)] bg-opacity-40'
                              : 'hover:bg-[var(--color-hover)]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="flex-1 truncate">{tag.name}</span>
                          <span className="text-xs text-[var(--color-text-light)] opacity-60">
                            {tag.usageCount}
                          </span>
                          {isSelected && <span className="text-[var(--color-accent)]">✓</span>}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {isAtLimit && (
              <p className="text-xs text-red-500 mt-2 text-center">标签数量已达上限（10 个）</p>
            )}
          </div>,
          document.body
        )}

      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {currentTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: tag.color }}
              title={tag.name}
            >
              {tag.name.length > 8 ? `${tag.name.slice(0, 8)}...` : tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-0.5 hover:opacity-70"
                title="移除标签"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  )
}
