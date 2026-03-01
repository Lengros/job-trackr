/**
 * Haptic feedback utility for meaningful moments only.
 * Uses navigator.vibrate API with fallback for unsupported browsers.
 *
 * Per design guide section 9:
 * - Success: 10ms single vibration (status done, photo captured)
 * - Error: 3x 10ms pattern [10, 50, 10, 50, 10] (sync error, validation error)
 * - No vibration for normal taps, scrolling, or non-critical actions
 */

function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

const haptic = {
  /**
   * Short 10ms vibration for successful meaningful actions:
   * - Job status changed to completed
   * - Photo captured successfully
   */
  success() {
    if (canVibrate()) {
      navigator.vibrate(10)
    }
  },

  /**
   * Triple-pulse error pattern for failed actions:
   * - Sync errors
   * - Validation errors
   * Pattern: 10ms vibrate, 50ms pause, 10ms vibrate, 50ms pause, 10ms vibrate
   */
  error() {
    if (canVibrate()) {
      navigator.vibrate([10, 50, 10, 50, 10])
    }
  },
}

export default haptic
