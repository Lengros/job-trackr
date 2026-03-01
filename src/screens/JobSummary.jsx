import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useStrings, useCurrencyFormatter } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import styles from '../styles/JobSummary.module.css'

export default function JobSummary() {
  const { jobId } = useParams()
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const strings = useStrings()
  const formatCurrency = useCurrencyFormatter()

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

  // Forward status transition: instant dispatch + undo toast (no confirmation dialog)
  const handleComplete = () => {
    const previousStatus = job.status
    dispatch({
      type: 'UPDATE_JOB_STATUS',
      payload: { jobId: job.id, newStatus: 'completed' },
    })
    haptic.success()

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
      {/* Receipt card */}
      <div className={styles.receipt}>
        {/* Receipt header */}
        <div className={styles.receiptHeader}>
          <h2 className={styles.receiptTitle}>{strings.summary.title}</h2>
          <p className={styles.jobNumber}>{job.number}</p>
        </div>

        <div className={styles.dividerDashed} />

        {/* Work cost (labor) section */}
        <div className={styles.section}>
          <h3 className={styles.sectionLabel}>{strings.summary.workCost}</h3>
          <div className={styles.lineItem}>
            <span className={styles.lineItemName}>{strings.summary.serviceFee}</span>
            <span className={styles.lineItemAmount}>{formatCurrency(job.workCost)}</span>
          </div>
        </div>

        <div className={styles.dividerDashed} />

        {/* Expenses section */}
        <div className={styles.section}>
          <h3 className={styles.sectionLabel}>{strings.summary.expenses}</h3>
          {jobExpenses.length === 0 ? (
            <p className={styles.noExpenses}>{strings.summary.noExpenses}</p>
          ) : (
            <div className={styles.expenseList}>
              {jobExpenses.map((exp) => (
                <div key={exp.id} className={styles.expenseItem}>
                  <div className={styles.expenseRow}>
                    <span className={styles.expenseName}>{exp.name}</span>
                    <span className={styles.expenseLineTotal}>
                      {formatCurrency(exp.quantity * exp.unitPrice)}
                    </span>
                  </div>
                  <div className={styles.expenseDetail}>
                    {exp.quantity} &times; {formatCurrency(exp.unitPrice)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.subtotalDivider} />
          <div className={styles.subtotal}>
            <span className={styles.subtotalLabel}>{strings.summary.totalExpenses}</span>
            <span className={styles.subtotalAmount}>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        <div className={styles.dividerSolid} />

        {/* Grand total */}
        <div className={styles.grandTotal}>
          <span className={styles.grandTotalLabel}>{strings.summary.grandTotal}</span>
          <span className={styles.grandTotalAmount}>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Spacer for sticky CTA */}
      {job.status === 'in_progress' && <div className={styles.ctaSpacer} />}

      {/* Sticky bottom CTA - instant action with undo toast */}
      {job.status === 'in_progress' && (
        <div className={styles.stickyCtaBar}>
          <button
            className={`${styles.completeButton} interactive`}
            onClick={handleComplete}
          >
            {strings.jobDetail.completeJob}
          </button>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
