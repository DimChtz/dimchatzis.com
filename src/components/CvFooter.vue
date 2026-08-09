<script setup>
import UseThisTheme from './UseThisTheme.vue'
import { useCookieConsent } from '../composables/useCookieConsent'
import { hasAnalyticsId } from '../utils/analytics'

defineProps({
  version: { type: String, default: 'dev' },
})

const { openPreferences } = useCookieConsent()
</script>

<template>
  <footer class="footer">
    <UseThisTheme variant="box" />
    <p><code>echo "Thanks for reading! Let's build something."</code></p>
    <p class="footer__muted">Dimitris Chatzis · {{ new Date().getFullYear() }} · v{{ version }}</p>
    <button v-if="hasAnalyticsId()" type="button" class="footer__link no-print" @click="openPreferences">
      Cookie preferences
    </button>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
}

.footer code {
  color: var(--cyan);
}

.footer__muted {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.footer__link {
  display: inline-block;
  margin-top: 0.75rem;
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}
.footer__link:hover {
  color: var(--accent);
}
</style>
