import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from '../styles/Header.module.css'

export default function Header() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const master = state.masters.find((m) => m.id === state.selectedMasterId)

  const handleToggleNetwork = useCallback(() => {
    const wasOffline = !state.isOnline
    dispatch({ type: 'TOGGLE_NETWORK' })
    if (wasOffline) {
      // After animation delay, complete the sync
      setTimeout(() => {
        dispatch({ type: 'SYNC_COMPLETE' })
      }, 1800)
    }
  }, [state.isOnline, dispatch])

  return (
    <header className={styles.header}>
      <div className={styles.masterName}>
        {master ? master.name : 'JobTrackr'}
      </div>
      <div className={styles.headerActions}>
        <button
          className={styles.syncButton}
          onClick={() => navigate('/sync')}
          aria-label="View sync status"
        >
          Sync
        </button>
        <button
          className={`${styles.networkToggle} ${state.isOnline ? styles.online : styles.offline}`}
          onClick={handleToggleNetwork}
          aria-label={`Network status: ${state.isOnline ? 'Online' : 'Offline'}. Click to toggle.`}
        >
          <span className={styles.indicator} />
          {state.isOnline ? 'Online' : 'Offline'}
        </button>
      </div>
    </header>
  )
}
