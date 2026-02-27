import { useRef, useEffect } from 'react'
import styles from '../styles/PageTransition.module.css'

export default function PageTransition({ children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (el) {
      // Force reflow then add the animate class
      el.classList.remove(styles.enter)
      // Trigger reflow
      void el.offsetWidth
      el.classList.add(styles.enter)
    }
  }, [])

  return (
    <div className={styles.page} ref={ref}>
      {children}
    </div>
  )
}
