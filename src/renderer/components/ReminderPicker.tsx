import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'

interface ReminderPickerProps {
  taskId: string
  reminder: string | null
  dueDate: string | null
}

const REMINDER_OPTIONS = [
  { label: '到期时', value: '0min', offset: 0 },
  { label: '提前15分钟', value: '15min', offset: 15 * 60 * 1000 },
  { label: '提前1小时', value: '1h', offset: 60 * 60 * 1000 },
  { label: '提前1天', value: '1d', offset: 24 * 60 * 60 * 1000 },
]

export default function ReminderPicker({ taskId, reminder, dueDate }: ReminderPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const updateTaskContent = useTaskStore(state => state.updateTaskContent)

  if (!dueDate) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-1 text-xs text-[var(--color-border)] cursor-not-allowed"
        title="请先设置截止日期"
      >
        <span className="text-sm opacity-70">🔔</span>
        <span className="opacity-60">设置提醒</span>
      </button>
    )
  }

  const selectedOption = REMINDER_OPTIONS.find(opt => opt.value === reminder)

  const handleSelect = (value: string | null) => {
    updateTaskContent(taskId, { reminder: value })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-[var(--color-text-light)] hover:text-[var(--color-accent)] transition-colors"
      >
        <span className="text-sm opacity-70">🔔</span>
        {selectedOption ? (
          <span className="text-[var(--color-accent)]">{selectedOption.label}</span>
        ) : (
          <span className="opacity-60">设置提醒</span>
        )}
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-10 mt-2 py-2 bg-white rounded-xl shadow-lg border border-[var(--color-border)] w-48 animate-fade-in"
        >
          {REMINDER_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={reminder === option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-2 text-sm text-left transition-colors duration-200 ${
                reminder === option.value
                  ? 'bg-[var(--color-hover)] text-[var(--color-text)] font-medium'
                  : 'text-[var(--color-text-light)] hover:bg-[var(--color-hover)]'
              }`}
            >
              {option.label}
            </button>
          ))}
          <hr className="my-1 border-[var(--color-border)]" />
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-red-50 transition-colors"
          >
            清除提醒
          </button>
        </div>
      )}
    </div>
  )
}
