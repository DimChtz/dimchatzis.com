<script setup>
import { ref, computed, watch } from 'vue'

const show = defineModel('show', { type: Boolean })
const copied = ref(false)

const VAR_DEFAULTS = {
  dark: {
    '--bg': '#0d1117',
    '--bg-card': '#161b22',
    '--bg-card-hover': '#21262d',
    '--border': '#30363d',
    '--text': '#e6edf3',
    '--text-muted': '#8b949e',
    '--accent': '#00ff88',
    '--accent-dim': '#00cc6a',
    '--cyan': '#58d1e0',
    '--purple': '#c792ea',
  },
  light: {
    '--bg': '#f6f8fa',
    '--bg-card': '#ffffff',
    '--bg-card-hover': '#eaeef2',
    '--border': '#d0d7de',
    '--text': '#1f2328',
    '--text-muted': '#656d76',
    '--accent': '#0969da',
    '--accent-dim': '#0550ae',
    '--cyan': '#0969da',
    '--purple': '#8250df',
  },
}

const theme = computed(() => document.documentElement.getAttribute('data-theme') || 'dark')
const vars = ref({ ...VAR_DEFAULTS.dark })

watch(show, (v) => {
  if (v) {
    const root = getComputedStyle(document.documentElement)
    const keys = Object.keys(VAR_DEFAULTS.dark)
    vars.value = {}
    for (const k of keys) {
      const val = root.getPropertyValue(k).trim()
      vars.value[k] = val || VAR_DEFAULTS[theme.value][k]
    }
  }
})

watch(vars, (v) => {
  const root = document.documentElement
  for (const [key, val] of Object.entries(v)) {
    if (val) root.style.setProperty(key, val)
  }
}, { deep: true })

function reset() {
  const def = VAR_DEFAULTS[theme.value]
  vars.value = { ...def }
}

function copyCss() {
  const lines = Object.entries(vars.value)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  const block = `:root {\n${lines}\n}`
  navigator.clipboard?.writeText(block).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  })
}

function close() {
  document.documentElement.style.cssText = ''
  show.value = false
}

watch(show, (v) => {
  if (!v) document.documentElement.style.cssText = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-css">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">css-vars.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <p class="css-hint">Tweak CSS variables in real time. Changes apply to the whole site.</p>
            <div class="css-vars-list">
              <div v-for="(val, key) in vars" :key="key" class="css-var-row">
                <label class="css-var-label">{{ key }}</label>
                <div class="css-var-input-wrap">
                  <input
                    v-if="val && String(val).startsWith('#')"
                    v-model="vars[key]"
                    type="color"
                    class="css-var-color"
                  />
                  <input
                    v-model="vars[key]"
                    type="text"
                    class="css-var-input"
                    :placeholder="key"
                  />
                </div>
              </div>
            </div>
            <div class="css-actions">
              <button type="button" class="css-btn css-btn-reset" @click="reset">Reset</button>
              <button type="button" class="css-btn css-btn-copy" @click="copyCss">
                {{ copied ? 'Copied!' : 'Copy CSS' }}
              </button>
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

.app-modal-css {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
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

.css-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.css-vars-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.css-var-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.css-var-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--cyan);
}

.css-var-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.css-var-color {
  width: 36px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px;
  background: var(--bg);
  cursor: pointer;
}

.css-var-input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.4rem 0.6rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
}

.css-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.css-btn {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-muted);
  transition: all 0.2s;
}

.css-btn:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.css-btn-copy {
  background: var(--accent);
  color: var(--skip-link-text);
  border-color: var(--accent);
}
.css-btn-copy:hover { filter: brightness(1.1); }

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>
