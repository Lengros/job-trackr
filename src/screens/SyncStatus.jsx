import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import PageTransition from '../components/PageTransition'
import styles from '../styles/SyncStatus.module.css'

export default function SyncStatus() {
  const { state } = useApp()
  const strings = useStrings()

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

  return (
    <PageTransition>
    <div className={styles.container}>
      <h2 className={styles.title}>{strings.sync.title}</h2>
      <p className={styles.subtitle} role="status" aria-live="polite">
        {state.isOnline ? strings.network.online : strings.network.offline} — {masterJobs.length} {strings.sync.items}
      </p>

      <div className={styles.list} role="list" aria-label="Sync status list">
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
                {new Date(job.createdDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    </PageTransition>
  )
}
