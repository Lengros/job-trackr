import { useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import haptic from '../utils/haptic'
import { ArrowLeft, ArrowsClockwise, Circle, WarningCircle } from '@phosphor-icons/react'
import LanguageSwitcher from './LanguageSwitcher'
import styles from '../styles/Header.module.css'

// Map routes to their parent (back destination) and title key
function getRouteInfo(pathname) {
  if (/^\/jobs\/\d+\/photos$/.test(pathname)) {
    const jobId = pathname.match(/\/jobs\/(\d+)/)[1]
    return { backTo: `/jobs/${jobId}`, title: 'photos', hasBack: true }
  }
  if (/^\/jobs\/\d+\/expenses$/.test(pathname)) {
    const jobId = pathname.match(/\/jobs\/(\d+)/)[1]
    return { backTo: `/jobs/${jobId}`, title: 'expenses', hasBack: true }
  }
  if (/^\/jobs\/\d+\/summary$/.test(pathname)) {
    const jobId = pathname.match(/\/jobs\/(\d+)/)[1]
    return { backTo: `/jobs/${jobId}`, title: 'summary', hasBack: true }
  }
  if (/^\/jobs\/\d+$/.test(pathname)) {
    return { backTo: '/jobs', title: 'jobDetail', hasBack: true }
  }
  if (pathname === '/sync') {
    return { backTo: '/jobs', title: 'syncStatus', hasBack: true }
  }
  return { backTo: null, title: null, hasBack: false }
}

// Determine sync indicator state from app state
function getSyncState(state) {
  if (!state.isOnline) {
    return 'offline'
  }
  if (state.isSyncing) {
    return 'syncing'
  }
  const masterJobs = state.jobs.filter(
    (j) => j.assignedMasterId === state.selectedMasterId
  )
  const hasError = masterJobs.some(
    (j) => j.syncStatus === 'error' || j.syncStatus === 'conflict'
  )
  if (hasError) {
    return 'error'
  }
  return 'synced'
}

export default function Header() {
  const { state, dispatch } = useApp()
  const strings = useStrings()
  const navigate = useNavigate()
  const location = useLocation()
  const master = state.masters.find((m) => m.id === state.selectedMasterId)

  const { backTo, title: titleKey, hasBack } = getRouteInfo(location.pathname)
  const localizedTitle = titleKey ? strings.nav[titleKey] : null
  const displayTitle = localizedTitle || (master ? master.name : strings.app.name)

  const syncState = useMemo(() => getSyncState(state), [
    state.isOnline,
    state.isSyncing,
    state.jobs,
    state.selectedMasterId,
  ])

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

  // Render the sync indicator based on state
  const renderSyncIndicator = () => {
    // Online + Synced = hidden (no visual noise)
    if (syncState === 'synced') {
      return null
    }

    // Online + Syncing = rotating blue spinner
    if (syncState === 'syncing') {
      return (
        <button
          className={`${styles.syncIndicator} ${styles.syncSyncing}`}
          onClick={() => navigate('/sync')}
          aria-label={strings.syncStatus.syncing}
        >
          <ArrowsClockwise size={20} weight="bold" className={styles.spinIcon} />
        </button>
      )
    }

    // Offline = empty circle in warning color
    if (syncState === 'offline') {
      return (
        <button
          className={`${styles.syncIndicator} ${styles.syncOffline}`}
          onClick={handleToggleNetwork}
          aria-label={strings.network.offline}
        >
          <Circle size={20} weight="regular" />
        </button>
      )
    }

    // Sync Error = warning triangle in error color
    if (syncState === 'error') {
      return (
        <button
          className={`${styles.syncIndicator} ${styles.syncError}`}
          onClick={() => navigate('/sync')}
          aria-label={strings.syncStatus.error}
        >
          <WarningCircle size={20} weight="fill" />
        </button>
      )
    }

    return null
  }

  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerLeft}>
        {hasBack && (
          <button
            className={styles.backButton}
            onClick={() => navigate(backTo)}
            aria-label={strings.nav.goBack}
          >
            <ArrowLeft size={24} weight="regular" />
          </button>
        )}
        <h1 className={styles.title}>{displayTitle}</h1>
      </div>
      <div className={styles.headerRight}>
        <LanguageSwitcher />
        {renderSyncIndicator()}
      </div>
    </header>
  )
}
