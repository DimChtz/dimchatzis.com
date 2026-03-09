<script setup>
import { siteConfig } from '../config/site'

defineProps({
  cv: { type: Object, required: true },
  terminal: { type: Object, required: true },
  theme: { type: String, required: true },
})
defineEmits(['toggleTheme'])
</script>

<template>
  <header class="hero">
    <div class="print-header" aria-hidden="true">
      <h1 class="print-name">{{ cv.name }}</h1>
      <p class="print-title">{{ cv.title }}</p>
      <p class="print-tagline">{{ cv.tagline }}</p>
    </div>
    <div
      class="terminal-window no-print"
      :ref="el => { if (el) terminal.terminalContainerRef.value = el }"
    >
      <div class="terminal-bar">
        <span class="terminal-dot red"></span>
        <span class="terminal-dot yellow"></span>
        <span class="terminal-dot green"></span>
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
        <!--<button
          type="button"
          class="duck-toggle no-print"
          aria-label="Rubber duck debugging"
          title="Rubber duck debugging — tell the duck your bug 🦆"
          @click="terminal.openDuck && terminal.openDuck()"
        >
          <span class="duck-icon" aria-hidden="true">🦆</span>
        </button>-->
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
    <div class="hero-info-box">
      <footer v-if="cv.currently" class="hero-info-status">
        <span class="hero-info-status-label">$ currently</span> reading {{ cv.currently.reading }} · building {{ cv.currently.building }} · debugging {{ cv.currently.debugging }}
      </footer>
      <div class="hero-contact">
      <a :href="`mailto:${cv.email}`" class="hero-contact-item" title="Email">
        <span class="hero-contact-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </span>
        <span class="hero-contact-value">{{ cv.email }}</span>
      </a>
      <a :href="`tel:${cv.phone.replace(/\s/g, '')}`" class="hero-contact-item" :title="`Call ${cv.phone}`">
        <span class="hero-contact-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <span class="hero-contact-value">{{ cv.phone }}</span>
      </a>
      <span class="hero-contact-item hero-contact-item--text" title="Location">
        <span class="hero-contact-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
        <span class="hero-contact-value">{{ cv.location }}</span>
      </span>
    </div>
    <div class="hero-links" role="navigation" aria-label="Social and professional links">
      <a
        v-for="link in cv.links"
        :key="link.label"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="hero-link"
        :aria-label="link.label"
        :title="link.label"
      >
        <span class="hero-link-icon" aria-hidden="true">
          <!-- LinkedIn: simple in + rounded square -->
          <svg v-if="link.icon === 'linkedin'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          <!-- GitHub: octocat -->
          <svg v-else-if="link.icon === 'github'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          <!-- Stack Overflow: stack icon -->
          <svg v-else-if="link.icon === 'stackoverflow'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.24 19.399v-4.804h1.6V21H4.381v-6.405h1.598v4.804H17.24zM7.582 17.8h8.055v-1.604H7.582V17.8zm.195-3.64 7.859 1.641.34-1.552-7.861-1.642-.338 1.553zm1.018-3.794 7.281 3.398.678-1.463-7.281-3.399-.678 1.454v.01zm2.037-3.589 6.166 5.142 1.018-1.216-6.162-5.14-1.016 1.213-.006.001zm3.982-3.778-1.311.969 4.803 6.454 1.313-.971-4.807-6.452h.002z"/></svg>
          <!-- ResearchGate: book / academic -->
          <svg v-else-if="link.icon === 'researchgate'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </span>
        <span class="hero-link-label">{{ link.label }}</span>
      </a>
    </div>
    </div>
    <section class="hero-use-this-box no-print" aria-label="Use this theme">
      <a :href="siteConfig.repoUrl" target="_blank" rel="noopener noreferrer" class="hero-use-this-link">
        Want this for your CV? Get the theme on GitHub
        <span class="hero-use-this-arrow" aria-hidden="true">→</span>
      </a>
    </section>
  </header>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 0;
}

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

.terminal-dot { width: 12px; height: 12px; border-radius: 50%; }
.terminal-dot.red { background: #ff5f56; }
.terminal-dot.yellow { background: #ffbd2e; }
.terminal-dot.green { background: #00ff88; }

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
.duck-toggle,
.theme-toggle,
.print-cv {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1;
  color: var(--text-muted);
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.duck-toggle {
  font-size: 1rem;
}
.theme-toggle {
  margin-left: auto;
}
.fullscreen-toggle:hover,
.duck-toggle:hover,
.theme-toggle:hover,
.print-cv:hover {
  border-color: var(--text-muted);
  background: var(--bg-card-hover);
  color: var(--text);
}
.fullscreen-toggle:focus-visible,
.duck-toggle:focus-visible,
.theme-toggle:focus-visible,
.print-cv:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.fullscreen-icon,
.duck-icon,
.theme-icon,
.print-icon {
  display: inline-block;
  font-style: normal;
  font-size: 0.95rem;
}
.duck-icon {
  font-size: 1rem;
}

/* Print-only header: hidden on screen */
.print-header {
  display: none;
}
@media print {
  .print-header {
    display: block !important;
  }
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

/* Info box under terminal: currently + contact + links */
.hero-info-box {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: var(--font-mono);
}

.hero-info-status {
  display: block;
  margin: 0 0 1rem;
  padding: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
}
.hero-info-status-label { color: var(--cyan); }
.hero-info-box .hero-contact {
  margin-top: 0;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
}
.hero-info-box .hero-links { margin-top: 1rem; }

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

/* Contact: email, phone, location */
.hero-contact {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.5rem;
  padding: 0.875rem 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.9rem;
}

.hero-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.hero-contact-item:hover {
  color: var(--cyan);
}

.hero-contact-item--text {
  cursor: default;
}

.hero-contact-item--text:hover {
  color: var(--text-muted);
}

.hero-contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--cyan);
  opacity: 0.9;
}

.hero-contact-value {
  word-break: break-word;
}

.hero-use-this-box {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: var(--font-mono);
  text-align: center;
}

.hero-use-this-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s, opacity 0.2s;
}

.hero-use-this-link:hover {
  color: var(--accent-dim);
  opacity: 0.9;
}

.hero-use-this-arrow {
  transition: transform 0.2s;
}

.hero-use-this-link:hover .hero-use-this-arrow {
  transform: translateX(2px);
}

/* Media / social links with icons */
.hero-links {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.hero-link:hover {
  color: var(--cyan);
  background: var(--bg-card-hover);
  border-color: var(--cyan);
}

.hero-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.hero-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  flex-shrink: 0;
}

.hero-link-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.hero-link-label {
  font-weight: 500;
}
</style>
