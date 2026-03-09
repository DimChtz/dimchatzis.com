const STORAGE_KEY = 'bootSkippedAt'
/** TTL in ms – skip remembered for 1 hour */
const TTL_MS = 60 * 60 * 1000

export function shouldSkipBootSequence() {
  if (typeof localStorage === 'undefined') return false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (Number.isNaN(ts)) return false
    return Date.now() - ts < TTL_MS
  } catch {
    return false
  }
}

export function recordBootSkipped() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch { /* ignore */ }
}
