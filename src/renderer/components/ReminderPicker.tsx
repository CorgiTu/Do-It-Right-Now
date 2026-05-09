import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'

interface ReminderPickerProps {
  taskId: string
  reminder?: number | null
  dueDate?: string | null
}

export default function ReminderPicker({ taskId, reminder, dueDate }: ReminderPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { updateTaskContent } = useTaskStore()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const reminders = [
    { label: '准时', value: 0 },
    { label: '提前 15 分钟', value: 15 },
    { label: '提前 1 小时', value: 60 },
    { label: '提前 1 天', value: 1440 },
  ]

  const handleSelect = (value: number | null) => {
    updateTaskContent(taskId, {
      reminder: value,
      updatedAt: new Date().toISOString(),
    })
    setIsOpen(false)
  }

  const reminderLabel = reminder !== null && reminder !== undefined
    ? reminders.find(r => r.value === reminder)?.label || `${reminder} 分钟`
    : null

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className={`inline-flex items-center gap-1 text-xs transition-colors ${
          reminderLabel ? 'text-coinbase-primary' : 'text-coinbase-muted-soft hover:text-coinbase-muted'
        }`}
      >
        🔔 {reminderLabel || '提醒'}
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute top-full left-0 mt-1 z-50 bg-coinbase-surface-card border border-coinbase-hairline rounded-coinbase-lg shadow-coinbase-hover p-1.5 w-44" onClick={(e) => e.stopPropagation()}>
          {reminders.map(r => (
            <button
              key={r.value}
              onClick={() => handleSelect(r.value)}
              className={`w-full text-left px-3 py-2 rounded-coinbase-sm text-sm transition-colors ${
                reminder === r.value
                  ? 'bg-coinbase-primary/10 text-coinbase-primary font-medium'
                  : 'text-coinbase-body hover:bg-coinbase-surface-strong'
              }`}
            >
              {r.label}
            </button>
          ))}
          {reminder !== null && reminder !== undefined && (
            <button
              onClick={() => handleSelect(null)}
              className="w-full text-left px-3 py-2 rounded-coinbase-sm text-sm text-coinbase-semantic-down hover:bg-coinbase-surface-strong transition-colors"
            >
              清除提醒
            </button>
          )}
        </div>
      )}
    </div>
  )
}
