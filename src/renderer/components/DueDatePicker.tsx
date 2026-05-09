import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'

interface DueDatePickerProps {
  taskId: string
  dueDate?: string | null
}

export default function DueDatePicker({ taskId, dueDate }: DueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [hour, setHour] = useState(dueDate ? new Date(dueDate).getHours() : 17)
  const [minute, setMinute] = useState(dueDate ? new Date(dueDate).getMinutes() : 0)
  const { updateTaskContent } = useTaskStore()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (dueDate) {
      const d = new Date(dueDate)
      setHour(d.getHours())
      setMinute(d.getMinutes())
    }
  }, [dueDate])

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

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const handleDateSelect = (day: number) => {
    const selected = new Date(year, month, day, hour, minute)
    updateTaskContent(taskId, {
      dueDate: selected.toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setIsOpen(false)
  }

  const handleClear = () => {
    updateTaskContent(taskId, {
      dueDate: null,
      updatedAt: new Date().toISOString(),
    })
    setIsOpen(false)
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className={`inline-flex items-center gap-1 text-xs transition-colors ${
          dueDate ? 'text-coinbase-primary' : 'text-coinbase-muted-soft hover:text-coinbase-muted'
        }`}
      >
        📅 {dueDate ? new Date(dueDate).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) : '截止'}
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute top-full left-0 mt-1 z-50 bg-coinbase-surface-card border border-coinbase-hairline rounded-coinbase-lg shadow-coinbase-hover p-3 w-64" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded-coinbase-xs hover:bg-coinbase-surface-strong transition-colors text-coinbase-muted">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-sm font-semibold text-coinbase-ink">
              {year}年{month + 1}月
            </span>
            <button onClick={nextMonth} className="p-1 rounded-coinbase-xs hover:bg-coinbase-surface-strong transition-colors text-coinbase-muted">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center text-xs text-coinbase-muted-soft font-medium py-1">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected = dueDate && new Date(dueDate).getDate() === day && new Date(dueDate).getMonth() === month && new Date(dueDate).getFullYear() === year
              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  className={`text-center text-sm py-1.5 rounded-coinbase-xs transition-colors ${
                    isSelected
                      ? 'bg-coinbase-primary text-coinbase-on-primary font-medium'
                      : 'hover:bg-coinbase-surface-strong text-coinbase-body'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="flex-1 px-2 py-1.5 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-md text-xs text-coinbase-body"
            >
              {hours.map(h => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-coinbase-muted text-xs">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="flex-1 px-2 py-1.5 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-md text-xs text-coinbase-body"
            >
              {minutes.map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (dueDate) {
                  const d = new Date(dueDate)
                  d.setHours(hour, minute, 0, 0)
                  updateTaskContent(taskId, {
                    dueDate: d.toISOString(),
                    updatedAt: new Date().toISOString(),
                  })
                }
                setIsOpen(false)
              }}
              className="flex-1 px-3 py-1.5 bg-coinbase-primary text-coinbase-on-primary rounded-coinbase-pill hover:bg-coinbase-primary-active transition-colors text-xs font-semibold"
            >
              确认
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-1.5 bg-coinbase-surface-strong text-coinbase-body rounded-coinbase-pill hover:bg-coinbase-hairline transition-colors text-xs font-medium"
            >
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
