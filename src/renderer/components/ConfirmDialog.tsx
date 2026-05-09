import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-coinbase-surface-card rounded-coinbase-xl shadow-coinbase-hover border border-coinbase-hairline p-6 max-w-sm w-full mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-coinbase-ink mb-2">{title}</h3>
        <p className="text-sm text-coinbase-body mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-coinbase-surface-strong text-coinbase-body rounded-coinbase-pill hover:bg-coinbase-hairline transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-coinbase-primary text-coinbase-on-primary rounded-coinbase-pill hover:bg-coinbase-primary-active transition-colors text-sm font-semibold"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}
