import { useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'

interface TaskInputProps {
  listId?: string
}

const MAX_LENGTH = 200

export default function TaskInput({ listId }: TaskInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const addTask = useTaskStore((state) => state.addTask)

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) return

    await addTask(trimmed, listId)
    setValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_LENGTH) {
      setValue(newValue)
    }
  }

  const remaining = MAX_LENGTH - value.length

  return (
    <div className="flex flex-col gap-3 p-5 bg-coinbase-surface-card rounded-coinbase-lg shadow-coinbase-soft border border-coinbase-hairline mb-6 animate-slide-up">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="添加新任务..."
            className="w-full px-4 py-2.5 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-lg text-coinbase-body placeholder-coinbase-muted-soft transition-all duration-200"
            maxLength={MAX_LENGTH}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-coinbase-primary text-coinbase-on-primary rounded-coinbase-pill hover:bg-coinbase-primary-active transition-colors duration-200 text-sm font-semibold"
        >
          添加
        </button>
      </div>
      {value.length > 150 && (
        <span className={`text-xs px-1 ${remaining <= 0 ? 'text-coinbase-semantic-down' : 'text-coinbase-muted'}`}>
          剩余 {remaining} 字符
        </span>
      )}
    </div>
  )
}
