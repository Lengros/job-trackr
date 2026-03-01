import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useStrings, formatCurrency } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import {
  Phone,
  MapPin,
  Camera,
  CurrencyDollar,
  Plus,
  Trash,
  PencilSimple,
} from '@phosphor-icons/react'
import styles from '../styles/JobDetail.module.css'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const strings = useStrings()
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deletePhotoTarget, setDeletePhotoTarget] = useState(null)
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState(null)
  const [notesText, setNotesText] = useState(null) // lazy init from job.notes

  const statusLabels = {
    new: strings.status.new,
    in_progress: strings.status.inProgress,
    completed: strings.status.completed,
  }

  const job = state.jobs.find((j) => j.id === Number(jobId))

  if (!job) {
    return <div className={styles.notFound}>{strings.jobDetail.notFound}</div>
  }

  const jobPhotos = state.photos.filter((p) => p.jobId === Number(jobId))
  const jobExpenses = state.expenses.filter((e) => e.jobId === Number(jobId))
  const totalExpenses = jobExpenses.reduce(
    (sum, e) => sum + Math.round(e.quantity * e.unitPrice * 100) / 100,
    0
  )
  const grandTotal = (job.workCost || 0) + totalExpenses
  // Lazy-initialize notes from job state
  const currentNotes = notesText !== null ? notesText : (job.notes || '')
  const charCount = currentNotes.length

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

  // Notes handlers
  const handleNotesChange = (e) => {
    const value = e.target.value.slice(0, 500)
    setNotesText(value)
  }

  const handleNotesBlur = () => {
    const value = currentNotes
    if (value !== (job.notes || '')) {
      dispatch({
        type: 'UPDATE_JOB_NOTES',
        payload: { jobId: job.id, notes: value },
      })
    }
  }

  // Photos
  const handleAddPhoto = () => {
    setUploading(true)
    setTimeout(() => {
      dispatch({ type: 'ADD_PHOTO', payload: { jobId: Number(jobId) } })
      haptic.success()
      setUploading(false)
    }, 1500)
  }

  const confirmDeletePhoto = () => {
    dispatch({ type: 'DELETE_PHOTO', payload: { photoId: deletePhotoTarget } })
    setDeletePhotoTarget(null)
  }

  // Expenses
  const confirmDeleteExpense = () => {
    dispatch({
      type: 'DELETE_EXPENSE',
      payload: { expenseId: deleteExpenseTarget },
    })
    setDeleteExpenseTarget(null)
  }

  // Geo link for address
  const geoLink = `geo:0,0?q=${encodeURIComponent(job.address)}`

  // CTA label
  const ctaLabel =
    job.status === 'new'
      ? strings.jobDetail.startJob
      : job.status === 'in_progress'
      ? strings.jobDetail.completeJob
      : null
  const ctaAction =
    job.status === 'new'
      ? () => handleStatusChange('in_progress')
      : job.status === 'in_progress'
      ? () => handleStatusChange('completed')
      : null

  return (
    <PageTransition>
      <div className={styles.container}>
        {/* Status Badge */}
        <div
          className={styles.statusBar}
          data-status={job.status}
          role="status"
          aria-live="polite"
        >
          <span className={styles.statusLabel}>
            {statusLabels[job.status]}
          </span>
        </div>

        {/* Address as h1 with MapPin */}
        <a
          href={geoLink}
          className={styles.addressLink}
          aria-label={`${job.address} — ${strings.jobDetail.openMap}`}
        >
          <MapPin size={20} weight="bold" className={styles.mapIcon} aria-hidden="true" />
          <h1 className={styles.address}>{job.address}</h1>
        </a>

        {/* Client name */}
        <p className={styles.clientName}>{job.contactName}</p>

        {/* Phone row - entire row tappable */}
        <a
          href={`tel:${job.contactPhone.replace(/[^+\d]/g, '')}`}
          className={styles.phoneRow}
          aria-label={strings.aria.callContact.replace('{name}', job.contactName).replace('{phone}', job.contactPhone)}
        >
          <Phone size={20} weight="bold" aria-hidden="true" />
          <span>{job.contactPhone}</span>
        </a>

        {/* Scope of Work */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {strings.jobDetail.scopeOfWork}
          </h2>
          <p className={styles.sectionBody}>{job.workDescription}</p>
        </section>

        {/* Notes / Comments */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{strings.jobDetail.notes}</h2>
          <div className={styles.notesWrapper}>
            <textarea
              className={styles.notesTextarea}
              value={currentNotes}
              placeholder={strings.jobDetail.notesPlaceholder}
              maxLength={500}
              onChange={handleNotesChange}
              onBlur={handleNotesBlur}
              rows={3}
            />
            <span className={styles.charCount}>
              {charCount}/500
            </span>
          </div>
        </section>

        {/* Photos section inline */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {strings.nav.photos}
              <span className={styles.badge}>{jobPhotos.length}</span>
            </h2>
            <button
              className={styles.inlineAddBtn}
              onClick={handleAddPhoto}
              disabled={uploading}
            >
              {uploading ? (
                strings.photos.uploading
              ) : (
                <>{strings.jobDetail.addPhoto}</>
              )}
            </button>
          </div>
          {jobPhotos.length === 0 && !uploading ? (
            <p className={styles.emptyHint}>{strings.photos.noPhotos}</p>
          ) : (
            <div className={styles.photoGrid}>
              {jobPhotos.map((photo, index) => (
                <div key={photo.id} className={styles.photoThumb}>
                  <div className={styles.photoPlaceholder}>
                    <Camera size={24} aria-hidden="true" />
                  </div>
                  <button
                    className={styles.photoDeleteBtn}
                    onClick={() => setDeletePhotoTarget(photo.id)}
                    aria-label={strings.aria.deletePhoto.replace('{index}', index + 1)}
                  >
                    <Trash size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
              {uploading && (
                <div className={`${styles.photoThumb} ${styles.photoUploading}`}>
                  <div className={styles.spinner} />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Expenses section inline */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {strings.nav.expenses}
              <span className={styles.badge}>{jobExpenses.length}</span>
            </h2>
            <button
              className={styles.inlineAddBtn}
              onClick={() => navigate(`/jobs/${job.id}/expenses`)}
            >
              {strings.jobDetail.addExpense}
            </button>
          </div>
          {jobExpenses.length === 0 ? (
            <p className={styles.emptyHint}>{strings.expenses.noExpenses}</p>
          ) : (
            <div className={styles.expenseList}>
              {jobExpenses.map((expense) => (
                <div key={expense.id} className={styles.expenseRow}>
                  <div className={styles.expenseInfo}>
                    <span className={styles.expenseName}>{expense.name}</span>
                    <span className={styles.expenseDetail}>
                      {expense.quantity} × {formatCurrency(expense.unitPrice)}
                    </span>
                  </div>
                  <div className={styles.expenseRight}>
                    <span className={styles.expenseTotal}>
                      {formatCurrency(
                        Math.round(expense.quantity * expense.unitPrice * 100) /
                          100
                      )}
                    </span>
                    <div className={styles.expenseActions}>
                      <button
                        className={styles.expenseActionBtn}
                        onClick={() =>
                          navigate(`/jobs/${job.id}/expenses`)
                        }
                        aria-label={strings.aria.editExpense.replace('{name}', expense.name)}
                      >
                        <PencilSimple size={14} aria-hidden="true" />
                      </button>
                      <button
                        className={styles.expenseActionBtn}
                        onClick={() => setDeleteExpenseTarget(expense.id)}
                        aria-label={strings.aria.deleteExpense.replace('{name}', expense.name)}
                      >
                        <Trash size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Totals */}
        <section className={styles.totalsSection}>
          <div className={styles.totalRow}>
            <span>{strings.jobDetail.materialsTotal}</span>
            <span>{formatCurrency(totalExpenses)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>{strings.jobDetail.laborCost}</span>
            <span>{formatCurrency(job.workCost)}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.grandTotalRow}>
            <span>{strings.jobDetail.grandTotal}</span>
            <span className={styles.grandTotalAmount}>
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </section>

        {/* Spacer for sticky CTA */}
        {ctaLabel && <div className={styles.ctaSpacer} />}

        {/* Sticky bottom CTA */}
        {ctaLabel && (
          <div className={styles.stickyCtaBar}>
            <button className={styles.ctaButton} onClick={ctaAction}>
              {ctaLabel}
            </button>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={strings.confirm.statusChange}
          >
            <div className={styles.dialog}>
              <p>
                {strings.confirm.changeStatus}{' '}
                <strong>{statusLabels[pendingStatus]}</strong>?
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

        {/* Photo delete confirmation */}
        {deletePhotoTarget !== null && (
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={strings.confirm.photoDeletion}
          >
            <div className={styles.dialog}>
              <p>{strings.confirm.deletePhoto}</p>
              <div className={styles.dialogButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setDeletePhotoTarget(null)}
                >
                  {strings.confirm.cancel}
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={confirmDeletePhoto}
                >
                  {strings.confirm.delete}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expense delete confirmation */}
        {deleteExpenseTarget !== null && (
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={strings.confirm.expenseDeletion}
          >
            <div className={styles.dialog}>
              <p>{strings.confirm.deleteExpense}</p>
              <div className={styles.dialogButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setDeleteExpenseTarget(null)}
                >
                  {strings.confirm.cancel}
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  onClick={confirmDeleteExpense}
                >
                  {strings.confirm.delete}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
