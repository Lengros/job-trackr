import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { useStrings, useDateFormatter } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import { WifiHigh, WifiSlash } from '@phosphor-icons/react'
import styles from '../styles/SyncStatus.module.css'

export default function SyncStatus() {
  const { state, dispatch } = useApp()
  const strings = useStrings()
  const formatDate = useDateFormatter()

  const statusLabels = {
    synced: strings.syncStatus.synced,
    syncing: strings.syncStatus.syncing,
    pending: strings.syncStatus.pending,
    error: strings.syncStatus.error,
    conflict: strings.syncStatus.conflict,
  }

  const masterJobs = state.jobs.filter(
    (j) => j.assignedMasterId === state.selectedMasterId
  )

  const handleToggleNetwork = useCallback(() => {
    const wasOffline = !state.isOnline
    dispatch({ type: 'TOGGLE_NETWORK' })
    if (wasOffline) {
      setTimeout(() => {
        dispatch({ type: 'SYNC_COMPLETE' })
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
    <PageTransition>
    <div className={styles.container}>
      <h2 className={styles.title}>{strings.sync.title}</h2>
      <p className={styles.subtitle} role="status" aria-live="polite">
        {state.isOnline ? strings.network.online : strings.network.offline} — {masterJobs.length} {strings.sync.items}
      </p>

      <button
        className={`${styles.networkToggle} ${state.isOnline ? styles.toggleOnline : styles.toggleOffline} interactive`}
        onClick={handleToggleNetwork}
        aria-label={strings.network.toggleLabel.replace('{status}', state.isOnline ? strings.network.online : strings.network.offline)}
      >
        {state.isOnline ? (
          <>
            <WifiHigh size={20} weight="bold" />
            <span>{strings.network.online}</span>
          </>
        ) : (
          <>
            <WifiSlash size={20} weight="bold" />
            <span>{strings.network.offline}</span>
          </>
        )}
      </button>

      <div className={styles.list} role="list" aria-label={strings.sync.listLabel}>
        {masterJobs.map((job) => (
          <div
            key={job.id}
            className={`${styles.item} ${styles[`status_${job.syncStatus}`]}`}
            role="listitem"
          >
            <div className={styles.itemInfo}>
              <span className={styles.jobNumber}>{job.number}</span>
              <span className={styles.address}>{job.address}</span>
            </div>
            <div className={styles.itemStatus}>
              <span
                className={`${styles.badge} ${styles[`badge_${job.syncStatus}`]}`}
                role="status"
                aria-live="polite"
              >
                {statusLabels[job.syncStatus]}
              </span>
              <span className={styles.timestamp}>
                {formatDate(job.createdDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    </PageTransition>
  )
}
