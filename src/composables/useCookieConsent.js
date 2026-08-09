import { ref } from 'vue'
import { loadGoogleAnalytics, disableGoogleAnalytics } from '../utils/analytics'

const STORAGE_KEY = 'dimchatzis_cookie_consent'

function readConsent() {
  if (typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function persistConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {}
}

const consent = ref(readConsent())
const bannerOpen = ref(false)

if (consent.value === 'granted') {
  loadGoogleAnalytics()
}

export function useCookieConsent() {
  function acceptAnalytics() {
    consent.value = 'granted'
    persistConsent('granted')
    bannerOpen.value = false
    loadGoogleAnalytics()
  }

  function declineAnalytics() {
    consent.value = 'denied'
    persistConsent('denied')
    bannerOpen.value = false
    disableGoogleAnalytics()
  }

  function openPreferences() {
    bannerOpen.value = true
  }

  function closePreferences() {
    bannerOpen.value = false
  }

  /** Reveal the banner if the visitor hasn't made a choice yet. Call once it's safe to show (e.g. after boot). */
  function maybeOpenBanner() {
    if (consent.value !== 'granted' && consent.value !== 'denied') {
      bannerOpen.value = true
    }
  }

  return { consent, bannerOpen, acceptAnalytics, declineAnalytics, openPreferences, closePreferences, maybeOpenBanner }
}
