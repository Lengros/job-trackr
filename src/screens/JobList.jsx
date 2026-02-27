import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
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

export default function JobList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

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

  return (
    <div className={styles.container}>
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
  )
}
