import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, useRef } from 'react'
import { useListStore } from '../store/listStore'
import type { TodoList } from '../db/types'
import ListColorPicker from './ListColorPicker'
import ConfirmDialog from './ConfirmDialog'

interface SortableListItemProps {
  list: TodoList
  isSelected: boolean
  onSelect: () => void
  taskCount: number
}

export default function SortableListItem({ list, isSelected, onSelect, taskCount }: SortableListItemProps) {
  const { removeList, updateList } = useListStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorButtonRef = useRef<HTMLButtonElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `list-${list.id}`,
    transition: {
      duration: 180,
      easing: 'ease-out',
    },
    resizeObserverConfig: {
      disabled: true,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 180ms ease-out',
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (list.name === '默认分组') return
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    removeList(list.id)
    setShowDeleteDialog(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  const handleColorChange = (color: string) => {
    updateList(list.id, { color })
    setShowColorPicker(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="sortable-list-item group"
      >
        <div style={isDragging ? {
          visibility: 'hidden',
          pointerEvents: 'none',
        } : {}}>
          <div className="flex items-center gap-1">
            <div
              {...listeners}
              {...attributes}
              className="drag-handle p-1 rounded-coinbase-xs hover:bg-coinbase-surface-strong"
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
            <button
              onClick={onSelect}
              onContextMenu={handleContextMenu}
              className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-coinbase-sm transition-all text-left ${
                isSelected
                  ? 'bg-coinbase-primary/10 text-coinbase-ink font-medium'
                  : 'hover:bg-coinbase-surface-strong text-coinbase-muted hover:text-coinbase-body'
              }`}
            >
              <button
                ref={colorButtonRef}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowColorPicker(!showColorPicker)
                }}
                className="w-3 h-3 rounded-coinbase-full flex-shrink-0 hover:ring-2 hover:ring-gray-900/30 hover:ring-offset-1 transition-all cursor-pointer"
                style={{ backgroundColor: list.color }}
                title="修改颜色"
              />
              <span className="text-sm truncate flex-1">{list.name}</span>
              <span className="text-xs text-gray-400">{taskCount}</span>
            </button>
          </div>
        </div>
      </div>
      {showColorPicker && (
        <ListColorPicker
          currentColor={list.color}
          onColorSelect={handleColorChange}
          onClose={() => setShowColorPicker(false)}
          anchorRef={colorButtonRef}
        />
      )}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="确认删除"
        message={`确定要删除分组"${list.name}"吗？分组内的任务不会被删除。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}
