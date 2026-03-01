import { useLanguage } from '../context/LanguageContext'

/**
 * Hook to access centralized string table.
 * Returns the full string object for the current locale.
 * Now backed by LanguageContext for dynamic language switching.
 */
export function useStrings() {
  const { strings } = useLanguage()
  return strings
}

/**
 * Format a number as currency based on current language.
 * English uses $ (USD), Polish uses zl (PLN).
 */
export function useCurrencyFormatter() {
  const { language } = useLanguage()
  return (amount) => {
    if (language === 'pl') {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
}

/**
 * Format a number as Polish currency (zl).
 * Uses pl-PL locale: 1 234,56 zl format.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number with locale (e.g., 1,234.56 or 1 234,56).
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Hook that returns a locale-aware date formatter.
 * Uses the current language to format dates.
 */
export function useDateFormatter() {
  const { language } = useLanguage()
  const locale = language === 'pl' ? 'pl-PL' : 'en-US'
  return (date) => {
    return new Date(date).toLocaleDateString(locale)
  }
}

/**
 * Hook that returns a locale-aware time formatter.
 */
export function useTimeFormatter() {
  const { language } = useLanguage()
  const locale = language === 'pl' ? 'pl-PL' : 'en-US'
  return (date) => {
    return new Date(date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  }
}

export default null
