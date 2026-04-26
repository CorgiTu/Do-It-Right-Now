import { useState, useEffect, useCallback } from 'react'

export interface ToastMessage {
  id: string
  message: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, duration: number = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: ToastMessage = { id, message, duration }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, showToast, removeToast }
}
