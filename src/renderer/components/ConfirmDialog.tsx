import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div
      data-testid="confirm-dialog-overlay"
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-lg p-6 min-w-[340px] max-w-md animate-slide-up border border-[var(--color-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3 tracking-wide">{title}</h3>
        <p className="text-[var(--color-text-light)] mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-hover)] transition-colors duration-200 text-sm"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-white bg-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors duration-200 text-sm font-medium"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}
