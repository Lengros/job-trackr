import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import styles from '../styles/JobSummary.module.css'

export default function JobSummary() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)

  const job = state.jobs.find((j) => j.id === Number(jobId))
  const jobExpenses = state.expenses.filter((e) => e.jobId === Number(jobId))
  const totalExpenses = jobExpenses.reduce(
    (sum, e) => sum + e.quantity * e.unitPrice,
    0
  )
  const grandTotal = (job?.workCost || 0) + totalExpenses

  if (!job) {
    return <div>Job not found</div>
  }

  const handleComplete = () => {
    dispatch({
      type: 'UPDATE_JOB_STATUS',
      payload: { jobId: job.id, newStatus: 'completed' },
    })
    haptic.success()
    setShowConfirm(false)
  }

  return (
    <PageTransition>
    <div className={styles.container}>
      <h2 className={styles.title}>Job Summary</h2>
      <p className={styles.jobNumber}>{job.number}</p>

      <div className={styles.receipt}>
        <div className={styles.section}>
          <h3>Work Cost</h3>
          <div className={styles.lineItem}>
            <span>Service fee</span>
            <span>${job.workCost.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <h3>Expenses</h3>
          {jobExpenses.length === 0 ? (
            <p className={styles.noExpenses}>No expenses</p>
          ) : (
            jobExpenses.map((exp) => (
              <div key={exp.id} className={styles.lineItem}>
                <span>
                  {exp.name} ({exp.quantity} × ${exp.unitPrice.toFixed(2)})
                </span>
                <span>${(exp.quantity * exp.unitPrice).toFixed(2)}</span>
              </div>
            ))
          )}
          <div className={styles.subtotal}>
            <span>Total Expenses</span>
            <span>${totalExpenses.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.grandTotal}>
          <span>Grand Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {job.status === 'in_progress' && (
        <button
          className={styles.completeButton}
          onClick={() => setShowConfirm(true)}
        >
          Complete Job
        </button>
      )}

      {showConfirm && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirm job completion">
          <div className={styles.dialog}>
            <p>Mark this job as <strong>Completed</strong>?</p>
            <div className={styles.dialogButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.confirmButton} onClick={handleComplete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
