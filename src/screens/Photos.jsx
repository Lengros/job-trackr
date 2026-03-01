import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import { ArrowLeft, Camera, Trash, Plus } from '@phosphor-icons/react'
import styles from '../styles/Photos.module.css'

export default function Photos() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const jobPhotos = state.photos.filter((p) => p.jobId === Number(jobId))

  const handleAddPhoto = () => {
    setUploading(true)
    setTimeout(() => {
      dispatch({ type: 'ADD_PHOTO', payload: { jobId: Number(jobId) } })
      haptic.success()
      setUploading(false)
    }, 1500)
  }

  const handleDelete = (photoId) => {
    setDeleteTarget(photoId)
  }

  const confirmDelete = () => {
    dispatch({ type: 'DELETE_PHOTO', payload: { photoId: deleteTarget } })
    setDeleteTarget(null)
  }

  return (
    <PageTransition>
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(`/jobs/${jobId}`)} aria-label="Back to job detail">
        <ArrowLeft size={20} aria-hidden="true" /> Back
      </button>
      <h2 className={styles.title}>Photos</h2>
      <p className={styles.count} aria-live="polite">
        {jobPhotos.length} {jobPhotos.length === 1 ? 'photo' : 'photos'}
      </p>

      {jobPhotos.length === 0 && !uploading ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true"><Camera size={48} /></span>
          <p>No photos yet</p>
          <p className={styles.emptyHint}>Add your first photo to document this job</p>
        </div>
      ) : (
        <div className={styles.grid} role="list" aria-label="Photo gallery">
          {jobPhotos.map((photo, index) => (
            <div key={photo.id} className={styles.thumbnail} role="listitem">
              <div className={styles.placeholder} role="img" alt={`Job photo ${index + 1}`} aria-label={`Job photo ${index + 1}`}>
                <Camera size={32} aria-hidden="true" />
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(photo.id)}
                aria-label={`Delete photo ${index + 1}`}
              >
                <Trash size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
          {uploading && (
            <div className={`${styles.thumbnail} ${styles.uploading}`} role="listitem" aria-label="Uploading photo">
              <div className={styles.spinner} aria-label="Upload in progress" role="status" />
            </div>
          )}
        </div>
      )}

      <button
        className={styles.addButton}
        onClick={handleAddPhoto}
        disabled={uploading}
        aria-label={uploading ? 'Uploading photo' : 'Add photo'}
      >
        {uploading ? 'Uploading...' : <><Plus size={20} aria-hidden="true" /> Add Photo</>}
      </button>

      {deleteTarget !== null && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirm photo deletion">
          <div className={styles.dialog}>
            <p>Delete this photo?</p>
            <div className={styles.dialogButtons}>
              <button className={styles.cancelButton} onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className={styles.confirmButton} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}
