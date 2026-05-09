import { useTaskStore } from '../store/taskStore'

interface FloatingActionButtonProps {
  onAddTask: () => void
  onDeleteSelected: (count: number) => void
}

export default function FloatingActionButton({ onAddTask, onDeleteSelected }: FloatingActionButtonProps) {
  const { selectedTaskIds, clearSelection } = useTaskStore()
  const selectedCount = selectedTaskIds.length

  if (selectedCount > 0) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white rounded-coinbase-pill shadow-lg border border-gray-200/60 px-4 py-2 animate-slide-up">
        <span className="text-sm text-gray-500">{selectedCount} 个已选</span>
        <button
          onClick={() => {
            clearSelection()
          }}
          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-coinbase-pill hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          取消选择
        </button>
        <button
          onClick={() => onDeleteSelected(selectedCount)}
          className="px-3 py-1.5 bg-coinbase-semantic-down text-white rounded-coinbase-pill hover:bg-coinbase-semantic-down/90 transition-colors text-sm font-semibold"
        >
          删除
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onAddTask}
        className="w-14 h-14 bg-coinbase-primary-btn text-white rounded-coinbase-full shadow-lg hover:bg-coinbase-primary-btn-hover hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        title="添加任务"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
