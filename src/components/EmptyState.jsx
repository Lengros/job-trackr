import styles from '../styles/EmptyState.module.css'

/**
 * Reusable empty state component per design guide §7.
 * Structure: 48px icon centered, h2 title, muted subtitle, optional action button.
 *
 * @param {React.ReactNode} icon - Phosphor icon component (48px)
 * @param {string} title - Main heading text
 * @param {string} [subtitle] - Secondary muted text
 * @param {string} [actionLabel] - Action button text
 * @param {Function} [onAction] - Action button click handler
 */
export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className={styles.container}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {actionLabel && onAction && (
        <button className={styles.actionButton} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
