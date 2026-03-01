import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import enStrings from '../i18n/en.json'
import plStrings from '../i18n/pl.json'

const STORAGE_KEY = 'jobtrackr_language'
const SUPPORTED_LANGUAGES = ['en', 'pl']
const DEFAULT_LANGUAGE = 'en'

const translations = {
  en: enStrings,
  pl: plStrings,
}

const LanguageContext = createContext(null)

function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage)

  const setLanguage = useCallback((lang) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang)
      try {
        localStorage.setItem(STORAGE_KEY, lang)
      } catch {
        // localStorage unavailable
      }
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'pl' : 'en')
  }, [language, setLanguage])

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    strings: translations[language],
  }), [language, setLanguage, toggleLanguage])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * Hook to access the language context.
 * Returns { language, setLanguage, toggleLanguage, strings }
 */
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

/**
 * Hook that returns a t() function for looking up translated strings by dot-notation key.
 * Example: t('tabs.all') returns "All" or "Wszystkie" depending on current language.
 */
export function useTranslation() {
  const { strings, language } = useLanguage()

  const t = useCallback((key, params) => {
    const keys = key.split('.')
    let value = strings
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Key not found - return the key itself as fallback
        return key
      }
    }
    // Handle parameter interpolation: {count} -> params.count
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return paramKey in params ? params[paramKey] : match
      })
    }
    return value
  }, [strings])

  return { t, language }
}
