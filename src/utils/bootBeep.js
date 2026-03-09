const BOOT_BEEP_MUTED_KEY = 'bootBeepMuted'

export function isBootBeepMuted() {
  try {
    return localStorage.getItem(BOOT_BEEP_MUTED_KEY) !== '0'
  } catch {
    return true
  }
}

export function setBootBeepMuted(muted) {
  try {
    localStorage.setItem(BOOT_BEEP_MUTED_KEY, muted ? '1' : '0')
  } catch (_) { /* ignore */ }
}

export function playBootBeep() {
  if (isBootBeepMuted()) return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'square'
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
  } catch (_) {}
}
