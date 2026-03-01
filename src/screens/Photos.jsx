import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import { Camera, Trash, Plus } from '@phosphor-icons/react'
import styles from '../styles/Photos.module.css'

export default function Photos() {
  const { jobId } = useParams()
  const { state, dispatch } = useApp()
  const strings = useStrings()
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
      <h2 className={styles.title}>{strings.photos.title}</h2>
      <p className={styles.count} aria-live="polite">
        {jobPhotos.length} {jobPhotos.length === 1 ? strings.photos.photoSingular : (jobPhotos.length >= 2 && jobPhotos.length <= 4) ? strings.photos.photoPlural : strings.photos.photoPluralMany}
      </p>

      {jobPhotos.length === 0 && !uploading ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true"><Camera size={48} /></span>
          <p>{strings.photos.noPhotos}</p>
          <p className={styles.emptyHint}>{strings.photos.addFirstPhoto}</p>
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
        {uploading ? strings.photos.uploading : <><Plus size={20} aria-hidden="true" /> {strings.photos.addPhoto}</>}
      </button>

      {deleteTarget !== null && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Confirm photo deletion">
          <div className={styles.dialog}>
            <p>{strings.confirm.deletePhoto}</p>
            <div className={styles.dialogButtons}>
              <button className={styles.cancelButton} onClick={() => setDeleteTarget(null)}>
                {strings.confirm.cancel}
              </button>
              <button className={styles.confirmButton} onClick={confirmDelete}>
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
