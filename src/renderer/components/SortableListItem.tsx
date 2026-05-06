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

/**
 * SortableListItem - 分组项拖拽组件
 * 
 * 关键动画优化点：
 * 1. 使用 dnd-kit 的 useSortable hook 处理拖拽逻辑
 * 2. 被拖拽项通过 visibility: hidden 保持占位，维持侧边栏布局
 * 3. 让位动画由 dnd-kit 自动计算 transform，配合 CSS transition 实现平滑过渡
 * 4. 拖拽浮层由 DragOverlay 在 App.tsx 中统一渲染，脱离文档流
 * 5. 所有位移动画仅使用 transform，启用 GPU 加速
 */
export default function SortableListItem({ list, isSelected, onSelect, taskCount }: SortableListItemProps) {
  const { removeList, updateList } = useListStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  
  // 拖拽配置：与任务项一致的动画参数
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `list-${list.id}`,
    transition: {
      duration: 180,
      easing: 'ease-out',
    },
    resizeObserverConfig: {
      disabled: true, // 禁用避免抖动
    },
  })

  // 让位动画的 transform 样式
  const style = {
    transform: CSS.Transform.toString(transform),
    // transition 始终应用，dnd-kit 自动处理拖拽项的过渡
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
        {/* 
         * 占位条实现：
         * - isDragging 时隐藏内容，但保持元素尺寸
         * - pointerEvents: none 防止隐藏元素响应鼠标
         */}
        <div style={isDragging ? { 
          visibility: 'hidden',
          pointerEvents: 'none',
        } : {}}>
          <div className="flex items-center gap-1">
            <div
              {...listeners}
              {...attributes}
              className="drag-handle p-1 rounded hover:bg-[var(--color-hover)]"
            >
              <svg className="w-4 h-4 text-[var(--color-text-light)]" viewBox="0 0 24 24" fill="currentColor">
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
              className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                isSelected
                  ? 'bg-[var(--color-accent-light)] bg-opacity-60 text-[var(--color-text)]'
                  : 'hover:bg-[var(--color-hover)] text-[var(--color-text-light)] hover:text-[var(--color-text)]'
              }`}
            >
              <button
                ref={colorButtonRef}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowColorPicker(!showColorPicker)
                }}
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 hover:ring-2 hover:ring-[var(--color-accent)] hover:ring-offset-1 transition-all cursor-pointer"
                style={{ backgroundColor: list.color }}
                title="修改颜色"
              />
              <span className="text-sm truncate flex-1">{list.name}</span>
              <span className="text-xs opacity-70">{taskCount}</span>
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
