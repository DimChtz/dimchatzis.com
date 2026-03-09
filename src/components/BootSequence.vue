<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { getFancyVersion } from '../utils/version'
import { isBootBeepMuted, setBootBeepMuted, playBootBeep } from '../utils/bootBeep'
import { recordBootSkipped } from '../utils/bootSkipStorage'
import { buildBootLines } from '../data/bootLines'

const props = defineProps({
  /** Site name shown in boot (e.g. "dimchatzis.com") */
  siteName: { type: String, default: 'dimchatzis.com' },
})

const emit = defineEmits(['done'])

const base = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
const version = getFancyVersion(base)

const poweredOn = ref(false)
const showPost = ref(false)
const postMemory = ref(0)
const showBios = ref(false)
const biosVisible = ref(false)
const showKernel = ref(false)
const lines = ref([])
const progress = ref(0)
const showCursor = ref(false)
const cursorVisible = ref(true)
const logScrollRef = ref(null)
const canSkip = ref(false)
const bootBeepMuted = ref(true)

const bootLines = ref([])
const postMemoryLines = computed(() =>
  Array.from({ length: postMemory.value }, (_, i) => (i + 1) * 512)
)

let cursorInterval
let doneTimeout
let typingTimeouts = []
let intervals = []

function clearAllTimeouts() {
  typingTimeouts.forEach((t) => clearTimeout(t))
  typingTimeouts = []
  intervals.forEach((i) => clearInterval(i))
  intervals = []
  if (cursorInterval) clearInterval(cursorInterval)
  if (doneTimeout) clearTimeout(doneTimeout)
}

function typeLine(lineIndex, charIndex = 0) {
  const BL = bootLines.value
  if (!BL.length || lineIndex >= BL.length) {
    showCursor.value = true
    progress.value = 100
    cursorInterval = setInterval(() => {
      cursorVisible.value = !cursorVisible.value
    }, 530)
    doneTimeout = setTimeout(() => {
      finishBoot()
    }, 900)
    return
  }

  const line = BL[lineIndex]
  const fullText = line.text

  if (charIndex === 0 && line.instant) {
    // Batch consecutive instant lines for performance
    const batch = []
    let nextIdx = lineIndex
    while (nextIdx < BL.length && BL[nextIdx].instant) {
      batch.push({ text: BL[nextIdx].text, type: BL[nextIdx].type })
      nextIdx++
    }
    lines.value.push(...batch)
    progress.value = Math.round((nextIdx / BL.length) * 100)
    const t = setTimeout(() => typeLine(nextIdx, 0), 18 + Math.random() * 10)
    typingTimeouts.push(t)
    return
  }

  if (charIndex === 0) {
    lines.value.push({ text: '', type: line.type })
  }

  const lineRef = lines.value[lineIndex]
  if (charIndex < fullText.length) {
    lineRef.text = fullText.slice(0, charIndex + 1)
    const delay = line.type === 'highlight' ? 14 + Math.random() * 8 : 10 + Math.random() * 5
    const t = setTimeout(() => typeLine(lineIndex, charIndex + 1), delay)
    typingTimeouts.push(t)
  } else {
    progress.value = Math.round(((lineIndex + 1) / BL.length) * 100)
    const t = setTimeout(() => typeLine(lineIndex + 1, 0), 25 + Math.random() * 15)
    typingTimeouts.push(t)
  }
}

let scrollDebounceTimer
function scrollLogToBottom() {
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
  scrollDebounceTimer = setTimeout(() => {
    scrollDebounceTimer = null
    nextTick(() => {
      const el = logScrollRef.value
      if (el) el.scrollTop = el.scrollHeight
    })
  }, 16)
}

watch(lines, scrollLogToBottom, { deep: true })
watch(showCursor, (v) => { if (v) scrollLogToBottom() })

function finishBoot() {
  clearAllTimeouts()
  if (!bootBeepMuted.value) playBootBeep()
  document.removeEventListener('keydown', handleKeydown)
  emit('done')
}

function skipBoot() {
  if (!canSkip.value) return
  recordBootSkipped()
  finishBoot()
}

function toggleBootBeep() {
  bootBeepMuted.value = !bootBeepMuted.value
  setBootBeepMuted(bootBeepMuted.value)
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    skipBoot()
  }
}

onMounted(() => {
  bootLines.value = buildBootLines(props.siteName)
  bootBeepMuted.value = isBootBeepMuted()

  document.addEventListener('keydown', handleKeydown)

  // Skip enabled after 1.5s
  const tSkip = setTimeout(() => {
    canSkip.value = true
  }, 1500)
  typingTimeouts.push(tSkip)

  // Phase 1: Power on (black → visible)
  poweredOn.value = true

  // Phase 2: POST (memory count) – slow enough to read
  const tPost = setTimeout(() => {
    showPost.value = true
    let mem = 0
    const memInterval = setInterval(() => {
      mem++
      postMemory.value = mem
      if (mem >= 8) clearInterval(memInterval)
    }, 100)
    intervals.push(memInterval)
  }, 400)

  // Phase 3: BIOS splash (after POST + brief hold)
  const postDuration = 400 + 8 * 100 + 400  // delay + count + hold
  const t1 = setTimeout(() => {
    showPost.value = false
    showBios.value = true
    setTimeout(() => { biosVisible.value = true }, 50)
  }, postDuration)

  // Phase 4: Kernel boot (BIOS visible ~1.8s)
  const biosDuration = 1800
  const t2 = setTimeout(() => {
    showBios.value = false
    setTimeout(() => {
      showKernel.value = true
      typeLine(0, 0)
    }, 150)
  }, postDuration + biosDuration)

  typingTimeouts.push(tPost, t1, t2)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearAllTimeouts()
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
})

defineExpose({
  cancel: clearAllTimeouts,
})
</script>

<template>
  <div class="boot-sequence no-print" aria-live="polite" aria-label="System boot sequence">
    <div class="boot-sequence__scanlines" aria-hidden="true"></div>
    <button
      v-if="canSkip"
      type="button"
      class="boot-skip"
      @click="skipBoot"
      aria-label="Skip boot (Esc)"
    >
      Press Esc to skip
    </button>
    <button
      type="button"
      class="boot-beep-toggle"
      :aria-label="bootBeepMuted ? 'Enable boot sound' : 'Mute boot sound'"
      :title="bootBeepMuted ? 'Enable boot beep' : 'Mute boot beep'"
      @click="toggleBootBeep"
    >
      {{ bootBeepMuted ? '🔇' : '🔊' }}
    </button>
    <div class="boot-sequence__inner" :class="{ 'boot-sequence__inner--powered': poweredOn, 'boot-sequence__inner--centered': showPost || showBios }">
      <!-- POST + BIOS (shared centered overlay to avoid layout jump) -->
      <div v-if="showPost || showBios" class="boot-phase-wrap">
        <Transition name="post-fade">
          <div v-if="showPost" class="boot-post">
            <div class="boot-post__title">Phoenix BIOS 4.0 Release 6.0</div>
            <div class="boot-post__line">CV Engine v2.0 (cv) 2400 MHz</div>
            <div class="boot-post__memory">
              <span v-for="k in postMemoryLines" :key="k" class="boot-post__mem-line">{{ k }}K OK</span>
            </div>
          </div>
        </Transition>
        <Transition name="bios-fade">
          <div v-if="showBios" class="boot-bios" :class="{ 'boot-bios--visible': biosVisible }">
          <div class="boot-bios__logo">CV BIOS</div>
          <div class="boot-bios__info">
            <div class="boot-bios__row">CPU : CV Engine v2.0 (cv) 2400 MHz</div>
            <div class="boot-bios__row">Memory : 4096K</div>
          </div>
          <div class="boot-bios__copyright">(C) {{ new Date().getFullYear() }} Dimitris Chatzis. All rights reserved. v{{ version }}</div>
          </div>
        </Transition>
      </div>

      <!-- Kernel boot log (scrollable) -->
      <Transition name="kernel-fade">
        <div v-if="showKernel" class="boot-kernel-wrap">
          <div
            ref="logScrollRef"
            class="boot-log"
            role="log"
            aria-live="polite"
          >
            <div class="boot-log__content">
              <p
                v-for="(line, i) in lines"
                :key="i"
                class="boot-line"
                :class="[
                  'boot-line--' + line.type,
                  { 'boot-line--typing': i === lines.length - 1 && !showCursor }
                ]"
              >
                {{ line.text }}<span v-if="i === lines.length - 1 && !showCursor" class="boot-caret">▌</span>
              </p>
              <p v-if="showCursor" class="boot-line boot-cursor">
                <span class="boot-cursor-block" :class="{ 'boot-cursor-block--hidden': !cursorVisible }">▌</span>
              </p>
            </div>
          </div>

          <!-- Progress bar (fixed at bottom) -->
          <div class="boot-progress-wrap">
            <div class="boot-progress">
              <div class="boot-progress__bar" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="boot-progress__label">[{{ String(progress).padStart(3) }}%] Booting...</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.boot-sequence {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  overflow: hidden;
}

.boot-skip {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  padding: 0.4rem 0.8rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}
.boot-skip:hover {
  color: var(--accent);
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent);
}

.boot-beep-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s, background 0.2s;
}
.boot-beep-toggle:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.12);
}

.boot-sequence__scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  pointer-events: none;
  opacity: 0.4;
}

.boot-sequence__inner {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 640px;
  padding: 1rem 1.5rem;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.boot-sequence__inner--powered {
  opacity: 1;
}

.boot-sequence__inner--centered {
  justify-content: center;
}

/* Shared overlay for POST + BIOS (avoids layout jump) */
.boot-phase-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.boot-post,
.boot-bios {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* POST screen */
.boot-post {
  text-align: center;
  color: #00ff88;
  font-size: 0.9rem;
}

.boot-post__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
}

.boot-post__line {
  margin-bottom: 1rem;
  color: #9ca3af;
}

.boot-post__memory {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.85rem;
  color: #00ff88;
}

.boot-post__mem-line {
  font-family: var(--font-mono);
}

/* BIOS splash */
.boot-bios {
  text-align: center;
  opacity: 0;
  transform: scale(0.98);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.boot-bios--visible {
  opacity: 1;
  transform: scale(1);
}

.boot-bios__logo {
  font-size: 2rem;
  font-weight: 700;
  color: #00ff88;
  letter-spacing: 0.2em;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  margin-bottom: 1rem;
  animation: bios-glow 2s ease-in-out infinite;
}

@keyframes bios-glow {
  0%, 100% { text-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
  50% { text-shadow: 0 0 30px rgba(0, 255, 136, 0.8); }
}

.boot-bios__info {
  margin: 1rem 0;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  text-align: left;
  font-size: 0.8rem;
  color: #9ca3af;
}

.boot-bios__row {
  margin-bottom: 0.25rem;
}

.boot-bios__row:last-child {
  margin-bottom: 0;
}

.boot-bios__copyright {
  font-size: 0.7rem;
  color: var(--text-muted);
  opacity: 0.8;
  margin-top: 1.5rem;
}

/* Kernel log - scrollable */
.boot-kernel-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.boot-log {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 1.25rem;
  scroll-behavior: auto;
}

.boot-log::-webkit-scrollbar {
  width: 8px;
}
.boot-log::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}
.boot-log::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
.boot-log::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
@supports (scrollbar-width: thin) {
  .boot-log { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }
}

.boot-log__content {
  color: var(--text-muted);
}

.boot-line {
  margin: 0 0 0.12rem 0;
  line-height: 1.45;
  min-height: 1.35em;
  word-break: break-all;
}

.boot-line--info {
  color: #9ca3af;
}

.boot-line--success {
  color: #22c55e;
}

.boot-line--highlight {
  color: #38bdf8;
  font-weight: 500;
}

.boot-line--warning {
  color: #eab308;
}

.boot-caret {
  color: var(--accent);
  animation: caret-blink 0.8s step-end infinite;
}

@keyframes caret-blink {
  50% { opacity: 0.3; }
}

.boot-cursor {
  margin-top: 0.25rem;
}

.boot-cursor-block {
  color: var(--accent);
  opacity: 1;
  transition: opacity 0.15s ease;
}

.boot-cursor-block--hidden {
  opacity: 0.2;
}

/* Progress bar - fixed at bottom of log area */
.boot-progress-wrap {
  flex-shrink: 0;
  padding: 0.75rem 1.25rem;
}

.boot-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.boot-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--cyan));
  border-radius: 2px;
  transition: width 0.12s ease-out;
}

.boot-progress__label {
  font-size: 0.65rem;
  color: var(--text-muted);
  opacity: 0.85;
}

/* Transitions */
.post-fade-enter-active,
.post-fade-leave-active {
  transition: opacity 0.25s ease;
}
.post-fade-enter-from,
.post-fade-leave-to {
  opacity: 0;
}

.bios-fade-enter-active,
.bios-fade-leave-active {
  transition: opacity 0.3s ease;
}
.bios-fade-enter-from,
.bios-fade-leave-to {
  opacity: 0;
}

.kernel-fade-enter-active,
.kernel-fade-leave-active {
  transition: opacity 0.25s ease;
}
.kernel-fade-enter-from,
.kernel-fade-leave-to {
  opacity: 0;
}

.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.2s ease;
}
.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}
</style>
