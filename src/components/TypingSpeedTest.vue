<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

const QUOTES = [
  'There are only 10 types of people: those who get binary and those who don\'t.',
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'First solve the problem. Then write the code. — John Johnson',
  'Any sufficiently advanced bug is indistinguishable from a feature.',
  'Real programmers count from 0.',
  'The best error message is the one that never shows up.',
  'Code is like humor. When you have to explain it, it\'s bad. — Cory House',
  'It works on my machine.',
  'Delete the code. Delete the code. Delete the code.',
  'A bug in the code is worth two in the spec.',
]

const show = defineModel('show', { type: Boolean })
const quote = ref('')
const input = ref('')
const startTime = ref(null)
const finished = ref(false)
const timerInterval = ref(null)
const elapsedSeconds = ref(0)
const inputRef = ref(null)

const targetWords = computed(() => (quote.value || '').trim().split(/\s+/).filter(Boolean).length)

const displayQuote = computed(() => {
  const q = quote.value
  const i = input.value
  if (!q) return ''
  let html = ''
  for (let idx = 0; idx < q.length; idx++) {
    const c = q[idx]
    const typed = i[idx]
    if (typed === undefined) {
      html += `<span class="char">${escapeHtml(c)}</span>`
    } else if (typed === c) {
      html += `<span class="char correct">${escapeHtml(c)}</span>`
    } else {
      html += `<span class="char wrong">${escapeHtml(c)}</span>`
    }
  }
  return html
})

function escapeHtml(s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

const wpm = computed(() => {
  if (!startTime.value || !finished.value) return 0
  const minutes = elapsedSeconds.value / 60
  if (minutes <= 0) return 0
  const words = input.value.trim().split(/\s+/).filter(Boolean).length
  return Math.round(words / minutes)
})

const accuracy = computed(() => {
  if (!quote.value || !input.value) return 100
  let correct = 0
  const len = Math.min(quote.value.length, input.value.length)
  for (let i = 0; i < len; i++) {
    if (quote.value[i] === input.value[i]) correct++
  }
  const total = Math.max(quote.value.length, input.value.length)
  return total === 0 ? 100 : Math.round((correct / total) * 100)
})

function pickQuote() {
  quote.value = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  input.value = ''
  startTime.value = null
  finished.value = false
  elapsedSeconds.value = 0
  if (timerInterval.value) clearInterval(timerInterval.value)
  timerInterval.value = null
  nextTick(() => inputRef.value?.focus())
}

function onInput() {
  if (!startTime.value && input.value.length > 0) {
    startTime.value = Date.now()
    elapsedSeconds.value = 0
    timerInterval.value = setInterval(() => {
      elapsedSeconds.value = Math.floor((Date.now() - startTime.value) / 1000)
    }, 100)
  }
  if (quote.value && input.value.length >= quote.value.length) {
    finished.value = true
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }
}

watch(show, (visible) => {
  if (visible) pickQuote()
})

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-typing">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">typing-test.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <p class="typing-hint">Type the quote below. Timer starts on first key.</p>
            <div class="typing-quote" v-html="displayQuote"></div>
            <input
              ref="inputRef"
              v-model="input"
              type="text"
              class="typing-input"
              placeholder="Start typing..."
              :disabled="finished"
              autocomplete="off"
              spellcheck="false"
              @input="onInput"
            />
            <div class="typing-stats">
              <span v-if="startTime && !finished">⏱ {{ elapsedSeconds }}s</span>
              <template v-if="finished">
                <span class="typing-wpm">{{ wpm }} WPM</span>
                <span class="typing-acc">{{ accuracy }}% accuracy</span>
              </template>
            </div>
            <button type="button" class="typing-again" @click="pickQuote">New quote</button>
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

.app-modal-typing {
  width: 100%;
  max-width: 560px;
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

.app-body { padding: 1rem 1.5rem 1.5rem; }

.typing-hint {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.typing-quote {
  font-family: var(--font-mono);
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-muted);
  padding: 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 1rem;
  min-height: 4.5em;
}

.typing-quote :deep(.char) { color: var(--text-muted); }
.typing-quote :deep(.correct) { color: var(--accent); }
.typing-quote :deep(.wrong) { color: var(--pink); background: rgba(207, 34, 46, 0.15); }

.typing-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  outline: none;
}
.typing-input:focus { border-color: var(--accent); }
.typing-input:disabled { opacity: 0.8; cursor: not-allowed; }

.typing-stats {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.typing-wpm { color: var(--accent); font-weight: 600; margin-right: 1rem; }
.typing-acc { color: var(--cyan); }

.typing-again {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  border-radius: 6px;
  cursor: pointer;
}
.typing-again:hover { background: rgba(0, 255, 136, 0.25); }

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>
