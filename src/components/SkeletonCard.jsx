import styles from '../styles/SkeletonCard.module.css'

/**
 * SkeletonCard - A loading placeholder that matches job card dimensions.
 * Uses a pulsing animation (1.5s ease-in-out loop) to indicate loading state.
 */
export default function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true" role="presentation">
      <div className={styles.cardHeader}>
        <div className={`${styles.bone} ${styles.jobNumber}`} />
        <div className={`${styles.bone} ${styles.statusBadge}`} />
      </div>
      <div className={styles.cardBody}>
        <div className={`${styles.bone} ${styles.address}`} />
        <div className={`${styles.bone} ${styles.workType}`} />
      </div>
      <div className={styles.cardFooter}>
        <div className={`${styles.bone} ${styles.date}`} />
        <div className={`${styles.bone} ${styles.syncIcon}`} />
      </div>
    </div>
  )
}
