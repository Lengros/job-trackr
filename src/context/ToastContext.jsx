import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback(({ type = 'success', message, action, actionLabel, duration }) => {
    // Clear any existing toast timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Default duration: 2s success, 4s error
    const toastDuration = duration || (type === 'error' ? 4000 : 2000)

    const newToast = {
      id: Date.now(),
      type,
      message,
      action: action || null,
      actionLabel: actionLabel || null,
      duration: toastDuration,
    }

    setToast(newToast)

    timerRef.current = setTimeout(() => {
      setToast(null)
      timerRef.current = null
    }, toastDuration)
  }, [])

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ toast, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
