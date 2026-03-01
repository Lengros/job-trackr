import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings } from '../i18n/useStrings'
import PageTransition from '../components/PageTransition'
import styles from '../styles/MasterSelection.module.css'

export default function MasterSelection() {
  const { state, dispatch } = useApp()
  const strings = useStrings()
  const navigate = useNavigate()

  const handleSelect = (masterId) => {
    dispatch({ type: 'SELECT_MASTER', payload: masterId })
    navigate('/jobs')
  }

  return (
    <PageTransition>
    <div className={styles.container}>
      <h1 className={styles.title}>{strings.app.name}</h1>
      <p className={styles.subtitle}>{strings.app.selectProfile}</p>
      <div className={styles.grid} role="list" aria-label={strings.aria.availableWorkers}>
        {state.masters.map((master) => (
          <button
            key={master.id}
            className={styles.card}
            onClick={() => handleSelect(master.id)}
            role="listitem"
            aria-label={strings.aria.selectWorker.replace('{name}', master.name).replace('{specialization}', master.specialization)}
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
