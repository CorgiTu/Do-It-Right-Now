import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { RecurrencePattern } from '../db/types'

const FREQUENCY_OPTIONS: { value: RecurrencePattern; label: string; icon: string }[] = [
  { value: 'daily', label: '每日', icon: '📆' },
  { value: 'weekly', label: '每周', icon: '📅' },
  { value: 'monthly', label: '每月', icon: '🗓️' },
  { value: 'yearly', label: '每年', icon: '🎄' },
  { value: 'custom', label: '自定义', icon: '⚙️' },
  { value: null, label: '不重复', icon: '❌' },
]

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

interface RecurrencePickerProps {
  taskId: string
  currentPattern: RecurrencePattern
  currentWeeklyDays?: number[]
  currentMonthlyDay?: number
  currentInterval?: number
  currentEndDate?: string | null
  currentMaxOccurrences?: number | null
  currentExceptionDates?: string[]
  createdAt?: string
  onChange: (settings: {
    pattern: RecurrencePattern
    weeklyDays?: number[]
    monthlyDay?: number
    interval?: number
    endDate?: string | null
    maxOccurrences?: number | null
    exceptionDates?: string[]
  }) => void
}

export default function RecurrencePicker({
  currentPattern,
  currentWeeklyDays = [],
  currentMonthlyDay,
  currentInterval = 1,
  currentEndDate,
  currentMaxOccurrences,
  currentExceptionDates = [],
  createdAt,
  onChange,
}: RecurrencePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<RecurrencePattern>(currentPattern)
  const [weeklyDays, setWeeklyDays] = useState<number[]>(currentWeeklyDays)
  const [monthlyDay, setMonthlyDay] = useState<number>(currentMonthlyDay || 1)
  const [interval, setInterval] = useState<number>(currentInterval)
  const [endDate, setEndDate] = useState<string>(currentEndDate || '')
  const [maxOccurrences, setMaxOccurrences] = useState<number>(currentMaxOccurrences || 0)
  const [endType, setEndType] = useState<'none' | 'date' | 'count'>(
    currentEndDate ? 'date' : currentMaxOccurrences ? 'count' : 'none'
  )
  const [exceptionDates, setExceptionDates] = useState<string[]>(currentExceptionDates)
  const [newExceptionDate, setNewExceptionDate] = useState('')
  const [error, setError] = useState<string>('')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-recurrence-picker]')) {
        setIsOpen(false)
        setError('')
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const updatePosition = () => {
    if (!isOpen || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const dropdownHeight = 400
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top: number
    if (spaceBelow >= dropdownHeight) {
      top = rect.bottom + 8
    } else if (spaceAbove >= dropdownHeight) {
      top = rect.top - dropdownHeight - 8
    } else {
      top = spaceBelow > spaceAbove ? rect.bottom + 8 : rect.top - dropdownHeight - 8
    }

    setPosition({
      top,
      left: rect.left,
    })
  }

  useEffect(() => {
    if (!isOpen) return
    updatePosition()

    const scrollContainers = document.querySelectorAll('main, [class*="overflow"]')
    const handleScroll = () => updatePosition()

    scrollContainers.forEach(el => el.addEventListener('scroll', handleScroll, true))
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      scrollContainers.forEach(el => el.removeEventListener('scroll', handleScroll, true))
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownHeight = 400
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      let top: number
      if (spaceBelow >= dropdownHeight) {
        top = rect.bottom + 8
      } else if (spaceAbove >= dropdownHeight) {
        top = rect.top - dropdownHeight - 8
      } else {
        top = spaceBelow > spaceAbove ? rect.bottom + 8 : rect.top - dropdownHeight - 8
      }

      setPosition({
        top,
        left: rect.left,
      })

      setSelectedPattern(currentPattern)
      setWeeklyDays([...currentWeeklyDays])
      setMonthlyDay(currentMonthlyDay || 1)
      setInterval(currentInterval)
      setEndDate(currentEndDate || '')
      setMaxOccurrences(currentMaxOccurrences || 0)
      setEndType(currentEndDate ? 'date' : currentMaxOccurrences ? 'count' : 'none')
      setExceptionDates([...currentExceptionDates])
      setError('')
    }

    setIsOpen(!isOpen)
  }

  const toggleWeekday = (day: number) => {
    setWeeklyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const addExceptionDate = () => {
    if (!newExceptionDate) return

    if (createdAt && newExceptionDate < createdAt.split('T')[0]) {
      setError('例外日期不能早于任务创建日期')
      return
    }

    if (!exceptionDates.includes(newExceptionDate)) {
      setExceptionDates(prev => [...prev, newExceptionDate].sort())
      setNewExceptionDate('')
      setError('')
    }
  }

  const removeExceptionDate = (date: string) => {
    setExceptionDates(prev => prev.filter(d => d !== date))
  }

  const handleSave = () => {
    if (!selectedPattern) {
      onChange({ pattern: null })
      setIsOpen(false)
      return
    }

    if (selectedPattern === 'weekly' && weeklyDays.length === 0) {
      setError('请至少选择一个星期')
      return
    }

    if (interval < 1) {
      setError('间隔必须大于 0')
      return
    }

    if (endType === 'date' && endDate && createdAt && endDate < createdAt.split('T')[0]) {
      setError('结束日期不能早于任务创建日期')
      return
    }

    const settings: any = {
      pattern: selectedPattern,
      interval,
    }

    if (selectedPattern === 'weekly' || selectedPattern === 'custom') {
      settings.weeklyDays = weeklyDays
    }
    if (selectedPattern === 'monthly' || (selectedPattern === 'custom' && monthlyDay)) {
      settings.monthlyDay = monthlyDay
    }
    if (endType === 'date' && endDate) {
      settings.endDate = endDate
      settings.maxOccurrences = null
    } else if (endType === 'count' && maxOccurrences > 0) {
      settings.maxOccurrences = maxOccurrences
      settings.endDate = null
    } else {
      settings.endDate = null
      settings.maxOccurrences = null
    }
    settings.exceptionDates = exceptionDates

    onChange(settings)
    setIsOpen(false)
    setError('')
  }

  const handleCancel = () => {
    setIsOpen(false)
    setError('')
  }

  return (
    <>
      <div data-recurrence-picker>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          onMouseDown={(e) => e.preventDefault()}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors text-[var(--color-text-light)] hover:text-[var(--color-accent)]"
        >
          <span className="text-sm">🔁</span>
          <span>{currentPattern ? '重复设置' : '设置重复'}</span>
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            data-recurrence-picker
            className="fixed z-[999] w-80 bg-[var(--color-bg)] rounded-xl shadow-xl border border-[var(--color-border)]"
            style={{ top: position.top, left: position.left }}
          >
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <h3 className="text-sm font-medium text-[var(--color-text)] tracking-wide mb-4">
                设置重复
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {FREQUENCY_OPTIONS.map(option => (
                  <button
                    key={option.value || 'none'}
                    type="button"
                    onClick={() => setSelectedPattern(option.value)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 text-xs ${
                      selectedPattern === option.value
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'hover:bg-[var(--color-hover)] text-[var(--color-text)] border border-[var(--color-border)]'
                    }`}
                  >
                    <span className="block text-base mb-1">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>

              {selectedPattern === 'weekly' && (
                <div className="mb-4">
                  <label className="block text-xs text-[var(--color-text-light)] mb-2">选择星期</label>
                  <div className="flex gap-1">
                    {WEEKDAYS.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleWeekday(index)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`flex-1 py-2 text-xs rounded-lg transition-all ${
                          weeklyDays.includes(index)
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-hover)]'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedPattern === 'monthly' && (
                <div className="mb-4">
                  <label className="block text-xs text-[var(--color-text-light)] mb-2">选择日期</label>
                  <select
                    value={monthlyDay}
                    onChange={(e) => setMonthlyDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)] text-sm"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day}号
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPattern && selectedPattern !== 'daily' && (
                <div className="mb-4">
                  <label className="block text-xs text-[var(--color-text-light)] mb-2">间隔</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-light)]">每隔</span>
                    <input
                      type="number"
                      min="1"
                      value={interval}
                      onChange={(e) => setInterval(Math.max(1, Number(e.target.value) || 1))}
                      className="w-16 px-2 py-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] text-center text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                    />
                    <span className="text-xs text-[var(--color-text-light)]">
                      {selectedPattern === 'weekly' ? '周' : selectedPattern === 'monthly' ? '月' : selectedPattern === 'yearly' ? '年' : '个周期'}
                    </span>
                  </div>
                </div>
              )}

              {selectedPattern && (
                <div className="mb-4">
                  <label className="block text-xs text-[var(--color-text-light)] mb-2">结束条件</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setEndType('none')}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all ${
                        endType === 'none'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'border border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-hover)]'
                      }`}
                    >
                      无结束
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndType('date')}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all ${
                        endType === 'date'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'border border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-hover)]'
                      }`}
                    >
                      结束日期
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndType('count')}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all ${
                        endType === 'count'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'border border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-hover)]'
                      }`}
                    >
                      最大次数
                    </button>
                  </div>

                  {endType === 'date' && (
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                    />
                  )}
                  {endType === 'count' && (
                    <input
                      type="number"
                      min="1"
                      value={maxOccurrences}
                      onChange={(e) => setMaxOccurrences(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                      placeholder="输入最大重复次数"
                    />
                  )}
                </div>
              )}

              {selectedPattern && (
                <div className="mb-4">
                  <label className="block text-xs text-[var(--color-text-light)] mb-2">例外日期</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="date"
                      value={newExceptionDate}
                      onChange={(e) => setNewExceptionDate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                    />
                    <button
                      type="button"
                      onClick={addExceptionDate}
                      onMouseDown={(e) => e.preventDefault()}
                      className="px-3 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors text-sm"
                    >
                      添加
                    </button>
                  </div>
                  {exceptionDates.length > 0 && (
                    <div className="max-h-20 overflow-y-auto">
                      {exceptionDates.map(date => (
                        <div key={date} className="flex items-center justify-between py-1 text-xs text-[var(--color-text-light)]">
                          <span>{date}</span>
                          <button
                            type="button"
                            onClick={() => removeExceptionDate(date)}
                            onMouseDown={(e) => e.preventDefault()}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  onMouseDown={(e) => e.preventDefault()}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-hover)] transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  onMouseDown={(e) => e.preventDefault()}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors text-sm"
                >
                  确定
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
