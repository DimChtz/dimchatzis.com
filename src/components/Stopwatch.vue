<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const show = defineModel('show', { type: Boolean })
const running = ref(false)
const startTime = ref(0)
const elapsedMs = ref(0)
const laps = ref([])
let rafId = null

const display = computed(() => {
  const ms = elapsedMs.value
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const tenths = Math.floor((ms % 1000) / 100)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`
})

function tick() {
  if (!running.value) return
  elapsedMs.value = Date.now() - startTime.value
  rafId = requestAnimationFrame(tick)
}

function start() {
  if (running.value) return
  running.value = true
  startTime.value = Date.now() - elapsedMs.value
  rafId = requestAnimationFrame(tick)
}

function pause() {
  running.value = false
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function lap() {
  if (elapsedMs.value <= 0) return
  const ms = elapsedMs.value
  const m = Math.floor(ms / 60000)
  const s = ((ms % 60000) / 1000).toFixed(1)
  laps.value = [{ label: `Lap ${laps.value.length + 1}`, time: `${m}:${s.padStart(4, '0')}` }, ...laps.value]
}

function reset() {
  pause()
  elapsedMs.value = 0
  laps.value = []
}

watch(show, (v) => { if (!v) pause() })

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
})

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-stopwatch">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">stopwatch.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <p class="stopwatch-time" aria-live="polite">{{ display }}</p>
            <div class="stopwatch-actions">
              <template v-if="!running">
                <button type="button" class="stop-btn stop-start" @click="start">Start</button>
                <button type="button" class="stop-btn stop-reset" @click="reset" :disabled="elapsedMs === 0">Reset</button>
              </template>
              <template v-else>
                <button type="button" class="stop-btn stop-lap" @click="lap">Lap</button>
                <button type="button" class="stop-btn stop-pause" @click="pause">Pause</button>
              </template>
            </div>
            <ul v-if="laps.length" class="stopwatch-laps">
              <li v-for="(lapItem, i) in laps" :key="i" class="lap-item">
                <span class="lap-label">{{ lapItem.label }}</span>
                <span class="lap-time">{{ lapItem.time }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.app-modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.app-modal-stopwatch {
  width: 100%;
  max-width: 320px;
}

.app-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card-hover);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.app-dot { width: 12px; height: 12px; border-radius: 50%; }
.app-dot.red { background: #ff5f56; }
.app-dot.yellow { background: #ffbd2e; }
.app-dot.green { background: var(--accent); }
.app-title { margin-left: 0.5rem; }
.app-close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
  border-radius: 4px;
}
.app-close:hover { color: var(--text); background: var(--border); }

.app-body { padding: 1.5rem 1.5rem 2rem; text-align: center; }

.stopwatch-time {
  font-family: var(--font-mono);
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.05em;
  margin-bottom: 1.25rem;
}

.stopwatch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.stop-btn {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.stop-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.stop-start {
  background: rgba(0, 255, 136, 0.2);
  color: var(--accent);
  border-color: var(--accent-dim);
}
.stop-start:hover { background: rgba(0, 255, 136, 0.3); }
.stop-pause {
  background: rgba(255, 159, 67, 0.2);
  color: var(--orange);
  border-color: var(--orange);
}
.stop-pause:hover { background: rgba(255, 159, 67, 0.3); }
.stop-lap {
  background: rgba(100, 149, 237, 0.2);
  color: var(--cyan);
  border-color: var(--cyan);
}
.stop-lap:hover { background: rgba(100, 149, 237, 0.3); }
.stop-reset {
  background: var(--bg-card-hover);
  color: var(--text-muted);
  border-color: var(--border);
}
.stop-reset:hover:not(:disabled) { color: var(--text); background: var(--border); }

.stopwatch-laps {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;
  max-height: 160px;
  overflow-y: auto;
}

.lap-item {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
}
.lap-item:last-child { border-bottom: none; }
.lap-time { color: var(--accent); }

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>
