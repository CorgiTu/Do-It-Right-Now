import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import ConfirmDialog from './ConfirmDialog'

interface FloatingActionButtonProps {
  onAddTask: () => void
  onDeleteSelected: (count: number) => Promise<void>
}

export default function FloatingActionButton({ onAddTask, onDeleteSelected }: FloatingActionButtonProps) {
  const { selectedCount } = useTaskStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleClick = () => {
    if (selectedCount > 0) {
      setShowDeleteConfirm(true)
    } else {
      onAddTask()
    }
  }

  const handleDeleteConfirm = async () => {
    const count = selectedCount
    await onDeleteSelected(count)
    setShowDeleteConfirm(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-accent)] text-white text-2xl shadow-lg hover:bg-[var(--color-accent-hover)] hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center z-40"
        title={selectedCount > 0 ? '删除选中的任务' : '添加任务'}
      >
        {selectedCount > 0 ? (
          <span className="text-sm font-medium">删除</span>
        ) : (
          '➕'
        )}
      </button>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="确认删除"
        message={`确定要删除 ${selectedCount} 个任务吗？此操作不可恢复。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}
