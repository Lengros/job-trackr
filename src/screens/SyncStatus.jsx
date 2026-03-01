import { useApp } from '../context/AppContext'
import PageTransition from '../components/PageTransition'
import styles from '../styles/SyncStatus.module.css'

const STATUS_LABELS = {
  synced: 'Synced',
  syncing: 'Syncing...',
  pending: 'Pending',
  error: 'Error',
  conflict: 'Conflict',
}

export default function SyncStatus() {
  const { state } = useApp()

  const masterJobs = state.jobs.filter(
    (j) => j.assignedMasterId === state.selectedMasterId
  )

  return (
    <PageTransition>
    <div className={styles.container}>
      <h2 className={styles.title}>Sync Status</h2>
      <p className={styles.subtitle} role="status" aria-live="polite">
        {state.isOnline ? 'Online' : 'Offline'} — {masterJobs.length} items
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
                {STATUS_LABELS[job.syncStatus]}
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
