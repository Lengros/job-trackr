import { useApp } from '../context/AppContext'
import styles from '../styles/Header.module.css'

export default function Header() {
  const { state, dispatch } = useApp()
  const master = state.masters.find((m) => m.id === state.selectedMasterId)

  return (
    <header className={styles.header}>
      <div className={styles.masterName}>
        {master ? master.name : 'JobTrackr'}
      </div>
      <button
        className={`${styles.networkToggle} ${state.isOnline ? styles.online : styles.offline}`}
        onClick={() => dispatch({ type: 'TOGGLE_NETWORK' })}
        aria-label={`Network status: ${state.isOnline ? 'Online' : 'Offline'}. Click to toggle.`}
      >
        <span className={styles.indicator} />
        {state.isOnline ? 'Online' : 'Offline'}
      </button>
    </header>
  )
}
