<script setup>
import { ref, computed } from 'vue'

const show = defineModel('show', { type: Boolean })

const activeTab = ref('base64') // 'base64' | 'url'
const base64Input = ref('')
const base64Output = ref('')
const base64Error = ref('')
const urlInput = ref('')
const urlOutput = ref('')

function base64Encode() {
  base64Error.value = ''
  try {
    base64Output.value = btoa(unescape(encodeURIComponent(base64Input.value)))
  } catch (e) {
    base64Output.value = ''
    base64Error.value = 'Invalid character in input'
  }
}

function base64Decode() {
  base64Error.value = ''
  try {
    base64Output.value = decodeURIComponent(escape(atob(base64Input.value)))
  } catch (e) {
    base64Output.value = ''
    base64Error.value = 'Invalid Base64 string'
  }
}

function urlEncode() {
  try {
    urlOutput.value = encodeURIComponent(urlInput.value)
  } catch (_) {
    urlOutput.value = ''
  }
}

function urlDecode() {
  try {
    urlOutput.value = decodeURIComponent(urlInput.value)
  } catch (_) {
    urlOutput.value = ''
  }
}

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-encoder">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">encoder.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-tabs-wrap">
            <div class="app-tabs">
              <button
                type="button"
                class="app-tab"
                :class="{ active: activeTab === 'base64' }"
                @click="activeTab = 'base64'"
              >Base64</button>
              <button
                type="button"
                class="app-tab"
                :class="{ active: activeTab === 'url' }"
                @click="activeTab = 'url'"
              >URL</button>
            </div>
          </div>
          <div class="app-body">
            <!-- Base64 -->
            <div v-show="activeTab === 'base64'" class="encoder-panel">
              <label class="encoder-label">Input</label>
              <textarea
                v-model="base64Input"
                class="encoder-textarea"
                placeholder="Paste text or Base64 here..."
                rows="4"
              />
              <p v-if="base64Error" class="encoder-error">{{ base64Error }}</p>
              <div class="encoder-actions">
                <button type="button" class="encoder-btn" @click="base64Encode">Encode →</button>
                <button type="button" class="encoder-btn" @click="base64Decode">Decode →</button>
              </div>
              <label class="encoder-label">Output</label>
              <textarea
                :value="base64Output"
                class="encoder-textarea encoder-output"
                placeholder="Result..."
                rows="4"
                readonly
              />
            </div>
            <!-- URL -->
            <div v-show="activeTab === 'url'" class="encoder-panel">
              <label class="encoder-label">Input</label>
              <textarea
                v-model="urlInput"
                class="encoder-textarea"
                placeholder="Paste text or URL-encoded string..."
                rows="4"
              />
              <div class="encoder-actions">
                <button type="button" class="encoder-btn" @click="urlEncode">Encode →</button>
                <button type="button" class="encoder-btn" @click="urlDecode">Decode →</button>
              </div>
              <label class="encoder-label">Output</label>
              <textarea
                :value="urlOutput"
                class="encoder-textarea encoder-output"
                placeholder="Result..."
                rows="4"
                readonly
              />
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

.app-modal-encoder {
  width: 100%;
  max-width: 520px;
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

.app-tabs-wrap { border-bottom: 1px solid var(--border); background: var(--bg); }
.app-tabs { display: flex; gap: 0; padding: 0 0.5rem; }
.app-tab {
  padding: 0.5rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
}
.app-tab:hover { color: var(--text); }
.app-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

.app-body { padding: 1rem 1.5rem 1.5rem; }

.encoder-panel { display: flex; flex-direction: column; gap: 0.5rem; }
.encoder-label {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}
.encoder-label:first-child { margin-top: 0; }
.encoder-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  resize: vertical;
  outline: none;
}
.encoder-textarea:focus { border-color: var(--accent); }
.encoder-output { opacity: 0.95; }
.encoder-error { font-size: 0.85rem; color: var(--pink); margin: 0; }
.encoder-actions { display: flex; gap: 0.5rem; margin: 0.25rem 0; }
.encoder-btn {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  border-radius: 6px;
  cursor: pointer;
}
.encoder-btn:hover { background: rgba(0, 255, 136, 0.25); }

.game-modal-enter-active, .game-modal-leave-active { transition: opacity 0.2s ease; }
.game-modal-enter-from, .game-modal-leave-to { opacity: 0; }
.game-modal-enter-active .app-modal, .game-modal-leave-active .app-modal { transition: transform 0.2s ease; }
.game-modal-enter-from .app-modal, .game-modal-leave-to .app-modal { transform: scale(0.95); }
</style>
