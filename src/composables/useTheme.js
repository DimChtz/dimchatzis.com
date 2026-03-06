import { ref } from 'vue'

export const THEME_KEY = 'dimchatzis-theme'

export function useTheme() {
  const theme = ref('dark')

  function applyTheme(value) {
    document.documentElement.setAttribute('data-theme', value)
    theme.value = value
    try {
      localStorage.setItem(THEME_KEY, value)
    } catch (_) {}
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, applyTheme, toggleTheme }
}
