import strings from './pl.json'

/**
 * Hook to access centralized string table.
 * Returns the full string object for the current locale.
 */
export function useStrings() {
  return strings
}

/**
 * Format a number as Polish currency (zł).
 * Uses pl-PL locale: 1 234,56 zł format.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number with Polish locale (e.g., 1 234,56).
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export default strings
