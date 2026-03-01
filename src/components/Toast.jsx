import { useEffect, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { CheckCircle, WarningCircle, Info } from '@phosphor-icons/react'
import styles from '../styles/Toast.module.css'

const ICONS = {
  success: CheckCircle,
  error: WarningCircle,
  info: Info,
}

export default function Toast() {
  const { toast, dismissToast } = useToast()
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const swipeDeltaRef = useRef(0)
  const toastRef = useRef(null)
  const prevToastId = useRef(null)

  useEffect(() => {
    if (toast) {
      // Reset exiting state and show
      setExiting(false)
      setVisible(true)
      prevToastId.current = toast.id
    } else if (prevToastId.current) {
      // Toast was dismissed — animate out
      setExiting(true)
      const exitTimer = setTimeout(() => {
        setVisible(false)
        setExiting(false)
        prevToastId.current = null
      }, 250)
      return () => clearTimeout(exitTimer)
    }
  }, [toast])

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    swipeDeltaRef.current = 0
  }

  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - touchStartRef.current.y
    // Only allow swipe down (dismiss)
    if (deltaY > 0) {
      swipeDeltaRef.current = deltaY
      if (toastRef.current) {
        toastRef.current.style.transform = `translateY(${deltaY}px)`
        toastRef.current.style.opacity = Math.max(0, 1 - deltaY / 120)
      }
    }
  }

  const handleTouchEnd = () => {
    if (swipeDeltaRef.current > 60) {
      // Threshold reached — dismiss
      dismissToast()
    } else {
      // Snap back
      if (toastRef.current) {
        toastRef.current.style.transform = ''
        toastRef.current.style.opacity = ''
      }
    }
    swipeDeltaRef.current = 0
  }

  const handleAction = () => {
    if (toast?.action) {
      toast.action()
    }
    dismissToast()
  }

  if (!visible) return null

  const currentToast = toast || { type: 'success', message: '' }
  const Icon = ICONS[currentToast.type] || ICONS.info

  return (
    <div
      ref={toastRef}
      className={`${styles.toast} ${styles[currentToast.type]} ${exiting ? styles.exiting : styles.entering}`}
      role="alert"
      aria-live="polite"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Icon size={20} weight="fill" className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{currentToast.message}</span>
      {currentToast.actionLabel && (
        <button
          className={styles.actionBtn}
          onClick={handleAction}
          type="button"
        >
          {currentToast.actionLabel}
        </button>
      )}
    </div>
  )
}
