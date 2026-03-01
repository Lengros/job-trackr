import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings, useCurrencyFormatter, useDateFormatter } from '../i18n/useStrings'
import PageTransition from '../components/PageTransition'
import SkeletonCard from '../components/SkeletonCard'
import { CheckCircle, Clock, ArrowsClockwise, Warning, Lightning, ArrowDown, ClipboardText, WifiSlash } from '@phosphor-icons/react'
import styles from '../styles/JobList.module.css'

const TABS = ['all', 'new', 'in_progress', 'completed']

const STATUS_CLASS = {
  new: 'statusNew',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
}

const PULL_THRESHOLD = 60
const SKELETON_LOAD_MS = 800

export default function JobList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const strings = useStrings()
  const formatCurrency = useCurrencyFormatter()
  const formatDate = useDateFormatter()

  const tabLabels = {
    all: strings.tabs.all,
    new: strings.tabs.new,
    in_progress: strings.tabs.inProgress,
    completed: strings.tabs.completed,
  }

  const statusLabels = {
    new: strings.status.new,
    in_progress: strings.status.inProgress,
    completed: strings.status.completed,
  }

  const syncStatusLabels = {
    synced: strings.syncStatus.synced,
    syncing: strings.syncStatus.syncing,
    pending: strings.syncStatus.pending,
    error: strings.syncStatus.error,
    conflict: strings.syncStatus.conflict,
  }

  const [activeTab, setActiveTab] = useState('all')
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const startYRef = useRef(null)
  const pullingRef = useRef(false)
  const listRef = useRef(null)

  // Simulate initial data load with skeleton screens
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, SKELETON_LOAD_MS)
    return () => clearTimeout(timer)
  }, [])

  const masterJobs = state.jobs.filter(
    (job) => job.assignedMasterId === state.selectedMasterId
  )

  const filteredJobs =
    activeTab === 'all'
      ? masterJobs
      : masterJobs.filter((job) => job.status === activeTab)

  const getCount = (tab) =>
    tab === 'all'
      ? masterJobs.length
      : masterJobs.filter((j) => j.status === tab).length

  const triggerRefresh = useCallback(() => {
    setRefreshing(true)
    setPullDistance(0)
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }, [])

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return
    const scrollTop = listRef.current ? listRef.current.scrollTop : 0
    if (scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY
      pullingRef.current = true
    }
  }, [refreshing])

  const handleTouchMove = useCallback((e) => {
    if (!pullingRef.current || refreshing || startYRef.current === null) return
    const currentY = e.touches[0].clientY
    const diff = currentY - startYRef.current
    if (diff > 0) {
      const dampened = Math.min(diff * 0.5, 120)
      setPullDistance(dampened)
    }
  }, [refreshing])

  const handleTouchEnd = useCallback(() => {
    if (!pullingRef.current) return
    pullingRef.current = false
    startYRef.current = null
    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh()
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, triggerRefresh])

  const handleMouseDown = useCallback((e) => {
    if (refreshing) return
    const scrollTop = listRef.current ? listRef.current.scrollTop : 0
    if (scrollTop <= 0) {
      startYRef.current = e.clientY
      pullingRef.current = true
    }
  }, [refreshing])

  const handleMouseMove = useCallback((e) => {
    if (!pullingRef.current || refreshing || startYRef.current === null) return
    const diff = e.clientY - startYRef.current
    if (diff > 0) {
      const dampened = Math.min(diff * 0.5, 120)
      setPullDistance(dampened)
    }
  }, [refreshing])

  const handleMouseUp = useCallback(() => {
    if (!pullingRef.current) return
    pullingRef.current = false
    startYRef.current = null
    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh()
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, triggerRefresh])

  // Keyboard shortcut: press 'r' to trigger refresh (desktop accessibility)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' && !refreshing && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        triggerRefresh()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [refreshing, triggerRefresh])

  const showIndicator = refreshing || pullDistance > 0

  return (
    <PageTransition>
    <div
      className={styles.container}
      ref={listRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
            <span className={styles.count}>{getCount(tab)}</span>
          </button>
        ))}
      </div>

      {showIndicator && (
        <div
          className={`${styles.pullIndicator} ${refreshing ? styles.pullRefreshing : ''}`}
          style={refreshing ? {} : { height: `${pullDistance}px`, opacity: Math.min(pullDistance / PULL_THRESHOLD, 1) }}
          aria-label={strings.pullToRefresh.indicator}
        >
          <div className={`${styles.pullSpinner} ${refreshing ? styles.spinning : ''}`}>
            {refreshing ? <ArrowsClockwise size={20} /> : pullDistance >= PULL_THRESHOLD ? <><ArrowDown size={20} /> {strings.pullToRefresh.release}</> : <><ArrowDown size={20} /> {strings.pullToRefresh.pull}</>}
          </div>
        </div>
      )}

      <div className={styles.list} role="list" aria-label={strings.aria.jobList}>
        {isLoading && !(!state.isOnline && masterJobs.length === 0) ? (
          /* Show 3 skeleton cards during initial data load */
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !state.isOnline && masterJobs.length === 0 ? (
          /* Offline with no cached data: show empty state with retry button */
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} role="img" aria-hidden="true"><WifiSlash size={48} /></span>
            <p className={styles.emptyTitle}>{strings.empty.offline}</p>
            <p className={styles.emptySubtext}>{strings.empty.offlineMessage}</p>
            <button
              className={styles.retryButton}
              onClick={() => {
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), SKELETON_LOAD_MS)
              }}
            >
              {strings.empty.retry}
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} role="img" aria-hidden="true"><ClipboardText size={48} /></span>
            <p>{activeTab === 'all' ? strings.empty.noJobs : `${strings.empty.noJobs} (${tabLabels[activeTab].toLowerCase()})`}</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <button
              key={job.id}
              className={styles.card}
              onClick={() => navigate(`/jobs/${job.id}`)}
              role="listitem"
              aria-label={`${job.number}, ${job.address}, ${statusLabels[job.status] || job.status}`}
            >
              <div className={styles.cardTop}>
                <span className={`${styles.statusDot} ${styles[STATUS_CLASS[job.status]] || ''}`} />
                <span className={styles.address}>{job.address}</span>
              </div>
              <div className={styles.cardMiddle}>
                <span className={styles.contact}>{job.contactName}</span>
                <span className={styles.separator}>·</span>
                <span className={styles.time}>
                  {formatDate(job.createdDate)}
                </span>
              </div>
              <span className={styles.workType}>{job.workType}</span>
              <div className={styles.cardBottom}>
                <span
                  className={`${styles.statusBadge} ${styles[STATUS_CLASS[job.status]] || ''}`}
                  role="status"
                  aria-live="polite"
                >
                  {statusLabels[job.status] || job.status}
                </span>
                <div className={styles.cardBottomRight}>
                  <span className={styles.amount}>{formatCurrency(job.workCost)}</span>
                  <span
                    className={`${styles.syncIcon} ${styles[`sync_${job.syncStatus}`]}`}
                    title={syncStatusLabels[job.syncStatus] || job.syncStatus}
                    aria-label={`${strings.nav.sync}: ${syncStatusLabels[job.syncStatus] || job.syncStatus}`}
                    role="img"
                  >
                    {job.syncStatus === 'synced' && <CheckCircle size={16} />}
                    {job.syncStatus === 'pending' && <Clock size={16} />}
                    {job.syncStatus === 'syncing' && <ArrowsClockwise size={16} />}
                    {job.syncStatus === 'error' && <Warning size={16} />}
                    {job.syncStatus === 'conflict' && <Lightning size={16} />}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
    </PageTransition>
  )
}
