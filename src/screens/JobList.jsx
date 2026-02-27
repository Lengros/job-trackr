import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import PageTransition from '../components/PageTransition'
import styles from '../styles/JobList.module.css'

const TABS = ['all', 'new', 'in_progress', 'completed']
const TAB_LABELS = { all: 'All', new: 'New', in_progress: 'In Progress', completed: 'Completed' }

const STATUS_CLASS = {
  new: 'statusNew',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
}

const SYNC_ICONS = {
  synced: '\u2713',
  pending: '\u25F7',
  error: '\u26A0',
  conflict: '\u26A1',
}

const PULL_THRESHOLD = 60

export default function JobList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startYRef = useRef(null)
  const pullingRef = useRef(false)
  const listRef = useRef(null)

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
            {TAB_LABELS[tab]}
            <span className={styles.count}>{getCount(tab)}</span>
          </button>
        ))}
      </div>

      {showIndicator && (
        <div
          className={`${styles.pullIndicator} ${refreshing ? styles.pullRefreshing : ''}`}
          style={refreshing ? {} : { height: `${pullDistance}px`, opacity: Math.min(pullDistance / PULL_THRESHOLD, 1) }}
          aria-label="Pull to refresh indicator"
        >
          <div className={`${styles.pullSpinner} ${refreshing ? styles.spinning : ''}`}>
            {refreshing ? '↻' : pullDistance >= PULL_THRESHOLD ? '↓ Release to refresh' : '↓ Pull to refresh'}
          </div>
        </div>
      )}

      <div className={styles.list}>
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <p>No {activeTab === 'all' ? '' : TAB_LABELS[activeTab].toLowerCase()} jobs</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <button
              key={job.id}
              className={styles.card}
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.jobNumber}>{job.number}</span>
                <span
                  className={`${styles.statusBadge} ${styles[STATUS_CLASS[job.status]] || ''}`}
                >
                  {TAB_LABELS[job.status] || job.status}
                </span>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.address}>{job.address}</span>
                <span className={styles.workType}>{job.workType}</span>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.date}>
                  {new Date(job.createdDate).toLocaleDateString()}
                </span>
                <span
                  className={`${styles.syncIcon} ${styles[`sync_${job.syncStatus}`]}`}
                  title={job.syncStatus}
                >
                  {SYNC_ICONS[job.syncStatus] || '?'}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
    </PageTransition>
  )
}
