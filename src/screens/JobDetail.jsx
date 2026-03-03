import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useStrings, useCurrencyFormatter } from '../i18n/useStrings'
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
  DotsThreeVertical,
  ArrowCounterClockwise,
  Eye,
  X,
} from '@phosphor-icons/react'
import styles from '../styles/JobDetail.module.css'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const strings = useStrings()
  const formatCurrency = useCurrencyFormatter()
  const [showReopenConfirm, setShowReopenConfirm] = useState(false)
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletePhotoTarget, setDeletePhotoTarget] = useState(null)
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState(null)
  const [notesText, setNotesText] = useState(null) // lazy init from job.notes
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [viewerZoom, setViewerZoom] = useState(1)
  const pinchRef = useRef(null)
  const overflowRef = useRef(null)

  const statusLabels = {
    new: strings.status.new,
    in_progress: strings.status.inProgress,
    completed: strings.status.completed,
  }

  // Close overflow menu when clicking outside
  useEffect(() => {
    if (!showOverflowMenu) return
    const handleClickOutside = (e) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target)) {
        setShowOverflowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showOverflowMenu])

  const job = state.jobs.find((j) => j.id === Number(jobId))
  const jobIdNum = Number(jobId)

  if (!job) {
    return <div className={styles.notFound}>{strings.jobDetail.notFound}</div>
  }

  const jobPhotos = state.photos.filter((p) => p.jobId === jobIdNum)
  const jobProblemPhotos = (state.problemPhotos || []).filter((p) => p.jobId === jobIdNum)
  const activeProblemPhoto = jobProblemPhotos[viewerIndex] || null
  const jobExpenses = state.expenses.filter((e) => e.jobId === jobIdNum)
  const totalExpenses = jobExpenses.reduce(
    (sum, e) => sum + Math.round(e.quantity * e.unitPrice * 100) / 100,
    0
  )
  const grandTotal = (job.workCost || 0) + totalExpenses
  // Lazy-initialize notes from job state
  const currentNotes = notesText !== null ? notesText : (job.notes || '')
  const charCount = currentNotes.length

  // Forward status transitions: no confirmation dialog, instant dispatch + undo toast
  const handleForwardStatusChange = (newStatus) => {
    const previousStatus = job.status
    dispatch({
      type: 'UPDATE_JOB_STATUS',
      payload: { jobId: job.id, newStatus },
    })
    if (newStatus === 'completed') {
      haptic.success()
    }

    showToast({
      type: 'success',
      message: `${strings.toast.statusChanged} ${statusLabels[newStatus]}`,
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

  // Reopen (done→in_progress): requires confirmation dialog
  const handleReopenRequest = () => {
    setShowOverflowMenu(false)
    setShowReopenConfirm(true)
  }

  const confirmReopen = () => {
    const previousStatus = job.status
    dispatch({
      type: 'UPDATE_JOB_STATUS',
      payload: { jobId: job.id, newStatus: 'in_progress' },
    })
    setShowReopenConfirm(false)

    showToast({
      type: 'success',
      message: `${strings.toast.statusChanged} ${statusLabels['in_progress']}`,
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

  // Notes handler - save immediately (in-memory state, no perf concern)
  const handleNotesChange = (e) => {
    const value = e.target.value.slice(0, 500)
    setNotesText(value)
    dispatch({
      type: 'UPDATE_JOB_NOTES',
      payload: { jobId: job.id, notes: value },
    })
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

  // Geo link for address - uses geo: URI (Android/iOS support)
  // Fallback to Google Maps on desktop/unsupported platforms
  const encodedAddress = encodeURIComponent(job.address)
  const geoLink = `geo:0,0?q=${encodedAddress}`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  const handleAddressClick = (e) => {
    // Try geo: URI first (works on mobile), fallback to Google Maps
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)
    if (!isIOS && !isAndroid) {
      // Desktop: use Google Maps
      e.preventDefault()
      window.open(mapsLink, '_blank')
    }
    // On mobile, geo: URI will open the default maps app
  }

  // CTA label - forward transitions only (no confirmation needed)
  const ctaLabel =
    job.status === 'new'
      ? strings.jobDetail.startJob
      : job.status === 'in_progress'
      ? strings.jobDetail.completeJob
      : null
  const ctaAction =
    job.status === 'new'
      ? () => handleForwardStatusChange('in_progress')
      : job.status === 'in_progress'
      ? () => handleForwardStatusChange('completed')
      : null

  return (
    <PageTransition>
      <div className={styles.container}>
        {/* Status Badge + Overflow Menu */}
        <div className={styles.statusRow}>
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
          {job.status === 'completed' && (
            <div style={{ position: 'relative' }} ref={overflowRef}>
              <button
                className={styles.overflowBtn}
                onClick={() => setShowOverflowMenu((prev) => !prev)}
                aria-label="More actions"
              >
                <DotsThreeVertical size={24} weight="bold" />
              </button>
              {showOverflowMenu && (
                <div className={styles.overflowMenu}>
                  <button
                    className={styles.overflowMenuItem}
                    onClick={handleReopenRequest}
                  >
                    <ArrowCounterClockwise size={18} />
                    {strings.jobDetail.reopenJob}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Address as h1 with MapPin */}
        <a
          href={geoLink}
          className={styles.addressLink}
          aria-label={`${job.address} — ${strings.jobDetail.openMap}`}
          onClick={handleAddressClick}
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

        {/* Problem Photos — read-only strip from dispatcher/client */}
        {jobProblemPhotos.length > 0 && (
          <section className={styles.section}>
            <div className={styles.problemPhotosHeader}>
              <Eye size={20} weight="bold" className={styles.problemPhotosIcon} aria-hidden="true" />
              <h2 className={styles.problemPhotosTitle}>
                {strings.jobDetail.problemPhotos}
                <span className={styles.badge}>({jobProblemPhotos.length})</span>
              </h2>
            </div>
            <div className={styles.problemPhotosStrip}>
              {jobProblemPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={styles.problemPhotoThumb}
                  onClick={() => { setViewerIndex(index); setViewerOpen(true); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setViewerIndex(index); setViewerOpen(true); } }}
                  aria-label={(strings.aria.problemPhoto || 'Problem photo {index}').replace('{index}', index + 1)}
                >
                  {photo.thumbnailUrl ? (
                    <img
                      className={styles.problemPhotoAsset}
                      src={photo.thumbnailUrl}
                      alt={(strings.aria.problemPhoto || 'Problem photo {index}').replace('{index}', index + 1)}
                    />
                  ) : (
                    <div className={styles.problemPhotoPlaceholder}>
                      <Eye size={24} aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

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
                  {photo.thumbnailUrl ? (
                    <img
                      className={styles.photoAsset}
                      src={photo.thumbnailUrl}
                      alt={strings.aria.jobPhoto.replace('{index}', index + 1)}
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      <Camera size={24} aria-hidden="true" />
                    </div>
                  )}
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
            <button className={`${styles.ctaButton} interactive`} onClick={ctaAction}>
              {ctaLabel}
            </button>
          </div>
        )}

        {/* Reopen Confirmation Dialog (only for done→in_progress) */}
        {showReopenConfirm && (
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={strings.confirm.reopenConfirmation}
          >
            <div className={styles.dialog}>
              <p>{strings.confirm.reopenJob}</p>
              <div className={styles.dialogButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowReopenConfirm(false)}
                >
                  {strings.confirm.cancel}
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={confirmReopen}
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

        {/* Fullscreen Problem Photo Viewer */}
        {viewerOpen && jobProblemPhotos.length > 0 && (
          <div className={styles.photoViewer} role="dialog" aria-modal="true" aria-label="Problem photo viewer">
            <div className={styles.photoViewerTopBar}>
              <button
                className={styles.photoViewerCloseBtn}
                onClick={() => setViewerOpen(false)}
                aria-label="Close"
              >
                <X size={24} weight="bold" />
              </button>
              <span className={styles.photoViewerCounter}>
                {viewerIndex + 1}/{jobProblemPhotos.length}
              </span>
            </div>
            <div className={styles.photoViewerContent}>
              {/* Tap left edge for previous */}
              {viewerIndex > 0 && (
                <button
                  className={styles.photoViewerNavLeft}
                  onClick={() => { setViewerIndex((i) => Math.max(0, i - 1)); setViewerZoom(1); }}
                  aria-label="Previous photo"
                />
              )}
              {/* Photo display area with pinch-to-zoom and swipe */}
              <div
                className={styles.photoViewerImage}
                ref={pinchRef}
                onTouchStart={(e) => {
                  if (e.touches.length === 2) {
                    // Pinch start — record initial distance
                    const dx = e.touches[0].clientX - e.touches[1].clientX
                    const dy = e.touches[0].clientY - e.touches[1].clientY
                    e.currentTarget._pinchStartDist = Math.hypot(dx, dy)
                    e.currentTarget._pinchStartZoom = viewerZoom
                    e.currentTarget._isPinching = true
                  } else if (e.touches.length === 1) {
                    // Single touch — swipe start
                    e.currentTarget._touchStartX = e.touches[0].clientX
                    e.currentTarget._isPinching = false
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 2 && e.currentTarget._pinchStartDist) {
                    // Pinch move — update zoom
                    const dx = e.touches[0].clientX - e.touches[1].clientX
                    const dy = e.touches[0].clientY - e.touches[1].clientY
                    const currentDist = Math.hypot(dx, dy)
                    const scale = currentDist / e.currentTarget._pinchStartDist
                    const newZoom = Math.min(4, Math.max(1, e.currentTarget._pinchStartZoom * scale))
                    setViewerZoom(newZoom)
                    e.currentTarget._isPinching = true
                  }
                }}
                onTouchEnd={(e) => {
                  if (e.currentTarget._isPinching) {
                    // Was pinching — clean up
                    delete e.currentTarget._pinchStartDist
                    delete e.currentTarget._pinchStartZoom
                    e.currentTarget._isPinching = false
                    return
                  }
                  // Single touch swipe
                  const startX = e.currentTarget._touchStartX
                  if (startX === undefined) return
                  const endX = e.changedTouches[0].clientX
                  const diff = startX - endX
                  if (Math.abs(diff) > 50 && viewerZoom <= 1) {
                    if (diff > 0 && viewerIndex < jobProblemPhotos.length - 1) {
                      setViewerIndex((i) => i + 1)
                      setViewerZoom(1)
                    } else if (diff < 0 && viewerIndex > 0) {
                      setViewerIndex((i) => i - 1)
                      setViewerZoom(1)
                    }
                  }
                  delete e.currentTarget._touchStartX
                }}
              >
                {activeProblemPhoto?.thumbnailUrl ? (
                  <img
                    className={styles.photoViewerAsset}
                    src={activeProblemPhoto.remoteUrl || activeProblemPhoto.thumbnailUrl}
                    alt={(strings.aria.problemPhoto || 'Problem photo {index}').replace('{index}', viewerIndex + 1)}
                    style={{ transform: `scale(${viewerZoom})`, transition: viewerZoom === 1 ? 'transform 0.2s ease' : 'none' }}
                  />
                ) : (
                  <div
                    className={styles.photoViewerPlaceholder}
                    style={{ transform: `scale(${viewerZoom})`, transition: viewerZoom === 1 ? 'transform 0.2s ease' : 'none' }}
                  >
                    <Eye size={48} color="#888" />
                  </div>
                )}
                {/* Offline overlay */}
                {!state.isOnline && !activeProblemPhoto?.remoteUrl && (
                  <div className={styles.photoViewerOffline}>
                    {(strings.aria.noConnectionFullPhoto || 'No connection — full photo unavailable')}
                  </div>
                )}
              </div>
              {/* Tap right edge for next */}
              {viewerIndex < jobProblemPhotos.length - 1 && (
                <button
                  className={styles.photoViewerNavRight}
                  onClick={() => { setViewerIndex((i) => Math.min(jobProblemPhotos.length - 1, i + 1)); setViewerZoom(1); }}
                  aria-label="Next photo"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
