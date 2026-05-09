import { useEffect, useRef, useState } from 'react'

interface ListColorPickerProps {
  currentColor: string
  onColorSelect: (color: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement>
}

const COLORS = [
  '#0052FF', '#003ECC', '#05B169', '#F4B000',
  '#CF202F', '#8B5CF6', '#EC4899', '#06B6D4',
  '#F97316', '#0EA5E9', '#14B8A6', '#6366F1',
]

export default function ListColorPicker({ currentColor, onColorSelect, onClose, anchorRef }: ListColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (anchorRef.current && pickerRef.current) {
      const anchor = anchorRef.current.getBoundingClientRect()
      const pickerWidth = 208
      let left = anchor.left + anchor.width / 2 - pickerWidth / 2
      let top = anchor.bottom + 4

      if (left < 8) left = 8
      if (left + pickerWidth > window.innerWidth - 8) {
        left = window.innerWidth - pickerWidth - 8
      }

      if (top + 120 > window.innerHeight) {
        top = anchor.top - 120
      }

      setPosition({ top, left })
    }
  }, [anchorRef])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={pickerRef}
      className="fixed z-[200] bg-coinbase-surface-card border border-coinbase-hairline rounded-coinbase-lg shadow-coinbase-hover p-3 animate-fade-in"
      style={{ top: position.top, left: position.left }}
    >
      <div className="grid grid-cols-6 gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-7 h-7 rounded-coinbase-full transition-all ${
              currentColor === color
                ? 'ring-2 ring-coinbase-primary ring-offset-2 scale-110'
                : 'hover:scale-110'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}
