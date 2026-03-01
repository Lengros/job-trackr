import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import haptic from '../utils/haptic'
import { ArrowsClockwise, WifiHigh, WifiSlash } from '@phosphor-icons/react'
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
        // Haptic error feedback if any jobs have error/conflict sync status
        const hasErrors = state.jobs.some(
          (j) => j.syncStatus === 'error' || j.syncStatus === 'conflict'
        )
        if (hasErrors) {
          haptic.error()
        }
      }, 1800)
    }
  }, [state.isOnline, state.jobs, dispatch])

  return (
    <header className={styles.header} role="banner">
      <div className={styles.masterName} aria-label={master ? `Logged in as ${master.name}` : 'JobTrackr'}>
        {master ? master.name : 'JobTrackr'}
      </div>
      <div className={styles.headerActions}>
        <button
          className={styles.syncButton}
          onClick={() => navigate('/sync')}
          aria-label="View sync status"
        >
          <ArrowsClockwise size={20} aria-hidden="true" /> Sync
        </button>
        <button
          className={`${styles.networkToggle} ${state.isOnline ? styles.online : styles.offline}`}
          onClick={handleToggleNetwork}
          aria-label={`Network status: ${state.isOnline ? 'Online' : 'Offline'}. Click to toggle.`}
          role={state.isOnline ? undefined : 'alert'}
        >
          <span className={styles.indicator} aria-hidden="true" />
          {state.isOnline ? <><WifiHigh size={16} aria-hidden="true" /> Online</> : <><WifiSlash size={16} aria-hidden="true" /> Offline</>}
        </button>
      </div>
    </header>
  )
}
