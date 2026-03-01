import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useStrings, formatCurrency } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import styles from '../styles/JobSummary.module.css'

export default function JobSummary() {
  const { jobId } = useParams()
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)
  const strings = useStrings()

  const job = state.jobs.find((j) => j.id === Number(jobId))
  const jobExpenses = state.expenses.filter((e) => e.jobId === Number(jobId))
  const totalExpenses = jobExpenses.reduce(
    (sum, e) => sum + e.quantity * e.unitPrice,
    0
  )
  const grandTotal = (job?.workCost || 0) + totalExpenses

  if (!job) {
    return <div>{strings.jobDetail.notFound}</div>
  }

  const handleComplete = () => {
    const previousStatus = job.status
    dispatch({
      type: 'UPDATE_JOB_STATUS',
      payload: { jobId: job.id, newStatus: 'completed' },
    })
    haptic.success()
    setShowConfirm(false)

    showToast({
      type: 'success',
      message: `${strings.toast.statusChanged} ${strings.status.completed}`,
      actionLabel: strings.toast.undo,
      action: () => {
        dispatch({
          type: 'UPDATE_JOB_STATUS',
          payload: { jobId: job.id, newStatus: previousStatus },
        })
      },
      duration: 4000,
    })
  }

  return (
    <PageTransition>
    <div className={styles.container}>
      <h2 className={styles.title}>{strings.summary.title}</h2>
      <p className={styles.jobNumber}>{job.number}</p>

      <div className={styles.receipt}>
        <div className={styles.section}>
          <h3>{strings.summary.workCost}</h3>
          <div className={styles.lineItem}>
            <span>{strings.summary.serviceFee}</span>
            <span>{formatCurrency(job.workCost)}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <h3>{strings.summary.expenses}</h3>
          {jobExpenses.length === 0 ? (
            <p className={styles.noExpenses}>{strings.summary.noExpenses}</p>
          ) : (
            jobExpenses.map((exp) => (
              <div key={exp.id} className={styles.lineItem}>
                <span>
                  {exp.name} ({exp.quantity} × {formatCurrency(exp.unitPrice)})
                </span>
                <span>{formatCurrency(exp.quantity * exp.unitPrice)}</span>
              </div>
            ))
          )}
          <div className={styles.subtotal}>
            <span>{strings.summary.totalExpenses}</span>
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.grandTotal}>
          <span>{strings.summary.grandTotal}</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {job.status === 'in_progress' && (
        <button
          className={styles.completeButton}
          onClick={() => setShowConfirm(true)}
        >
          {strings.jobDetail.completeJob}
        </button>
      )}

      {showConfirm && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirm job completion">
          <div className={styles.dialog}>
            <p>{strings.confirm.completeJob}</p>
            <div className={styles.dialogButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
              >
                {strings.confirm.cancel}
              </button>
              <button className={styles.confirmButton} onClick={handleComplete}>
                {strings.confirm.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
