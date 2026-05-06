import type { ToastMessage } from '../hooks/useToast'

interface ToastProps {
  toasts: ToastMessage[]
  onClose: (id: string) => void
}

export default function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-[var(--color-text)] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up min-w-[200px]"
        >
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            onClick={() => onClose(toast.id)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
