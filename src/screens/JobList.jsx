import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings, useCurrencyFormatter } from '../i18n/useStrings'
import PageTransition from '../components/PageTransition'
import SkeletonCard from '../components/SkeletonCard'
import {
  CheckCircle,
  Clock,
  ArrowsClockwise,
  Warning,
  Lightning,
  ClipboardText,
  WifiSlash,
} from '@phosphor-icons/react'
import styles from '../styles/JobList.module.css'

const TABS = ['all', 'new', 'in_progress', 'completed']

const STATUS_CLASS = {
  new: 'statusNew',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
}

const SKELETON_LOAD_MS = 800

/**
 * Format a date for header grouping (e.g., "Today", "Yesterday", "25 Feb 2026")
 */
function formatDateHeader(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const jobDay = new Date(date)
  jobDay.setHours(0, 0, 0, 0)

  const diffDays = Math.round((today - jobDay) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format time portion of a date (e.g., "09:00")
 */
function formatTime(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Sort jobs: chronological by createdDate (earliest first),
 * but completed jobs always go to the bottom.
 */
function sortJobs(jobs) {
  return [...jobs].sort((a, b) => {
    // Completed jobs go to bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1
    // Within same completion group, sort by date (earliest first)
    return new Date(a.createdDate) - new Date(b.createdDate)
  })
}

/**
 * Group sorted jobs by date for headers
 */
function groupByDate(jobs) {
  const groups = []
  let currentDate = null

  for (const job of jobs) {
    const dateKey = new Date(job.createdDate).toDateString()
    if (dateKey !== currentDate) {
      currentDate = dateKey
      groups.push({
        dateKey,
        dateLabel: formatDateHeader(job.createdDate),
        jobs: [],
      })
    }
    groups[groups.length - 1].jobs.push(job)
  }

  return groups
}

export default function JobList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const strings = useStrings()
  const formatCurrency = useCurrencyFormatter()

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
  const [isLoading, setIsLoading] = useState(true)

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

  // Sort and group
  const sortedJobs = sortJobs(filteredJobs)
  const dateGroups = groupByDate(sortedJobs)
  const hasMultipleDates = dateGroups.length > 1

  const getCount = (tab) =>
    tab === 'all'
      ? masterJobs.length
      : masterJobs.filter((j) => j.status === tab).length

  return (
    <PageTransition>
      <div className={styles.container}>
        {/* Filter chips */}
        <div className={styles.chips}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.chip} ${
                activeTab === tab ? styles.chipActive : ''
              } interactive`}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]}
              <span className={styles.chipCount}>{getCount(tab)}</span>
            </button>
          ))}
        </div>

        {/* Job list */}
        <div
          className={styles.list}
          role="list"
          aria-label={strings.aria?.jobList || 'Job list'}
        >
          {isLoading && !(!state.isOnline && masterJobs.length === 0) ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : !state.isOnline && masterJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <span
                className={styles.emptyIcon}
                role="img"
                aria-hidden="true"
              >
                <WifiSlash size={48} />
              </span>
              <p className={styles.emptyTitle}>{strings.empty.offline}</p>
              <p className={styles.emptySubtext}>
                {strings.empty.offlineMessage}
              </p>
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
              <span
                className={styles.emptyIcon}
                role="img"
                aria-hidden="true"
              >
                <ClipboardText size={48} />
              </span>
              <p>
                {activeTab === 'all'
                  ? strings.empty.noJobs
                  : `${strings.empty.noJobs} (${tabLabels[
                      activeTab
                    ].toLowerCase()})`}
              </p>
            </div>
          ) : (
            dateGroups.map((group) => (
              <div key={group.dateKey} className={styles.dateGroup}>
                {/* Date header - shown when jobs span multiple days */}
                {hasMultipleDates && (
                  <div className={styles.dateHeader}>{group.dateLabel}</div>
                )}
                {group.jobs.map((job) => (
                  <button
                    key={job.id}
                    className={`${styles.card} ${
                      job.status === 'completed' ? styles.cardCompleted : ''
                    } interactive`}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    role="listitem"
                    aria-label={`${job.number}, ${job.address}, ${
                      statusLabels[job.status] || job.status
                    }`}
                  >
                    <div className={styles.cardContent}>
                      {/* Time prefix - left aligned */}
                      <span className={styles.timePrefix}>
                        {formatTime(job.createdDate)}
                      </span>
                      {/* Card body */}
                      <div className={styles.cardBody}>
                        <div className={styles.cardTop}>
                          <span
                            className={`${styles.statusDot} ${
                              styles[STATUS_CLASS[job.status]] || ''
                            }`}
                          />
                          <span className={styles.address}>
                            {job.address}
                          </span>
                        </div>
                        <div className={styles.cardMiddle}>
                          <span className={styles.contact}>
                            {job.contactName}
                          </span>
                        </div>
                        <span className={styles.workType}>
                          {job.workType}
                        </span>
                        <div className={styles.cardBottom}>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[STATUS_CLASS[job.status]] || ''
                            }`}
                            role="status"
                            aria-live="polite"
                          >
                            {statusLabels[job.status] || job.status}
                          </span>
                          <div className={styles.cardBottomRight}>
                            <span className={styles.amount}>
                              {formatCurrency(job.workCost)}
                            </span>
                            <span
                              className={`${styles.syncIcon} ${
                                styles[`sync_${job.syncStatus}`]
                              }`}
                              title={
                                syncStatusLabels[job.syncStatus] ||
                                job.syncStatus
                              }
                              aria-label={`${strings.nav.sync}: ${
                                syncStatusLabels[job.syncStatus] ||
                                job.syncStatus
                              }`}
                              role="img"
                            >
                              {job.syncStatus === 'synced' && (
                                <CheckCircle size={16} />
                              )}
                              {job.syncStatus === 'pending' && (
                                <Clock size={16} />
                              )}
                              {job.syncStatus === 'syncing' && (
                                <ArrowsClockwise size={16} />
                              )}
                              {job.syncStatus === 'error' && (
                                <Warning size={16} />
                              )}
                              {job.syncStatus === 'conflict' && (
                                <Lightning size={16} />
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  )
}
