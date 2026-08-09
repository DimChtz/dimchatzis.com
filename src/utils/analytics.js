const GA_ID = import.meta.env.VITE_GA_ID

let loaded = false

export function hasAnalyticsId() {
  return Boolean(GA_ID)
}

export function loadGoogleAnalytics() {
  if (loaded || !GA_ID || typeof document === 'undefined') return
  loaded = true

  window[`ga-disable-${GA_ID}`] = false

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID)
}

export function disableGoogleAnalytics() {
  if (!GA_ID || typeof window === 'undefined') return
  window[`ga-disable-${GA_ID}`] = true
}
