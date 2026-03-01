import { useLanguage } from '../context/LanguageContext'
import styles from '../styles/LanguageSwitcher.module.css'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={styles.switcher} role="radiogroup" aria-label="Language selection">
      <button
        className={`${styles.option} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
        role="radio"
        aria-checked={language === 'en'}
        aria-label="English"
      >
        EN
      </button>
      <button
        className={`${styles.option} ${language === 'pl' ? styles.active : ''}`}
        onClick={() => setLanguage('pl')}
        role="radio"
        aria-checked={language === 'pl'}
        aria-label="Polish"
      >
        PL
      </button>
    </div>
  )
}
