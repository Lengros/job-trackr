import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import { Wrench, User } from '@phosphor-icons/react'
import styles from '../styles/BottomTabBar.module.css'

export default function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const strings = useStrings()
  const { state } = useApp()

  // Worker's "work" tab lands on the single-job home; foreman's on the list.
  const master = state.masters.find((m) => m.id === state.selectedMasterId)
  const jobsPath = master?.role === 'foreman' ? '/jobs' : '/home'

  const TABS = [
    { key: 'jobs', path: jobsPath, label: strings.bottomTabs.jobs, Icon: Wrench },
    { key: 'profile', path: '/profile', label: strings.bottomTabs.profile, Icon: User },
  ]

  // Determine which tab is active based on current path
  const activeTab = location.pathname.startsWith('/profile') ? 'profile' : 'jobs'

  return (
    <nav className={styles.tabBar} role="tablist" aria-label={strings.nav.mainNav}>
      {TABS.map(({ key, path, label, Icon }) => {
        const isActive = activeTab === key
        return (
          <button
            key={key}
            className={`${styles.tab} ${isActive ? styles.tabActive : styles.tabInactive} interactive`}
            onClick={() => navigate(path)}
            role="tab"
            aria-selected={isActive}
            aria-label={label}
          >
            <Icon size={24} weight={isActive ? 'bold' : 'regular'} className={styles.tabIcon} />
            <span className={styles.tabLabel}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
