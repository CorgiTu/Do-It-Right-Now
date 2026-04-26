import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'

interface DueDatePickerProps {
  taskId: string
  dueDate: string | null
}

export default function DueDatePicker({ taskId, dueDate }: DueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')
  const updateTaskContent = useTaskStore(state => state.updateTaskContent)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  const isOverdue = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().toDateString())
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    setShowTimePicker(true)
  }

  const handleConfirmTime = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate)
      finalDate.setHours(parseInt(hour), parseInt(minute), 0, 0)
      updateTaskContent(taskId, { dueDate: finalDate.toISOString() })
      setIsOpen(false)
      setShowTimePicker(false)
      setSelectedDate(null)
    }
  }

  const handleClear = () => {
    updateTaskContent(taskId, { dueDate: null })
    setIsOpen(false)
    setShowTimePicker(false)
  }

  const handleBackToCalendar = () => {
    setShowTimePicker(false)
    setSelectedDate(null)
  }

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const paddingDays = Array.from({ length: firstDayOfMonth }, () => 0)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-[var(--color-text-light)] hover:text-[var(--color-accent)] transition-colors"
      >
        <span className="text-sm opacity-70">📅</span>
        {dueDate ? (
          <span className={isOverdue(dueDate) ? 'text-red-400 font-medium' : 'text-[var(--color-accent)]'}>
            {formatDate(dueDate)}
            {isOverdue(dueDate) && ' (已到期)'}
          </span>
        ) : (
          <span className="opacity-60">设置日期</span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          className="absolute z-10 mt-2 p-4 bg-white rounded-xl shadow-lg border border-[var(--color-border)] w-72 animate-fade-in"
        >
          {!showTimePicker ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--color-text)] tracking-wide">
                  {currentYear}年{currentMonth + 1}月
                </h3>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-[var(--color-text-light)] hover:text-red-400 transition-colors"
                >
                  清除日期
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="text-xs text-[var(--color-text-light)] text-center py-1 opacity-70">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((_, index) => (
                  <div key={`pad-${index}`} className="p-2" />
                ))}
                {days.map(day => {
                  const date = new Date(currentYear, currentMonth, day)
                  const isPast = date < new Date(new Date().toDateString())
                  const isToday = date.toDateString() === today.toDateString()

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleSelectDate(date)}
                      className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                        isPast
                          ? 'text-[var(--color-border)] cursor-not-allowed'
                          : isToday
                          ? 'bg-[var(--color-accent)] text-white hover:bg-opacity-90'
                          : 'hover:bg-[var(--color-hover)] text-[var(--color-text)]'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-[var(--color-text)] tracking-wide">
                  设置时间
                </h3>
                <button
                  type="button"
                  onClick={handleBackToCalendar}
                  className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-accent)] transition-colors"
                >
                  返回
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-xs text-[var(--color-text-light)] mb-2">时</label>
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map(h => (
                      <option key={h} value={String(h).padStart(2, '0')}>
                        {String(h).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-[var(--color-text-light)] mb-2">分</label>
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-light)]"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                      <option key={m} value={String(m).padStart(2, '0')}>
                        {String(m).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToCalendar}
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-light)] hover:bg-[var(--color-hover)] transition-colors"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTime}
                  className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
