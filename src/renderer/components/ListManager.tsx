import { useState } from 'react'
import { useListStore } from '../store/listStore'

const LIST_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function ListManager() {
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(LIST_COLORS[0])
  const [error, setError] = useState('')
  const { addList } = useListStore()

  const handleCreate = async () => {
    const result = await addList(name, selectedColor, 'list')
    if (result.success) {
      setName('')
      setError('')
      setShowCreate(false)
    } else {
      setError(result.error || '创建失败')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate()
    } else if (e.key === 'Escape') {
      setName('')
      setError('')
      setShowCreate(false)
    }
  }

  if (!showCreate) {
    return (
      <button
        onClick={() => setShowCreate(true)}
        className="w-full p-3 text-[var(--color-text-light)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)] rounded-lg transition-colors text-left text-sm"
      >
        + 新建分组
      </button>
    )
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-[var(--color-border)] animate-slide-up">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="分组名称"
        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg mb-3 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)] text-[var(--color-text)]"
        autoFocus
      />
      
      <div className="flex gap-2 mb-4">
        {LIST_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
              selectedColor === color ? 'border-[var(--color-text)] scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          className="flex-1 px-3 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
        >
          确认
        </button>
        <button
          onClick={() => {
            setName('')
            setError('')
            setShowCreate(false)
          }}
          className="flex-1 px-3 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors text-sm"
        >
          取消
        </button>
      </div>
    </div>
  )
}
