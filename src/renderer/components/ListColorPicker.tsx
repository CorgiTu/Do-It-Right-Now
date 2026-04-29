import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ListColorPickerProps {
  currentColor: string
  onColorSelect: (color: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

const presetColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4',
  '#84CC16', '#D946EF',
]

export default function ListColorPicker({ currentColor, onColorSelect, onClose, anchorRef }: ListColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customColor, setCustomColor] = useState(currentColor)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const pickerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top + rect.height / 2 - 80,
        left: rect.right + 8,
      })
    }
  }, [anchorRef])

  useEffect(() => {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [updatePosition])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const content = (
    <div
      ref={pickerRef}
      className="fixed p-3 bg-[var(--color-bg)] rounded-xl shadow-lg border border-[var(--color-border)] z-50 w-44 animate-fade-in"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-4 gap-2">
        {presetColors.map(color => (
          <button
            key={color}
            onClick={(e) => { e.stopPropagation(); onColorSelect(color); }}
            className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
              color === currentColor ? 'ring-2 ring-[var(--color-accent)] ring-offset-1' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-[var(--color-border)]">
        <button
          onClick={(e) => { e.stopPropagation(); setShowCustom(!showCustom); }}
          className="text-xs text-[var(--color-text-light)] hover:text-[var(--color-accent)] w-full text-center"
        >
          {showCustom ? '隐藏自定义' : '自定义颜色'}
        </button>
        {showCustom && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value)
                onColorSelect(e.target.value)
              }}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                  setCustomColor(val)
                  onColorSelect(val)
                }
              }}
              className="flex-1 px-2 py-1 text-xs border border-[var(--color-border)] rounded bg-[var(--color-bg)] text-[var(--color-text)]"
              placeholder="#000000"
            />
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
