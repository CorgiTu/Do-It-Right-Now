import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import type { RecurrencePattern } from '../db/types'

interface RecurrencePickerProps {
  taskId: string
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
}

const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六']

export default function RecurrencePicker({ taskId, isRecurring, recurrencePattern }: RecurrencePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { updateTaskContent } = useTaskStore()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const pattern = recurrencePattern || { type: 'weekly', interval: 1, daysOfWeek: [1] }

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

  const handleToggle = () => {
    if (isRecurring) {
      updateTaskContent(taskId, {
        isRecurring: false,
        recurrencePattern: undefined,
        updatedAt: new Date().toISOString(),
      })
    } else {
      updateTaskContent(taskId, {
        isRecurring: true,
        recurrencePattern: { type: 'daily', interval: 1 },
        updatedAt: new Date().toISOString(),
      })
    }
    setIsOpen(false)
  }

  const handlePatternChange = (newPattern: RecurrencePattern) => {
    updateTaskContent(taskId, {
      recurrencePattern: newPattern,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className={`inline-flex items-center gap-1 text-xs transition-colors ${
          isRecurring ? 'text-coinbase-primary' : 'text-coinbase-muted-soft hover:text-coinbase-muted'
        }`}
      >
        🔄 {isRecurring ? '重复' : '不重复'}
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute top-full left-0 mt-1 z-50 bg-coinbase-surface-card border border-coinbase-hairline rounded-coinbase-lg shadow-coinbase-hover p-3 w-64" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-coinbase-ink">重复</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!isRecurring}
                  onChange={handleToggle}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-coinbase-surface-strong peer-focus:outline-none rounded-coinbase-pill peer peer-checked:bg-coinbase-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-coinbase-on-primary after:rounded-coinbase-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {isRecurring && (
              <>
                <div>
                  <label className="text-xs text-coinbase-muted mb-1 block">频率</label>
                  <select
                    value={pattern.type}
                    onChange={(e) => handlePatternChange({ ...pattern, type: e.target.value as RecurrencePattern['type'] })}
                    className="w-full px-3 py-1.5 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-md text-sm text-coinbase-body transition-all"
                  >
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="yearly">每年</option>
                    <option value="custom">自定义</option>
                    <option value="none">不重复</option>
                  </select>
                </div>

                {pattern.type === 'weekly' && (
                  <div>
                    <label className="text-xs text-coinbase-muted mb-1 block">每周</label>
                    <div className="flex gap-1">
                      {daysOfWeek.map((day, i) => (
                        <button
                          key={day}
                          onClick={() => {
                            const days = pattern.daysOfWeek || []
                            const newDays = days.includes(i)
                              ? days.filter(d => d !== i)
                              : [...days, i]
                            handlePatternChange({ ...pattern, daysOfWeek: newDays.length > 0 ? newDays : [i] })
                          }}
                          className={`w-8 h-8 rounded-coinbase-full text-xs font-medium transition-colors ${
                            (pattern.daysOfWeek || []).includes(i)
                              ? 'bg-coinbase-primary text-coinbase-on-primary'
                              : 'bg-coinbase-surface-strong text-coinbase-body hover:bg-coinbase-hairline'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {pattern.type === 'monthly' && (
                  <div>
                    <label className="text-xs text-coinbase-muted mb-1 block">每月第几天</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={pattern.dayOfMonth || 1}
                      onChange={(e) => handlePatternChange({ ...pattern, dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value))) })}
                      className="w-full px-3 py-1.5 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-md text-sm text-coinbase-body"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-coinbase-muted mb-1 block">间隔</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-coinbase-muted">每</span>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={pattern.interval || 1}
                      onChange={(e) => handlePatternChange({ ...pattern, interval: Math.max(1, Number(e.target.value)) })}
                      className="w-16 px-2 py-1.5 bg-coinbase-surface-soft border border-coinbase-hairline rounded-coinbase-md text-sm text-coinbase-body text-center"
                    />
                    <span className="text-xs text-coinbase-muted">
                      {pattern.type === 'daily' ? '天' : pattern.type === 'weekly' ? '周' : pattern.type === 'monthly' ? '月' : '年'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
