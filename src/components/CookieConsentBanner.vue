<script setup>
import { computed } from 'vue'
import { useCookieConsent } from '../composables/useCookieConsent'
import { hasAnalyticsId } from '../utils/analytics'
import WindowDots from './WindowDots.vue'

const { consent, bannerOpen, acceptAnalytics, declineAnalytics, closePreferences } = useCookieConsent()

const statusLine = computed(() => {
  if (consent.value === 'granted') return '# current status: analytics allowed'
  if (consent.value === 'denied') return '# current status: analytics blocked'
  return null
})

const showBanner = computed(() => bannerOpen.value && hasAnalyticsId())
</script>

<template>
  <Teleport to="body">
    <Transition name="cookie-banner">
      <div v-if="showBanner" class="cookie-banner no-print" role="dialog" aria-label="Cookie preferences">
        <div class="cookie-box">
          <div class="cookie-bar">
            <WindowDots />
            <span class="cookie-bar-title">~/cookies</span>
            <button type="button" class="cookie-close" aria-label="Close" @click="closePreferences">×</button>
          </div>
          <div class="cookie-body">
            <p class="cookie-text">
              <span class="cookie-prompt">$</span> this site uses Google Analytics to count visits. anonymous, no data sold. allow it?
            </p>
            <p v-if="statusLine" class="cookie-status">{{ statusLine }}</p>
            <div class="cookie-actions">
              <button type="button" class="cookie-btn primary" @click="acceptAnalytics">Accept</button>
              <button type="button" class="cookie-btn secondary" @click="declineAnalytics">Decline</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: 998;
  max-width: 380px;
}

.cookie-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.cookie-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #21262d;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cookie-bar-title {
  margin-left: 0.5rem;
  flex: 1;
}

.cookie-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}
.cookie-close:hover {
  color: var(--text);
  background: var(--bg-card-hover);
}

.cookie-body {
  padding: 1.25rem;
}

.cookie-text {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text);
  line-height: 1.6;
}

.cookie-prompt {
  color: var(--accent);
  margin-right: 0.35rem;
}

.cookie-status {
  margin-top: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
}

.cookie-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.1rem;
}

.cookie-btn {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s, border-color 0.2s;
}

.cookie-btn.primary {
  background: rgba(0, 255, 136, 0.2);
  color: var(--accent);
  border-color: var(--accent-dim);
}
.cookie-btn.primary:hover {
  background: rgba(0, 255, 136, 0.3);
  border-color: var(--accent);
}

.cookie-btn.secondary {
  background: transparent;
  color: var(--text-muted);
  border-color: var(--border);
}
.cookie-btn.secondary:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.cookie-banner-enter-from,
.cookie-banner-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
