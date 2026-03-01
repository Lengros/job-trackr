import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import { Phone, Camera, CurrencyDollar, ClipboardText } from '@phosphor-icons/react'
import styles from '../styles/JobDetail.module.css'

const STATUS_LABELS = {
  new: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  const job = state.jobs.find((j) => j.id === Number(jobId))

  if (!job) {
    return <div className={styles.notFound}>Job not found</div>
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
      message: `Status changed \u2192 ${STATUS_LABELS[targetStatus]}`,
      actionLabel: 'Undo',
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
        <span className={styles.statusLabel}>{STATUS_LABELS[job.status]}</span>
      </div>

      <div className={styles.infoCard}>
        <h2 className={styles.jobNumber}>{job.number}</h2>
        <div className={styles.field}>
          <label>Address</label>
          <p>{job.address}</p>
        </div>
        <div className={styles.field}>
          <label>Contact</label>
          <p>{job.contactName}</p>
        </div>
        <div className={styles.field}>
          <label>Phone</label>
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
          <label>Work Description</label>
          <p>{job.workDescription}</p>
        </div>
        <div className={styles.field}>
          <label>Comments</label>
          <p>{job.comments}</p>
        </div>
        <div className={styles.field}>
          <label>Work Cost</label>
          <p className={styles.cost}>${job.workCost.toFixed(2)}</p>
        </div>
      </div>

      {job.status === 'new' && (
        <button
          className={styles.actionButton}
          onClick={() => handleStatusChange('in_progress')}
        >
          Start Job
        </button>
      )}
      {job.status === 'in_progress' && (
        <button
          className={styles.actionButton}
          onClick={() => handleStatusChange('completed')}
        >
          Complete Job
        </button>
      )}

      <div className={styles.navButtons}>
        <button
          className={styles.navButton}
          onClick={() => navigate(`/jobs/${job.id}/photos`)}
        >
          <Camera size={20} /> Photos
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate(`/jobs/${job.id}/expenses`)}
        >
          <CurrencyDollar size={20} /> Expenses
        </button>
        <button
          className={styles.navButton}
          onClick={() => navigate(`/jobs/${job.id}/summary`)}
        >
          <ClipboardText size={20} /> Summary
        </button>
      </div>

      {showConfirm && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirm status change">
          <div className={styles.dialog}>
            <p>
              Change status to <strong>{STATUS_LABELS[pendingStatus]}</strong>?
            </p>
            <div className={styles.dialogButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={confirmStatusChange}
              >
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
