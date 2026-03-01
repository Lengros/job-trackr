import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings, useTimeFormatter } from '../i18n/useStrings'
import { SignOut, Phone, ArrowsClockwise, Info } from '@phosphor-icons/react'
import PageTransition from '../components/PageTransition'
import styles from '../styles/Profile.module.css'

export default function Profile() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const strings = useStrings()
  const formatTime = useTimeFormatter()
  const master = state.masters.find((m) => m.id === state.selectedMasterId)

  // Count pending sync items
  const masterJobs = state.jobs.filter((j) => j.assignedMasterId === state.selectedMasterId)
  const pendingCount = masterJobs.filter((j) => j.syncStatus === 'pending' || j.syncStatus === 'syncing').length

  // Last synced time (simulated)
  const lastSyncTime = formatTime(new Date())

  const handleLogout = () => {
    dispatch({ type: 'SELECT_MASTER', payload: null })
    navigate('/')
  }

  if (!master) {
    return (
      <PageTransition>
        <div className={styles.container}>
          <p>{strings.profile.noProfile}</p>
        </div>
      </PageTransition>
    )
  }

  const syncStatusText = pendingCount > 0
    ? strings.profile.pendingCount.replace('{count}', pendingCount)
    : strings.profile.allSynced

  const lastSyncedText = strings.profile.lastSyncedAt.replace('{time}', lastSyncTime)

  return (
    <PageTransition>
      <div className={styles.container}>
        {/* Avatar & Name */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar} style={{ backgroundColor: master.avatarColor }}>
            {master.name.charAt(0).toUpperCase()}
          </div>
          <h2 className={styles.name}>{master.name}</h2>
          <p className={styles.role}>{master.specialization}</p>
        </div>

        {/* Info Cards */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <Phone size={20} weight="regular" className={styles.infoIcon} />
              <div>
                <span className={styles.infoLabel}>{strings.profile.phone}</span>
                <span className={styles.infoValue}>+1 (555) 000-0000</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <ArrowsClockwise size={20} weight="regular" className={styles.infoIcon} />
              <div>
                <span className={styles.infoLabel}>{strings.profile.syncStatus}</span>
                <span className={styles.infoValue}>
                  {syncStatusText} · {lastSyncedText}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <Info size={20} weight="regular" className={styles.infoIcon} />
              <div>
                <span className={styles.infoLabel}>{strings.profile.appVersion}</span>
                <span className={styles.infoValue}>v0.0.1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button className={styles.logoutButton} onClick={handleLogout}>
          <SignOut size={20} weight="bold" />
          <span>{strings.profile.logOut}</span>
        </button>
      </div>
    </PageTransition>
  )
}
