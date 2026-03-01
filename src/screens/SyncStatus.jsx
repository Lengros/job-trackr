import { useCallback, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useStrings, useDateFormatter } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import {
  WifiHigh,
  WifiSlash,
  CheckCircle,
  Clock,
  WarningCircle,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import styles from '../styles/SyncStatus.module.css'

const SYNC_ICONS = {
  synced: { Icon: CheckCircle, weight: 'fill', color: 'var(--success)' },
  syncing: { Icon: ArrowsClockwise, weight: 'bold', color: 'var(--brand-700)' },
  pending: { Icon: Clock, weight: 'fill', color: 'var(--warning)' },
  error: { Icon: WarningCircle, weight: 'fill', color: 'var(--error)' },
  conflict: { Icon: WarningCircle, weight: 'fill', color: 'var(--error)' },
}

export default function SyncStatus() {
  const { state, dispatch } = useApp()
  const strings = useStrings()
  const formatDate = useDateFormatter()
  const [retryingJobs, setRetryingJobs] = useState(new Set())

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

  const handleRetry = useCallback((jobId) => {
    if (retryingJobs.has(jobId)) return
    setRetryingJobs(prev => new Set([...prev, jobId]))
    haptic.success()
    dispatch({ type: 'RETRY_SYNC', payload: { jobId } })
    // Simulate retry completion after 2 seconds
    setTimeout(() => {
      dispatch({ type: 'RETRY_SYNC_COMPLETE', payload: { jobId } })
      setRetryingJobs(prev => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
      haptic.success()
    }, 2000)
  }, [retryingJobs, dispatch])

  const isRetryable = (syncStatus) => syncStatus === 'error' || syncStatus === 'conflict'

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
        {masterJobs.map((job) => {
          const syncConfig = SYNC_ICONS[job.syncStatus] || SYNC_ICONS.synced
          const { Icon: SyncIcon, weight: iconWeight, color: iconColor } = syncConfig
          const canRetry = isRetryable(job.syncStatus) && state.isOnline
          const isRetrying = retryingJobs.has(job.id)

          return (
            <div
              key={job.id}
              className={`${styles.item} ${styles[`status_${job.syncStatus}`]} ${canRetry ? styles.retryable : ''}`}
              role="listitem"
              onClick={canRetry ? () => handleRetry(job.id) : undefined}
              tabIndex={canRetry ? 0 : undefined}
              onKeyDown={canRetry ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRetry(job.id) } } : undefined}
              aria-label={canRetry ? `${job.number}, ${statusLabels[job.syncStatus]}. ${strings.sync.tapToRetry}` : undefined}
            >
              <div className={styles.iconContainer}>
                <SyncIcon
                  size={24}
                  weight={iconWeight}
                  className={`${styles.syncIcon} ${job.syncStatus === 'syncing' || isRetrying ? styles.spinning : ''}`}
                  style={{ color: iconColor }}
                  aria-hidden="true"
                />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.jobNumber}>{job.number}</span>
                <span className={styles.address}>{job.address}</span>
                <span className={styles.timestamp}>
                  {formatDate(job.createdDate)}
                </span>
              </div>
              <div className={styles.itemStatus}>
                <span
                  className={`${styles.badge} ${styles[`badge_${job.syncStatus}`]}`}
                  role="status"
                  aria-live="polite"
                >
                  {isRetrying ? strings.sync.retrying : statusLabels[job.syncStatus]}
                </span>
                {canRetry && !isRetrying && (
                  <span className={styles.retryHint}>
                    {strings.sync.tapToRetry}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </PageTransition>
  )
}
