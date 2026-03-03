import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import PageTransition from '../components/PageTransition'
import EmptyState from '../components/EmptyState'
import { Camera, X, Image } from '@phosphor-icons/react'
import styles from '../styles/Photos.module.css'

export default function Photos() {
  const { jobId } = useParams()
  const { state, dispatch } = useApp()
  const strings = useStrings()
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const jobPhotos = state.photos.filter((p) => p.jobId === Number(jobId))

  const handleAddPhoto = () => {
    setUploading(true)
    setTimeout(() => {
      dispatch({ type: 'ADD_PHOTO', payload: { jobId: Number(jobId) } })
      haptic.success()
      setUploading(false)
    }, 1500)
  }

  const handleCameraClick = () => {
    // In a real app, cameraInputRef.current.click() would open the camera
    // For the prototype, we just simulate the upload
    handleAddPhoto()
  }

  const handleGalleryClick = () => {
    // In a real app, galleryInputRef.current.click() would open the gallery
    // For the prototype, we just simulate the upload
    handleAddPhoto()
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
      {/* Hidden file inputs for camera and gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.hiddenInput}
        onChange={() => {}}
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={() => {}}
        aria-hidden="true"
        tabIndex={-1}
      />

      <h2 className={styles.title}>{strings.photos.title}</h2>
      <p className={styles.count} aria-live="polite">
        {jobPhotos.length} {jobPhotos.length === 1 ? strings.photos.photoSingular : (jobPhotos.length >= 2 && jobPhotos.length <= 4) ? strings.photos.photoPlural : strings.photos.photoPluralMany}
      </p>

      {jobPhotos.length === 0 && !uploading ? (
        <EmptyState
          icon={<Camera size={48} />}
          title={strings.empty.noPhotos}
          subtitle={strings.empty.noPhotosSubtitle}
          actionLabel={strings.empty.addPhoto}
          onAction={handleCameraClick}
        />
      ) : (
        <div className={styles.grid} role="list" aria-label={strings.photos.gallery}>
          {jobPhotos.map((photo, index) => (
            <div key={photo.id} className={styles.thumbnail} role="listitem">
              {photo.thumbnailUrl ? (
                <img
                  className={styles.thumbnailImage}
                  src={photo.thumbnailUrl}
                  alt={strings.aria.jobPhoto.replace('{index}', index + 1)}
                />
              ) : (
                <div className={styles.placeholder} role="img" aria-label={strings.aria.jobPhoto.replace('{index}', index + 1)}>
                  <Camera size={32} aria-hidden="true" />
                </div>
              )}
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(photo.id)}
                aria-label={strings.aria.deletePhoto.replace('{index}', index + 1)}
              >
                <X size={14} weight="bold" aria-hidden="true" />
              </button>
            </div>
          ))}
          {/* Add-new slot in the grid */}
          <div
            className={`${styles.addSlot} interactive`}
            role="button"
            tabIndex={0}
            onClick={uploading ? undefined : handleCameraClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!uploading) handleCameraClick(); } }}
            aria-label={uploading ? strings.photos.uploadingLabel : strings.photos.addPhotoLabel}
            aria-disabled={uploading}
          >
            {uploading ? (
              <div className={styles.spinner} aria-label={strings.photos.uploadInProgress} role="status" />
            ) : (
              <Camera size={32} weight="light" aria-hidden="true" />
            )}
          </div>
        </div>
      )}

      {/* Gallery chip for secondary action */}
      {jobPhotos.length > 0 && (
        <button
          className={styles.galleryChip}
          onClick={uploading ? undefined : handleGalleryClick}
          disabled={uploading}
          aria-label="Gallery"
        >
          <Image size={16} aria-hidden="true" />
          Gallery
        </button>
      )}

      {/* FAB: Floating Action Button for camera */}
      <button
        className={`${styles.fab} interactive`}
        onClick={uploading ? undefined : handleCameraClick}
        disabled={uploading}
        aria-label={uploading ? strings.photos.uploadingLabel : strings.photos.addPhotoLabel}
      >
        <Camera size={24} weight="fill" aria-hidden="true" />
      </button>

      {deleteTarget !== null && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={strings.confirm.photoDeletion}>
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
