import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import haptic from '../utils/haptic'
import { ArrowLeft, ArrowsClockwise } from '@phosphor-icons/react'
import styles from '../styles/Header.module.css'

// Map routes to their parent (back destination) and title
function getRouteInfo(pathname) {
  // /jobs/:id/photos -> back to /jobs/:id
  // /jobs/:id/expenses -> back to /jobs/:id
  // /jobs/:id/summary -> back to /jobs/:id
  // /jobs/:id -> back to /jobs
  // /sync -> back to /jobs
  // /jobs -> no back (root level within app)

  if (/^\/jobs\/\d+\/photos$/.test(pathname)) {
    const jobId = pathname.match(/\/jobs\/(\d+)/)[1]
    return { backTo: `/jobs/${jobId}`, title: 'Photos', hasBack: true }
  }
  if (/^\/jobs\/\d+\/expenses$/.test(pathname)) {
    const jobId = pathname.match(/\/jobs\/(\d+)/)[1]
    return { backTo: `/jobs/${jobId}`, title: 'Expenses', hasBack: true }
  }
  if (/^\/jobs\/\d+\/summary$/.test(pathname)) {
    const jobId = pathname.match(/\/jobs\/(\d+)/)[1]
    return { backTo: `/jobs/${jobId}`, title: 'Summary', hasBack: true }
  }
  if (/^\/jobs\/\d+$/.test(pathname)) {
    return { backTo: '/jobs', title: 'Job Detail', hasBack: true }
  }
  if (pathname === '/sync') {
    return { backTo: '/jobs', title: 'Sync Status', hasBack: true }
  }
  // /jobs or other root-level pages
  return { backTo: null, title: null, hasBack: false }
}

export default function Header() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const master = state.masters.find((m) => m.id === state.selectedMasterId)

  const { backTo, title, hasBack } = getRouteInfo(location.pathname)

  // Determine display title: use route-specific title, or fall back to master name
  const displayTitle = title || (master ? master.name : 'JobTrackr')

  const handleToggleNetwork = useCallback(() => {
    const wasOffline = !state.isOnline
    dispatch({ type: 'TOGGLE_NETWORK' })
    if (wasOffline) {
      setTimeout(() => {
        dispatch({ type: 'SYNC_COMPLETE' })
        const hasErrors = state.jobs.some(
          (j) => j.syncStatus === 'error' || j.syncStatus === 'conflict'
        )
        if (hasErrors) {
          haptic.error()
        }
      }, 1800)
    }
  }, [state.isOnline, state.jobs, dispatch])

  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerLeft}>
        {hasBack && (
          <button
            className={styles.backButton}
            onClick={() => navigate(backTo)}
            aria-label="Go back"
          >
            <ArrowLeft size={24} weight="regular" />
          </button>
        )}
        <h1 className={styles.title}>{displayTitle}</h1>
      </div>
      <div className={styles.headerRight}>
        <button
          className={styles.actionButton}
          onClick={() => navigate('/sync')}
          aria-label="View sync status"
        >
          <ArrowsClockwise size={24} weight="regular" />
        </button>
      </div>
    </header>
  )
}
