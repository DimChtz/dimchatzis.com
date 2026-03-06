<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const WORK_MIN = 25
const BREAK_MIN = 5

const show = defineModel('show', { type: Boolean })
const mode = ref('work') // 'work' | 'break'
const secondsLeft = ref(WORK_MIN * 60)
const running = ref(false)
let timerId = null

const displayTime = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const modeLabel = computed(() => mode.value === 'work' ? 'Focus' : 'Break')

function start() {
  if (running.value) return
  running.value = true
  timerId = setInterval(() => {
    if (secondsLeft.value <= 0) {
      clearInterval(timerId)
      timerId = null
      running.value = false
      mode.value = mode.value === 'work' ? 'break' : 'work'
      secondsLeft.value = (mode.value === 'work' ? WORK_MIN : BREAK_MIN) * 60
      start()
      return
    }
    secondsLeft.value--
  }, 1000)
}

function pause() {
  running.value = false
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

function reset() {
  pause()
  mode.value = 'work'
  secondsLeft.value = WORK_MIN * 60
}

function switchMode() {
  pause()
  mode.value = mode.value === 'work' ? 'break' : 'work'
  secondsLeft.value = (mode.value === 'work' ? WORK_MIN : BREAK_MIN) * 60
}

watch(show, (visible) => {
  if (!visible) pause()
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-pomodoro">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">pomodoro.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <p class="pomo-mode" :class="mode">{{ modeLabel }}</p>
            <p class="pomo-time" aria-live="polite">{{ displayTime }}</p>
            <div class="pomo-actions">
              <button v-if="!running" type="button" class="pomo-btn pomo-start" @click="start">Start</button>
              <button v-else type="button" class="pomo-btn pomo-pause" @click="pause">Pause</button>
              <button type="button" class="pomo-btn pomo-reset" @click="reset">Reset</button>
              <button type="button" class="pomo-btn pomo-switch" @click="switchMode">{{ mode === 'work' ? 'Break' : 'Focus' }}</button>
            </div>
            <p class="pomo-hint">25 min focus · 5 min break</p>
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

.app-modal-pomodoro {
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

.pomo-mode {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.pomo-mode.work { color: var(--accent); }
.pomo-mode.break { color: var(--cyan); }

.pomo-time {
  font-family: var(--font-mono);
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.pomo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.pomo-btn {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}
.pomo-start {
  background: rgba(0, 255, 136, 0.2);
  color: var(--accent);
  border-color: var(--accent-dim);
}
.pomo-start:hover { background: rgba(0, 255, 136, 0.3); }
.pomo-pause {
  background: rgba(255, 159, 67, 0.2);
  color: var(--orange);
  border-color: var(--orange);
}
.pomo-pause:hover { background: rgba(255, 159, 67, 0.3); }
.pomo-reset, .pomo-switch {
  background: var(--bg-card-hover);
  color: var(--text-muted);
  border-color: var(--border);
}
.pomo-reset:hover, .pomo-switch:hover { color: var(--text); background: var(--border); }

.pomo-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>
