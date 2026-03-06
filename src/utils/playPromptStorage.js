const STORAGE_KEY = 'dimchatzis_play_prompt'
const COOLDOWN_DAYS = 7

export function shouldShowPlayPrompt() {
  if (typeof localStorage === 'undefined') return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true
    const { dismissedAt } = JSON.parse(raw)
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
    return daysSince >= COOLDOWN_DAYS
  } catch {
    return true
  }
}

export function dismissPlayPrompt(played = false) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      dismissedAt: Date.now(),
      played,
    }))
  } catch {}
}
