import { useState } from 'react'
import { useListStore } from '../store/listStore'

interface ListManagerProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

const LIST_COLORS = [
  '#0052FF',
  '#05B169',
  '#F4B000',
  '#CF202F',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
]

export default function ListManager({ isOpen, onClose, onOpen }: ListManagerProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(LIST_COLORS[0])
  const { addList } = useListStore()

  const handleSubmit = async () => {
    if (!name.trim()) return
    await addList(name.trim(), selectedColor, 'list')
    setName('')
    setSelectedColor(LIST_COLORS[0])
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (!isOpen) {
    return (
      <div className="p-4 border-t border-gray-200/60">
        <button
          onClick={onOpen}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-coinbase-pill bg-coinbase-primary-btn text-white hover:bg-coinbase-primary-btn-hover transition-colors text-sm font-semibold justify-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新建分组
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 border-t border-gray-200/60 bg-gray-50/60">
      <h3 className="text-sm font-semibold text-coinbase-ink mb-3">新建分组</h3>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="分组名称"
          className="w-full px-3 py-2 bg-coinbase-canvas border border-coinbase-hairline rounded-coinbase-md text-sm text-coinbase-body placeholder-coinbase-muted-soft transition-all duration-200"
          autoFocus
        />
        <div className="flex gap-2">
          {LIST_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-7 h-7 rounded-coinbase-full transition-all ${
                  selectedColor === color
                    ? 'ring-2 ring-gray-900 ring-offset-2 scale-110'
                    : 'hover:scale-110'
                }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 px-3 py-2 bg-coinbase-primary-btn text-white rounded-coinbase-pill hover:bg-coinbase-primary-btn-hover transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            创建
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-coinbase-surface-strong text-coinbase-body rounded-coinbase-pill hover:bg-coinbase-hairline transition-colors text-sm font-medium"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
