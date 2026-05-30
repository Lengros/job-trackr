import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import { ArrowLeft, ArrowsClockwise, Circle, WarningCircle } from '@phosphor-icons/react'
import LanguageSwitcher from './LanguageSwitcher'
import styles from '../styles/Header.module.css'

// Map routes to their parent (back destination) and title key.
// `listRoot` is the user's home-list screen: /home for a master, /jobs for a
// foreman — so Back from a job leads to the list the user actually came from.
function getRouteInfo(pathname, listRoot) {
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
    return { backTo: listRoot, title: 'jobDetail', hasBack: true }
  }
  if (pathname === '/sync') {
    return { backTo: listRoot, title: 'syncStatus', hasBack: true }
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
  const { state } = useApp()
  const strings = useStrings()
  const navigate = useNavigate()
  const location = useLocation()
  const master = state.masters.find((m) => m.id === state.selectedMasterId)

  // Master's list home is /home; foreman's is /jobs (mirrors BottomTabBar).
  const listRoot = master?.role === 'foreman' ? '/jobs' : '/home'
  const { backTo, title: titleKey, hasBack } = getRouteInfo(location.pathname, listRoot)
  const localizedTitle = titleKey ? strings.nav[titleKey] : null
  const displayTitle = localizedTitle || (master ? master.name : strings.app.name)

  const syncState = useMemo(() => getSyncState(state), [
    state.isOnline,
    state.isSyncing,
    state.jobs,
    state.selectedMasterId,
  ])

  // Render the sync indicator based on state
  const renderSyncIndicator = () => {
    // Online + Synced = hidden (no visual noise)
    if (syncState === 'synced') {
      return null
    }

    // Online + Syncing = rotating blue spinner + text
    if (syncState === 'syncing') {
      return (
        <button
          className={`${styles.syncIndicator} ${styles.syncSyncing}`}
          onClick={() => navigate('/sync')}
          aria-label={strings.syncStatus.syncing}
        >
          <ArrowsClockwise size={16} weight="bold" className={styles.spinIcon} />
          <span className={styles.syncText}>{strings.syncStatus.syncing}</span>
        </button>
      )
    }

    // Offline = empty circle
    if (syncState === 'offline') {
      return (
        <button
          className={`${styles.syncIndicator} ${styles.syncOffline}`}
          onClick={() => navigate('/profile')}
          aria-label={strings.network.offline}
        >
          <Circle size={16} weight="regular" />
        </button>
      )
    }

    // Sync Error = warning circle in error color + text
    if (syncState === 'error') {
      return (
        <button
          className={`${styles.syncIndicator} ${styles.syncError}`}
          onClick={() => navigate('/sync')}
          aria-label={strings.syncIndicator?.error || strings.syncStatus.error}
        >
          <WarningCircle size={16} weight="fill" />
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
            className={`${styles.backButton} interactive`}
            onClick={() => navigate(backTo)}
            aria-label={strings.nav.goBack}
          >
            <ArrowLeft size={24} weight="bold" />
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
