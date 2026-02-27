import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import PageTransition from '../components/PageTransition'
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
      setUploading(false)
    }, 3000)
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
      <button className={styles.backButton} onClick={() => navigate(`/jobs/${jobId}`)}>
        ← Back
      </button>
      <h2 className={styles.title}>Photos</h2>
      <p className={styles.count}>
        {jobPhotos.length} {jobPhotos.length === 1 ? 'photo' : 'photos'}
      </p>

      {jobPhotos.length === 0 && !uploading ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📷</span>
          <p>No photos yet</p>
          <p className={styles.emptyHint}>Add your first photo to document this job</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {jobPhotos.map((photo) => (
            <div key={photo.id} className={styles.thumbnail}>
              <div className={styles.placeholder}>📷</div>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(photo.id)}
                aria-label="Delete photo"
              >
                ✕
              </button>
            </div>
          ))}
          {uploading && (
            <div className={`${styles.thumbnail} ${styles.uploading}`}>
              <div className={styles.spinner} />
            </div>
          )}
        </div>
      )}

      <button
        className={styles.addButton}
        onClick={handleAddPhoto}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : '+ Add Photo'}
      </button>

      {deleteTarget !== null && (
        <div className={styles.overlay}>
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
