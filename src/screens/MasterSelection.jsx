import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from '../styles/MasterSelection.module.css'

export default function MasterSelection() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const handleSelect = (masterId) => {
    dispatch({ type: 'SELECT_MASTER', payload: masterId })
    navigate('/jobs')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>JobTrackr</h1>
      <p className={styles.subtitle}>Select your profile to get started</p>
      <div className={styles.grid}>
        {state.masters.map((master) => (
          <button
            key={master.id}
            className={styles.card}
            onClick={() => handleSelect(master.id)}
          >
            <div
              className={styles.avatar}
              style={{ backgroundColor: master.avatarColor }}
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
  )
}
