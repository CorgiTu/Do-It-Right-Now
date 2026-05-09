import { useEffect, useState } from 'react'
import type { ToastItem } from '../hooks/useToast'

interface ToastProps {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

export default function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: ToastItem; onClose: (id: string) => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose(toast.id), 200)
    }, 2000)
    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <div
      className={`pointer-events-auto px-4 py-3 bg-gray-900 text-white rounded-coinbase-lg shadow-lg text-sm animate-slide-up ${
        visible ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-200`}
    >
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-coinbase-semantic-up flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>{toast.message}</span>
      </div>
    </div>
  )
}
