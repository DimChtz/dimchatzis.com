<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

const show = defineModel('show', { type: Boolean })
const input = ref('')
const dataUrl = ref('')
const error = ref('')

async function generate() {
  error.value = ''
  const text = (input.value || '').trim()
  if (!text) {
    dataUrl.value = ''
    return
  }
  try {
    dataUrl.value = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: { dark: '#0d1117', light: '#ffffff' },
    })
  } catch (e) {
    dataUrl.value = ''
    error.value = 'Could not generate QR code'
  }
}

watch([show, input], () => {
  if (show.value) generate()
})

function download() {
  if (!dataUrl.value) return
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = 'qrcode.png'
  a.click()
}

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-qr">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">qrcode.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-body">
            <label class="qr-label">URL or text</label>
            <input
              v-model="input"
              type="text"
              class="qr-input"
              placeholder="https://..."
              @input="generate"
            />
            <p v-if="error" class="qr-error">{{ error }}</p>
            <div v-if="dataUrl" class="qr-preview-wrap">
              <img :src="dataUrl" alt="QR code" class="qr-preview" />
            </div>
            <button v-if="dataUrl" type="button" class="qr-download" @click="download">Download PNG</button>
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

.app-modal-qr {
  width: 100%;
  max-width: 340px;
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

.qr-label {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.35rem;
}

.qr-input {
  width: 100%;
  padding: 0.6rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 1rem;
  outline: none;
}
.qr-input:focus { border-color: var(--accent); }

.qr-error { font-size: 0.85rem; color: var(--pink); margin: -0.5rem 0 0.75rem; }
.qr-preview-wrap {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.qr-preview { display: block; max-width: 256px; height: auto; }

.qr-download {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
}
.qr-download:hover { background: rgba(0, 255, 136, 0.25); }

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>
