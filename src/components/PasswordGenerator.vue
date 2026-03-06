<script setup>
import { ref, computed, watch } from 'vue'

const show = defineModel('show', { type: Boolean })
const length = ref(16)
const useUpper = ref(true)
const useLower = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(true)
const password = ref('')
const copied = ref(false)

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function generate() {
  let charset = ''
  if (useUpper.value) charset += UPPER
  if (useLower.value) charset += LOWER
  if (useNumbers.value) charset += NUMBERS
  if (useSymbols.value) charset += SYMBOLS
  if (!charset) {
    password.value = ''
    return
  }
  const len = Math.max(4, Math.min(64, length.value))
  let result = ''
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  for (let i = 0; i < len; i++) {
    result += charset[arr[i] % charset.length]
  }
  password.value = result
}

watch([show, length, useUpper, useLower, useNumbers, useSymbols], () => {
  if (show.value) generate()
}, { immediate: false })

watch(show, (v) => {
  if (v) {
    generate()
    copied.value = false
  }
})

async function copyPass() {
  if (!password.value) return
  try {
    await navigator.clipboard.writeText(password.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (_) {}
}

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-password">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">password.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <div class="pass-display-wrap">
              <output class="pass-display" :value="password" aria-live="polite">{{ password || 'Generate a password' }}</output>
              <button type="button" class="pass-copy" @click="copyPass" :disabled="!password">
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <button type="button" class="pass-generate" @click="generate">Generate</button>

            <div class="pass-option">
              <label class="pass-label">Length</label>
              <div class="pass-length-row">
                <input v-model.number="length" type="range" min="8" max="48" class="pass-slider" />
                <span class="pass-length-value">{{ length }}</span>
              </div>
            </div>

            <div class="pass-checkboxes">
              <label class="pass-check"><input v-model="useUpper" type="checkbox" /> Uppercase</label>
              <label class="pass-check"><input v-model="useLower" type="checkbox" /> Lowercase</label>
              <label class="pass-check"><input v-model="useNumbers" type="checkbox" /> Numbers</label>
              <label class="pass-check"><input v-model="useSymbols" type="checkbox" /> Symbols</label>
            </div>
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

.app-modal-password {
  width: 100%;
  max-width: 360px;
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

.app-body { padding: 1.25rem 1.5rem 1.5rem; }

.pass-display-wrap {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pass-display {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--accent);
  word-break: break-all;
  min-height: 2.5rem;
}

.pass-copy {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  background: var(--accent);
  color: var(--skip-link-text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.pass-copy:hover:not(:disabled) { filter: brightness(1.1); }
.pass-copy:disabled { opacity: 0.6; cursor: not-allowed; }

.pass-generate {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 0.6rem;
  background: var(--bg-card-hover);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1.25rem;
}
.pass-generate:hover { background: var(--border); border-color: var(--accent); }

.pass-option { margin-bottom: 1rem; }
.pass-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.35rem;
}

.pass-length-row { display: flex; align-items: center; gap: 0.75rem; }
.pass-slider { flex: 1; accent-color: var(--accent); }
.pass-length-value { font-family: var(--font-mono); font-size: 0.9rem; min-width: 2ch; }

.pass-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
}

.pass-check {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.pass-check input { accent-color: var(--accent); }

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>
