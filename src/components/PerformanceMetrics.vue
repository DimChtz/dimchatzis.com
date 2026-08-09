<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const fps = ref(0)
const lcp = ref(null)
const cls = ref(null)
const expanded = ref(false)

let frameCount = 0
let lastTime = performance.now()
let fpsInterval = null

function measureFps() {
  frameCount++
  const now = performance.now()
  const elapsed = now - lastTime
  if (elapsed >= 1000) {
    fps.value = Math.round((frameCount * 1000) / elapsed)
    frameCount = 0
    lastTime = now
  }
  fpsInterval = requestAnimationFrame(measureFps)
}

onMounted(() => {
  fpsInterval = requestAnimationFrame(measureFps)

  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1]
        if (last) lcp.value = Math.round(last.startTime)
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) clsValue += entry.value
        }
        cls.value = clsValue.toFixed(2)
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch (_) {}
  }
})

onUnmounted(() => {
  cancelAnimationFrame(fpsInterval)
})
</script>

<template>
  <div class="perf-widget no-print" :class="{ expanded }">
    <button
      type="button"
      class="perf-toggle"
      :aria-label="expanded ? 'Collapse metrics' : 'Expand metrics'"
      :title="expanded ? 'Collapse' : 'Performance metrics (FPS, LCP, CLS)'"
      @click="expanded = !expanded"
    >
      <span class="perf-icon" aria-hidden="true">⚡</span>
      <span class="perf-fps">{{ fps }}</span>
      <span class="perf-fps-label">fps</span>
    </button>
    <div v-show="expanded" class="perf-details">
      <div class="perf-row">
        <span class="perf-label">FPS</span>
        <span class="perf-value" :class="{ good: fps >= 55, warn: fps >= 30 && fps < 55, bad: fps < 30 }">{{ fps }}</span>
      </div>
      <div v-if="lcp != null" class="perf-row">
        <span class="perf-label">LCP</span>
        <span class="perf-value" :class="{ good: lcp < 2500, warn: lcp >= 2500 && lcp < 4000, bad: lcp >= 4000 }">{{ lcp }}ms</span>
      </div>
      <div v-if="cls != null" class="perf-row">
        <span class="perf-label">CLS</span>
        <span class="perf-value" :class="{ good: parseFloat(cls) < 0.1, warn: parseFloat(cls) >= 0.1 && parseFloat(cls) < 0.25, bad: parseFloat(cls) >= 0.25 }">{{ cls }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perf-widget {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 999;
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.perf-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.perf-toggle:hover {
  border-color: var(--accent-dim);
  color: var(--text);
}

.perf-icon {
  font-size: 0.9em;
}

.perf-fps {
  font-weight: 600;
  color: var(--accent);
}

.perf-fps-label {
  font-size: 0.65rem;
  opacity: 0.8;
}

.perf-details {
  margin-top: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.perf-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.perf-row:last-child {
  margin-bottom: 0;
}

.perf-label {
  color: var(--text-muted);
}

.perf-value {
  font-weight: 600;
}

.perf-value.good { color: var(--accent); }
.perf-value.warn { color: var(--orange); }
.perf-value.bad { color: var(--pink); }
</style>
