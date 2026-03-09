<script setup>
import WindowDots from './WindowDots.vue'

defineProps({
  terminal: { type: Object, required: true },
  theme: { type: String, required: true },
})
defineEmits(['toggleTheme'])
</script>

<template>
  <div
    class="terminal-window no-print"
    :ref="el => { if (el) terminal.terminalContainerRef.value = el }"
  >
    <div class="terminal-bar">
      <WindowDots />
      <div class="terminal-tabs">
        <button
          v-for="tab in terminal.tabs.value"
          :key="tab.id"
          type="button"
          class="terminal-tab"
          :class="{ active: tab.id === terminal.activeTabId.value }"
          @click="terminal.switchTab(tab.id)"
        >
          <span class="terminal-tab-name">{{ tab.name }}</span>
          <span
            v-if="terminal.tabs.value.length > 1"
            class="terminal-tab-close"
            aria-label="Close tab"
            @click.stop="terminal.closeTab(tab.id, $event)"
          >×</span>
        </button>
        <button
          type="button"
          class="terminal-tab-add"
          aria-label="New tab"
          title="New tab"
          @click="terminal.addTab()"
        >+</button>
      </div>
      <button
        type="button"
        class="fullscreen-toggle no-print"
        :aria-label="terminal.isFullscreen.value ? 'Exit fullscreen' : 'Fullscreen'"
        :title="terminal.isFullscreen.value ? 'Exit fullscreen (Esc)' : 'Fullscreen'"
        @click="terminal.toggleFullscreen()"
      >
        <span class="fullscreen-icon" aria-hidden="true">{{ terminal.isFullscreen.value ? '⤢' : '⛶' }}</span>
      </button>
      <button
        type="button"
        class="theme-toggle no-print"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
        @click="$emit('toggleTheme')"
      >
        <span v-if="theme === 'dark'" class="theme-icon" aria-hidden="true">☀️</span>
        <span v-else class="theme-icon" aria-hidden="true">🌙</span>
      </button>
      <a
        class="print-cv no-print"
        href="/cv/Dimitris-Chatzis-CV.pdf"
        download
        aria-label="Download CV as PDF"
        title="Download CV (PDF)"
      >
        <span class="print-icon" aria-hidden="true">🖨️</span>
      </a>
    </div>
    <div class="terminal-body">
      <div :ref="el => { if (el) terminal.terminalScrollRef.value = el }" class="terminal-scroll">
        <div v-for="(line, i) in terminal.terminalLines.value" :key="'intro-' + i" class="terminal-block">
          <p v-if="line.type === 'prompt'" class="line-prompt">{{ line.text.slice(0, line.visible) }}</p>
          <p v-else-if="line.type === 'code'" class="line-code"><code>{{ line.text.slice(0, line.visible) }}</code><span v-if="!terminal.inputReady.value && i === terminal.terminalLines.value.length - 1" class="cursor" :class="{ done: line.visible >= line.text.length }">|</span></p>
          <p v-else-if="line.type === 'output' || line.type === 'hint'" class="line-output" :class="{ 'line-hint': line.type === 'hint' }">{{ line.text.slice(0, line.visible) }}<span v-if="!terminal.inputReady.value && i === terminal.terminalLines.value.length - 1" class="cursor" :class="{ done: line.visible >= line.text.length }">|</span></p>
        </div>
        <template v-for="(entry, i) in terminal.commandHistory.value" :key="'cmd-' + i">
          <p class="line-prompt">{{ terminal.promptPrefix(entry.cwd) }}{{ entry.prompt }}</p>
          <p v-for="(out, j) in entry.output" :key="'out-' + i + '-' + j" class="line-output" :class="{ 'line-error': out.type === 'error' }">{{ out.text }}</p>
        </template>
        <p v-if="terminal.inputReady.value" class="line-input">
          <span class="prompt-prefix">{{ terminal.promptPrefix() }}</span>
          <span class="input-area">
            <span class="input-display" aria-hidden="true">{{ terminal.terminalInput.value.slice(0, terminal.cursorPos.value) }}<span class="cursor done">|</span>{{ terminal.terminalInput.value.slice(terminal.cursorPos.value) }}<span v-if="terminal.suggestionSuffix" class="input-suggestion">{{ terminal.suggestionSuffix.value }}</span></span>
            <input
              :ref="el => { if (el) terminal.inputRef.value = el }"
              :value="terminal.terminalInput.value"
              type="text"
              class="terminal-input"
              autocomplete="off"
              spellcheck="false"
              @input="(e) => { terminal.terminalInput.value = e.target.value; terminal.syncCursorPos() }"
              @click="terminal.syncCursorPos"
              @keyup="terminal.syncCursorPos"
              @keydown="terminal.onTerminalKeydown"
              @keydown.enter="!terminal.isModalOpen.value && terminal.runCommand(terminal.terminalInput.value)"
            />
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-window {
  display: flex;
  flex-direction: column;
}

.terminal-window:fullscreen {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-card);
  border-radius: 0;
}
.terminal-window:fullscreen .terminal-bar {
  border-radius: 0;
}
.terminal-window:fullscreen .terminal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 0;
}
.terminal-window:fullscreen .terminal-scroll {
  flex: 1;
  min-height: 0;
  height: auto;
}

.terminal-window:fullscreen .terminal-bar {
  border-radius: 0;
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.terminal-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.75rem;
  flex: 1;
  min-width: 0;
}

.terminal-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  max-width: 120px;
  min-width: 0;
}

.terminal-tab:hover {
  background: var(--bg-card-hover);
  color: var(--text);
}

.terminal-tab.active {
  background: var(--bg);
  color: var(--text);
  border-color: var(--border);
}

.terminal-tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-tab-close {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.7;
}

.terminal-tab-close:hover {
  background: var(--border);
  opacity: 1;
}

.terminal-tab-add {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 1.1rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.terminal-tab-add:hover {
  background: var(--bg-card-hover);
  color: var(--text);
}

.fullscreen-toggle,
.theme-toggle {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1;
  color: var(--text-muted);
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.theme-toggle {
  margin-left: auto;
}
.fullscreen-toggle:hover,
.theme-toggle:hover {
  border-color: var(--text-muted);
  background: var(--bg-card-hover);
  color: var(--text);
}
.fullscreen-toggle:focus-visible,
.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.print-cv {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.print-cv:hover {
  border-color: var(--text-muted);
  background: var(--bg-card-hover);
  color: var(--text);
}
.print-cv:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.fullscreen-icon,
.theme-icon,
.print-icon {
  display: inline-block;
  font-style: normal;
  font-size: 0.95rem;
}

.terminal-body {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0 0 10px 10px;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  overflow: hidden;
}

.terminal-scroll {
  height: 320px;
  flex: 0 0 auto;
  overflow-y: auto;
  padding: 1.5rem 1.5rem 1rem;
  scroll-behavior: smooth;
}

.terminal-scroll::-webkit-scrollbar { width: 8px; }
.terminal-scroll::-webkit-scrollbar-track { background: var(--bg); border-radius: 4px; }
.terminal-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
.terminal-scroll::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
@supports (scrollbar-width: thin) {
  .terminal-scroll { scrollbar-width: thin; scrollbar-color: var(--border) var(--bg); }
}

.terminal-block { margin-bottom: 0.25rem; }

.line-prompt { color: var(--cyan); margin-bottom: 0.35rem; }
.line-code { margin-bottom: 0.5rem; }
.line-code code { white-space: pre; color: var(--text); }
.line-output { color: var(--accent-dim); margin-bottom: 0.35rem; }
.line-output.line-error { color: var(--text-muted); }
.line-output.line-hint { color: var(--purple); margin-top: 0.25rem; }

.line-input {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  margin-bottom: 0.35rem;
  gap: 0;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  color: var(--cyan);
}

.prompt-prefix { color: var(--cyan); flex-shrink: 0; }

.input-area {
  flex: 1;
  min-width: 0;
  position: relative;
  margin-left: 0.45em;
}

.input-display {
  display: block;
  white-space: pre;
  font: inherit;
  font-family: var(--font-mono);
  font-size: inherit;
  color: var(--cyan);
  min-height: 1.2em;
}

.input-suggestion { color: var(--text-muted); opacity: 0.7; }

.terminal-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  outline: none;
  font: inherit;
  font-family: var(--font-mono);
  font-size: inherit;
  color: transparent;
  caret-color: transparent;
  padding: 0;
}
.terminal-input::placeholder { color: transparent; }

.cursor { color: var(--accent); font-weight: bold; margin-left: 0.05rem; }
.line-input .cursor { color: var(--accent); animation: cursor-blink 0.8s step-end infinite; }
.cursor.done { animation: blink 0.6s step-end infinite; }
@keyframes blink { 50% { opacity: 0.3; } }
@keyframes cursor-blink { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0.25; } }
</style>
