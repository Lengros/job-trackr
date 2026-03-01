import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useStrings, formatCurrency } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import { Phone, Camera, CurrencyDollar, ClipboardText } from '@phosphor-icons/react'
import styles from '../styles/JobDetail.module.css'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const strings = useStrings()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  const statusLabels = {
    new: strings.status.new,
    in_progress: strings.status.inProgress,
    completed: strings.status.completed,
  }

  const job = state.jobs.find((j) => j.id === Number(jobId))

  if (!job) {
    return <div className={styles.notFound}>{strings.jobDetail.notFound}</div>
  }

  const handleStatusChange = (newStatus) => {
    setPendingStatus(newStatus)
    setShowConfirm(true)
  }

  const confirmStatusChange = () => {
    const previousStatus = job.status
    const targetStatus = pendingStatus
    dispatch({
      type: 'UPDATE_JOB_STATUS',
      payload: { jobId: job.id, newStatus: targetStatus },
    })
    if (targetStatus === 'completed') {
      haptic.success()
    }
    setShowConfirm(false)
    setPendingStatus(null)

    // Show toast with undo action
    showToast({
      type: 'success',
      message: `${strings.toast.statusChanged} ${statusLabels[targetStatus]}`,
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
      <div className={styles.statusBar} data-status={job.status} role="status" aria-live="polite">
        <span className={styles.statusLabel}>{statusLabels[job.status]}</span>
      </div>

      <div className={styles.infoCard}>
        <h2 className={styles.jobNumber}>{job.number}</h2>
        <div className={styles.field}>
          <label>{strings.jobDetail.address}</label>
          <p>{job.address}</p>
        </div>
        <div className={styles.field}>
          <label>{strings.jobDetail.contact}</label>
          <p>{job.contactName}</p>
        </div>
        <div className={styles.field}>
          <label>{strings.jobDetail.phone}</label>
          <p>
            <a
              href={`tel:${job.contactPhone.replace(/[^+\d]/g, '')}`}
              aria-label={`Call ${job.contactName}, ${job.contactPhone}`}
              className={styles.phoneLink}
            >
              <Phone size={16} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {job.contactPhone}
            </a>
          </p>
        </div>
        <div className={styles.field}>
          <label>{strings.jobDetail.workDescription}</label>
          <p>{job.workDescription}</p>
        </div>
        <div className={styles.field}>
          <label>{strings.jobDetail.comments}</label>
          <p>{job.comments}</p>
        </div>
        <div className={styles.field}>
          <label>{strings.jobDetail.workCost}</label>
          <p className={styles.cost}>{formatCurrency(job.workCost)}</p>
        </div>
      </div>

      {job.status === 'new' && (
        <button
          className={styles.actionButton}
          onClick={() => handleStatusChange('in_progress')}
        >
          {strings.jobDetail.startJob}
        </button>
      )}
      {job.status === 'in_progress' && (
        <button
          className={styles.actionButton}
          onClick={() => handleStatusChange('completed')}
        >
          {strings.jobDetail.completeJob}
        </button>
      )}

      <div className={styles.navButtons}>
        <button
          className={styles.navButton}
          onClick={() => navigate(`/jobs/${job.id}/photos`)}
        >
          <Camera size={20} /> {strings.nav.photos}
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate(`/jobs/${job.id}/expenses`)}
        >
          <CurrencyDollar size={20} /> {strings.nav.expenses}
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate(`/jobs/${job.id}/summary`)}
        >
          <ClipboardText size={20} /> {strings.nav.summary}
        </button>
      </div>

      {showConfirm && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirm status change">
          <div className={styles.dialog}>
            <p>
              {strings.confirm.changeStatus} <strong>{statusLabels[pendingStatus]}</strong>?
            </p>
            <div className={styles.dialogButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
              >
                {strings.confirm.cancel}
              </button>
              <button
                className={styles.confirmButton}
                onClick={confirmStatusChange}
              >
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
