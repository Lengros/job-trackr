import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import { Circle } from '@phosphor-icons/react'
import styles from '../styles/OfflineBanner.module.css'

export default function OfflineBanner() {
  const { state } = useApp()
  const strings = useStrings()

  if (state.isOnline) {
    return null
  }

  return (
    <div className={styles.banner} role="alert">
      <Circle size={8} weight="regular" className={styles.icon} />
      <span className={styles.text}>{strings.offlineBanner.message}</span>
    </div>
  )
}
