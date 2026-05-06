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
    <div className="flex flex-col gap-3 p-5 bg-white rounded-lg shadow-sm border border-[var(--color-border)] mb-6 animate-slide-up">
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="添加新任务..."
          className="flex-1 px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-light)] text-[var(--color-text)] placeholder-[var(--color-text-light)] transition-all duration-200"
          maxLength={MAX_LENGTH}
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors duration-200 text-sm font-medium tracking-wide"
        >
          添加
        </button>
      </div>
      {value.length > 150 && (
        <span className={`text-xs ${remaining <= 0 ? 'text-red-400' : 'text-[var(--color-text-light)]'}`}>
          剩余 {remaining} 字符
        </span>
      )}
    </div>
  )
}
