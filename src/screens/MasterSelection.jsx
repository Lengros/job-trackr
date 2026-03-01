import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import PageTransition from '../components/PageTransition'
import styles from '../styles/MasterSelection.module.css'

export default function MasterSelection() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const handleSelect = (masterId) => {
    dispatch({ type: 'SELECT_MASTER', payload: masterId })
    navigate('/jobs')
  }

  return (
    <PageTransition>
    <div className={styles.container}>
      <h1 className={styles.title}>JobTrackr</h1>
      <p className={styles.subtitle}>Select your profile to get started</p>
      <div className={styles.grid} role="list" aria-label="Available workers">
        {state.masters.map((master) => (
          <button
            key={master.id}
            className={styles.card}
            onClick={() => handleSelect(master.id)}
            role="listitem"
            aria-label={`Select ${master.name}, ${master.specialization}`}
          >
            <div
              className={styles.avatar}
              style={{ backgroundColor: master.avatarColor }}
              aria-hidden="true"
            >
              {master.name.charAt(0)}
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{master.name}</span>
              <span className={styles.specialization}>
                {master.specialization}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
    </PageTransition>
  )
}
