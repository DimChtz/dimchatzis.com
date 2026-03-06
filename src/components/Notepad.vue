<script setup>
import { ref, computed, watch } from 'vue'

const NOTEPAD_STORAGE_KEY = 'dimchatzis-notepad-tabs'

const show = defineModel('show', { type: Boolean })
const tabs = ref([])
const activeId = ref(null)

let nextId = 1
function newTabId() {
  return `tab-${Date.now()}-${nextId++}`
}

function createTab(content = '') {
  const id = newTabId()
  const tab = { id, content }
  tabs.value.push(tab)
  activeId.value = id
  return id
}

const activeTab = computed(() => tabs.value.find(t => t.id === activeId.value) ?? null)

function tabTitle(tab) {
  const firstLine = (tab.content || '').trim().split(/\r?\n/)[0] || ''
  const trimmed = firstLine.slice(0, 28)
  return trimmed ? (trimmed.length < firstLine.length ? `${trimmed}…` : trimmed) : 'Untitled'
}

function setActiveContent(value) {
  const t = activeTab.value
  if (t) t.content = value
}

const activeContent = computed({
  get: () => activeTab.value?.content ?? '',
  set: (value) => setActiveContent(value),
})

function addTab() {
  createTab('')
}

function closeTab(id, e) {
  e?.stopPropagation()
  const index = tabs.value.findIndex(t => t.id === id)
  if (index === -1) return
  const wasActive = activeId.value === id
  tabs.value.splice(index, 1)
  if (tabs.value.length === 0) {
    createTab('')
    return
  }
  if (wasActive) {
    const next = tabs.value[Math.min(index, tabs.value.length - 1)]
    activeId.value = next.id
  }
}

function selectTab(id) {
  activeId.value = id
}

const NOTEPAD_LEGACY_KEY = 'dimchatzis-notepad'

function load() {
  try {
    const raw = localStorage.getItem(NOTEPAD_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        tabs.value = parsed.map(t => ({
          id: t.id ?? newTabId(),
          content: typeof t.content === 'string' ? t.content : '',
        }))
        activeId.value = tabs.value[0].id
        return
      }
    }
    // Migrate old single-note content to one tab
    const legacy = localStorage.getItem(NOTEPAD_LEGACY_KEY)
    if (legacy != null && legacy !== '') {
      createTab(legacy)
      try { localStorage.removeItem(NOTEPAD_LEGACY_KEY) } catch (_) {}
      return
    }
  } catch (_) {}
  tabs.value = []
  createTab('')
}

function save() {
  try {
    localStorage.setItem(NOTEPAD_STORAGE_KEY, JSON.stringify(tabs.value))
  } catch (_) {}
}

watch(tabs, () => save(), { deep: true })

watch(show, (visible) => {
  if (visible) load()
})

function downloadFile() {
  const t = activeTab.value
  if (!t) return
  const title = tabTitle(t).replace(/[^\w\s-]/g, '').trim() || 'note'
  const filename = `${title.slice(0, 60)}.txt`
  const blob = new Blob([t.content || ''], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function close() {
  show.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="game-modal">
      <div v-if="show" class="app-overlay" @click.self="close">
        <div class="app-modal app-modal-notepad">
          <div class="app-bar">
            <span class="app-dot red"></span>
            <span class="app-dot yellow"></span>
            <span class="app-dot green"></span>
            <span class="app-title">notepad.exe</span>
            <button type="button" class="app-close" aria-label="Close" @click="close">×</button>
          </div>
          <div class="app-tabs-wrap">
            <div class="app-tabs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="app-tab"
                :class="{ active: tab.id === activeId }"
                :title="tabTitle(tab)"
                @click="selectTab(tab.id)"
              >
                <span class="app-tab-label">{{ tabTitle(tab) }}</span>
                <button
                  type="button"
                  class="app-tab-close"
                  aria-label="Close tab"
                  @click="closeTab(tab.id, $event)"
                >×</button>
              </button>
              <button type="button" class="app-tab-add" aria-label="New tab" @click="addTab">+</button>
            </div>
          </div>
          <div class="app-body">
            <div class="notepad-toolbar">
              <span class="notepad-hint">Auto-saved in this browser.</span>
              <button type="button" class="notepad-download" @click="downloadFile">
                Save to file
              </button>
            </div>
            <textarea
              v-model="activeContent"
              class="notepad-textarea"
              placeholder="Start typing..."
              spellcheck="true"
              rows="14"
            />
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

.app-modal-notepad {
  width: 100%;
  max-width: 600px;
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

.app-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.app-dot.red { background: #ff5f56; }
.app-dot.yellow { background: #ffbd2e; }
.app-dot.green { background: var(--accent); }

.app-title {
  margin-left: 0.5rem;
}

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
.app-close:hover {
  color: var(--text);
  background: var(--border);
}

.app-tabs-wrap {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.app-tabs {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 0 0.5rem 0 0;
  min-height: 36px;
  overflow-x: auto;
}

.app-tab {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem 0.35rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  max-width: 160px;
  min-width: 0;
  border-radius: 6px 6px 0 0;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.app-tab:hover {
  color: var(--text);
  background: var(--bg-card-hover);
}
.app-tab.active {
  color: var(--accent);
  background: var(--bg-card);
  border-bottom-color: var(--accent);
}

.app-tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.app-tab-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0.7;
}
.app-tab:hover .app-tab-close {
  opacity: 1;
}
.app-tab-close:hover {
  color: var(--text);
  background: var(--border);
}

.app-tab-add {
  flex-shrink: 0;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  margin-left: 0.25rem;
}
.app-tab-add:hover {
  color: var(--accent);
  background: var(--bg-card-hover);
}

.app-body {
  padding: 1rem 1.5rem 1.5rem;
}

.notepad-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.notepad-hint {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.notepad-download {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  background: rgba(0, 255, 136, 0.15);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.notepad-download:hover {
  background: rgba(0, 255, 136, 0.25);
  border-color: var(--accent);
}

.notepad-textarea {
  width: 100%;
  min-height: 280px;
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}
.notepad-textarea::placeholder {
  color: var(--text-muted);
}
.notepad-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.15);
}

.game-modal-enter-active,
.game-modal-leave-active {
  transition: opacity 0.2s ease;
}
.game-modal-enter-from,
.game-modal-leave-to {
  opacity: 0;
}
.game-modal-enter-active .app-modal,
.game-modal-leave-active .app-modal {
  transition: transform 0.2s ease;
}
.game-modal-enter-from .app-modal,
.game-modal-leave-to .app-modal {
  transform: scale(0.95);
}
</style>
