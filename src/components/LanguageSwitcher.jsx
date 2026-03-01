import { useLanguage } from '../context/LanguageContext'
import { useStrings } from '../i18n/useStrings'
import styles from '../styles/LanguageSwitcher.module.css'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const strings = useStrings()

  return (
    <div className={styles.switcher} role="radiogroup" aria-label={strings.language.selection}>
      <button
        className={`${styles.option} ${language === 'en' ? styles.active : ''} interactive`}
        onClick={() => setLanguage('en')}
        role="radio"
        aria-checked={language === 'en'}
        aria-label={strings.language.en}
      >
        EN
      </button>
      <button
        className={`${styles.option} ${language === 'pl' ? styles.active : ''} interactive`}
        onClick={() => setLanguage('pl')}
        role="radio"
        aria-checked={language === 'pl'}
        aria-label={strings.language.pl}
      >
        PL
      </button>
    </div>
  )
}
