<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  /** Site name shown in boot (e.g. "dimchatzis.com") */
  siteName: { type: String, default: 'dimchatzis.com' },
})

const emit = defineEmits(['done'])

const lines = [
  { text: '[    0.000000] Booting CV subsystem...', delay: 0 },
  { text: '[    0.082000] Loading kernel modules...', delay: 400 },
  { text: '[    0.164000] Mounting filesystem...', delay: 800 },
  { text: `[    0.246000] Starting ${props.siteName}...`, delay: 1200 },
  { text: '[    0.328000] Ready.', delay: 1600 },
]

const visibleLines = ref([])
const showCursor = ref(false)
const cursorVisible = ref(true)

let cursorInterval
let doneTimeout

function addNextLine(index) {
  if (index >= lines.length) {
    showCursor.value = true
    // Brief cursor blink then emit done
    cursorInterval = setInterval(() => {
      cursorVisible.value = !cursorVisible.value
    }, 530)
    doneTimeout = setTimeout(() => {
      clearInterval(cursorInterval)
      emit('done')
    }, 1200)
    return
  }
  const { text, delay } = lines[index]
  setTimeout(() => {
    visibleLines.value.push(text)
    addNextLine(index + 1)
  }, delay)
}

onMounted(() => {
  addNextLine(0)
})

defineExpose({
  cancel: () => {
    if (cursorInterval) clearInterval(cursorInterval)
    if (doneTimeout) clearTimeout(doneTimeout)
  },
})
</script>

<template>
  <div class="boot-sequence no-print" aria-live="polite" aria-label="System boot sequence">
    <div class="boot-sequence__inner">
      <p v-for="(line, i) in visibleLines" :key="i" class="boot-line">{{ line }}</p>
      <p v-if="showCursor" class="boot-line boot-cursor">
        <span class="boot-cursor-block" :class="{ 'boot-cursor-block--hidden': !cursorVisible }">_</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.boot-sequence {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.boot-sequence__inner {
  padding: 2rem;
  max-width: 480px;
  width: 100%;
}

.boot-line {
  margin: 0 0 0.25rem 0;
  line-height: 1.6;
}

.boot-line:last-child {
  margin-bottom: 0;
}

.boot-cursor {
  margin-top: 0.5rem;
}

.boot-cursor-block {
  color: var(--accent);
  opacity: 1;
  transition: opacity 0.15s ease;
}

.boot-cursor-block--hidden {
  opacity: 0.25;
}
</style>