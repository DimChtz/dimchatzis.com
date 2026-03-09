import { ref, computed, nextTick } from 'vue'
import { FS, HOME, CWD_DEFAULT, pathSegments, resolvePath, getNode, listDir, findInPath } from '../terminal/fs'
import {
  TAB_COMMANDS,
  HELP_TEXT,
  COMMANDS,
  MAN_PAGES,
  FORTUNES,
  findCommand,
  getFilteredHelpLines,
  weatherCodeToDesc,
} from '../data/terminalCommands'
import { getFancyVersion } from '../utils/version'

/**
 * @param {object} cv - CV data
 * @param {object} appRefs - { showPlayPrompt, buildGameOpen, gameOpen, calculatorOpen, notepadOpen, typingTestOpen, encoderOpen, qrcodeOpen, pomodoroOpen, colorPickerOpen, stopwatchOpen, passwordOpen, duckOpen } (all refs)
 * @param {object} themeApi - { theme, applyTheme, toggleTheme }
 */
function createTabSnapshot(withIntro = false) {
  return {
    terminalLines: [],
    commandHistory: [],
    executedCommands: [],
    currentLineIndex: 0,
    inputReady: !withIntro,
    terminalInput: '',
    cwd: CWD_DEFAULT,
    historyIndex: -1,
    savedInputBeforeHistory: '',
    tabCompletionIndex: 0,
  }
}

export function useTerminal(cv, appRefs, themeApi) {
  let nextTabId = 2
  const tabs = ref([
    { id: 1, name: 'bash', ...createTabSnapshot(true) },
  ])
  const activeTabId = ref(1)

  const terminalLines = ref([])
  const currentLineIndex = ref(0)
  const currentCharIndex = ref(0)
  const inputReady = ref(false)
  const terminalInput = ref('')
  const cursorPos = ref(0)
  const inputRef = ref(null)
  const terminalScrollRef = ref(null)
  const mainRef = ref(null)
  const commandHistory = ref([])
  const executedCommands = ref([])
  const historyIndex = ref(-1)
  const savedInputBeforeHistory = ref('')
  const tabCompletionIndex = ref(0)
  const cwd = ref(CWD_DEFAULT)
  const isFullscreen = ref(false)
  const terminalContainerRef = ref(null)

  function saveActiveTab() {
    const tab = tabs.value.find((t) => t.id === activeTabId.value)
    if (!tab) return
    tab.terminalLines = [...terminalLines.value]
    tab.commandHistory = commandHistory.value.map((e) => ({ ...e, output: [...e.output] }))
    tab.executedCommands = [...executedCommands.value]
    tab.currentLineIndex = currentLineIndex.value
    tab.inputReady = inputReady.value
    tab.terminalInput = terminalInput.value
    tab.cwd = cwd.value
    tab.historyIndex = historyIndex.value
    tab.savedInputBeforeHistory = savedInputBeforeHistory.value
    tab.tabCompletionIndex = tabCompletionIndex.value
  }

  function restoreTab(tab) {
    terminalLines.value = [...tab.terminalLines]
    commandHistory.value = tab.commandHistory.map((e) => ({ ...e, output: [...e.output] }))
    executedCommands.value = [...tab.executedCommands]
    currentLineIndex.value = tab.currentLineIndex
    inputReady.value = tab.inputReady
    terminalInput.value = tab.terminalInput
    cursorPos.value = tab.terminalInput.length
    cwd.value = tab.cwd
    historyIndex.value = tab.historyIndex
    savedInputBeforeHistory.value = tab.savedInputBeforeHistory
    tabCompletionIndex.value = tab.tabCompletionIndex
  }

  function switchTab(id) {
    if (id === activeTabId.value) return
    saveActiveTab()
    const tab = tabs.value.find((t) => t.id === id)
    if (!tab) return
    activeTabId.value = id
    restoreTab(tab)
    nextTick(() => {
      scrollTerminalToBottom()
      inputRef.value?.focus()
    })
  }

  function addTab() {
    saveActiveTab()
    const n = tabs.value.length + 1
    const newTab = { id: nextTabId++, name: `bash ${n}`, ...createTabSnapshot(false) }
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    restoreTab(newTab)
    nextTick(() => {
      scrollTerminalToBottom()
      inputRef.value?.focus()
    })
  }

  function closeTab(id, e) {
    e?.stopPropagation()
    const idx = tabs.value.findIndex((t) => t.id === id)
    if (idx === -1 || tabs.value.length <= 1) return
    saveActiveTab()
    tabs.value.splice(idx, 1)
    const newActive = id === activeTabId.value
      ? tabs.value[Math.max(0, idx - 1)]
      : tabs.value.find((t) => t.id === activeTabId.value)
    if (newActive) {
      activeTabId.value = newActive.id
      restoreTab(newActive)
    }
    nextTick(() => {
      scrollTerminalToBottom()
      inputRef.value?.focus()
    })
  }

  const isModalOpen = computed(() =>
    Object.entries(appRefs).some(([key, ref]) => key !== 'projectFilter' && ref?.value)
  )

  function formatPromptPath(path) {
    if (!path || path === '/') return '/'
    if (path === HOME) return '~'
    if (path.startsWith(HOME + '/')) return '~' + path.slice(HOME.length)
    return path
  }

  function promptPrefix(cwdVal) {
    const p = cwdVal !== undefined ? cwdVal : cwd.value
    return 'guest:' + formatPromptPath(p) + ' $ '
  }

  function syncCursorPos() {
    nextTick(() => {
      const el = inputRef.value
      if (el) cursorPos.value = el.selectionStart ?? 0
    })
  }

  function getCommonPrefix(strings) {
    if (strings.length === 0) return ''
    let i = 0
    const first = strings[0]
    while (i < first.length && strings.every(s => s[i] === first[i])) i++
    return first.slice(0, i)
  }

  const commandSuggestion = computed(() => {
    const prefix = terminalInput.value.trim().toLowerCase()
    if (!prefix) return null
    const match = TAB_COMMANDS.find(c => c.startsWith(prefix) && c !== prefix)
    return match || null
  })

  const suggestionSuffix = computed(() => {
    const s = commandSuggestion.value
    const prefix = terminalInput.value.trim()
    if (!s || !prefix) return ''
    return s.slice(prefix.length)
  })

  function onTerminalKeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const prefix = terminalInput.value.trim().toLowerCase()
      const matches = TAB_COMMANDS.filter(c => c.startsWith(prefix) && c !== prefix)
      if (matches.length === 0) return
      if (matches.length === 1) {
        terminalInput.value = matches[0]
        tabCompletionIndex.value = 0
      } else {
        const common = getCommonPrefix(matches)
        if (prefix !== common) {
          terminalInput.value = common
          tabCompletionIndex.value = 0
        } else {
          terminalInput.value = matches[tabCompletionIndex.value % matches.length]
          tabCompletionIndex.value++
        }
      }
      nextTick(() => {
        cursorPos.value = terminalInput.value.length
        syncCursorPos()
      })
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (executedCommands.value.length === 0) return
      if (historyIndex.value === -1) savedInputBeforeHistory.value = terminalInput.value
      if (historyIndex.value < executedCommands.value.length - 1) {
        historyIndex.value++
        const cmd = executedCommands.value[executedCommands.value.length - 1 - historyIndex.value]
        terminalInput.value = cmd
        nextTick(() => {
          cursorPos.value = cmd.length
          syncCursorPos()
        })
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex.value === -1) return
      if (historyIndex.value > 0) {
        historyIndex.value--
        const cmd = executedCommands.value[executedCommands.value.length - 1 - historyIndex.value]
        terminalInput.value = cmd
        nextTick(() => {
          cursorPos.value = cmd.length
          syncCursorPos()
        })
      } else {
        historyIndex.value = -1
        terminalInput.value = savedInputBeforeHistory.value
        nextTick(() => {
          cursorPos.value = terminalInput.value.length
          syncCursorPos()
        })
      }
    } else if (e.key === 'ArrowRight') {
      if (commandSuggestion.value && suggestionSuffix.value) {
        e.preventDefault()
        terminalInput.value = commandSuggestion.value
        nextTick(() => {
          cursorPos.value = terminalInput.value.length
          syncCursorPos()
        })
      }
    }
  }

  function scrollTerminalToBottom() {
    nextTick(() => {
      const el = terminalScrollRef.value
      if (el) el.scrollTop = el.scrollHeight
    })
  }

  function toggleFullscreen() {
    const el = terminalContainerRef.value
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement && document.fullscreenElement === terminalContainerRef.value
  }

  const introLines = computed(() => [
    { type: 'prompt', text: promptPrefix() + 'cat about.txt' },
    { type: 'code', text: `const engineer = {\n  name: "${cv.name}",\n  role: "${cv.roleDisplay ?? cv.title}"\n};` },
    { type: 'output', text: `→ ${cv.tagline}` },
    { type: 'hint', text: '→ Type help for commands' },
  ])

  function typeNextChar() {
    if (currentLineIndex.value >= introLines.value.length) {
      inputReady.value = true
      cursorPos.value = 0
      nextTick(() => {
        scrollTerminalToBottom()
        inputRef.value?.focus()
      })
      return
    }
    const line = introLines.value[currentLineIndex.value]
    if (!terminalLines.value[currentLineIndex.value]) {
      const visible = line.type === 'prompt' ? line.text.length : 0
      terminalLines.value.push({ type: line.type, text: line.text, visible })
    }
    const entry = terminalLines.value[currentLineIndex.value]
    if (entry.visible < line.text.length) {
      entry.visible++
      scrollTerminalToBottom()
      const delay = line.type === 'code' ? 50 + Math.random() * 30 : 40
      setTimeout(typeNextChar, delay)
    } else {
      currentLineIndex.value++
      currentCharIndex.value = 0
      setTimeout(typeNextChar, 200)
    }
  }

  function runCommand(cmd) {
    const raw = (cmd || '').trim()
    const trimmed = raw.toLowerCase()

    if (trimmed === 'clear') {
      terminalLines.value = []
      commandHistory.value = []
      executedCommands.value = []
      historyIndex.value = -1
      terminalInput.value = ''
      cursorPos.value = 0
      nextTick(() => {
        scrollTerminalToBottom()
        inputRef.value?.focus()
      })
      return
    }

    if (trimmed) {
      executedCommands.value = [...executedCommands.value.filter(c => c !== trimmed), trimmed].slice(-50)
    }
    historyIndex.value = -1
    commandHistory.value.push({ prompt: terminalInput.value, output: [], cwd: cwd.value })
    const out = (lines) => {
      commandHistory.value[commandHistory.value.length - 1].output = lines
    }
    const line = (text, type = 'output') => ({ type, text })

    const bangMatch = trimmed.match(/^!(\d+)$/)
    if (bangMatch) {
      const n = parseInt(bangMatch[1], 10)
      const len = executedCommands.value.length
      if (n < 1 || n > len) {
        out([line(`history: !${n}: history position out of range`, 'error')])
      } else {
        const resolved = executedCommands.value[len - n]
        commandHistory.value.pop()
        runCommand(resolved)
      }
      terminalInput.value = ''
      cursorPos.value = 0
      nextTick(() => {
        scrollTerminalToBottom()
        inputRef.value?.focus()
      })
      return
    }

    if (trimmed === 'history' || trimmed === 'history -c') {
      if (trimmed === 'history -c') {
        executedCommands.value = []
        out([line('History cleared.')])
      } else {
        const max = 50
        const list = executedCommands.value.slice(-max)
        const lines = list.length === 0
          ? [line('(no history)')]
          : list.map((c, i) => line(`  ${list.length - i}  ${c}`))
        out(lines)
      }
    } else if (trimmed.startsWith('help ')) {
      const filter = raw.replace(/^help\s+/i, '').trim()
      const filtered = getFilteredHelpLines(filter)
      if (filtered.length === 0) {
        out([line(`No help matching "${filter}". Try help for full list.`, 'error')])
      } else {
        out(filtered.map(t => line(t)))
      }
    } else if (trimmed === '/help' || trimmed === 'help') {
      out(getFilteredHelpLines('').map(t => line(t)))
    } else if (trimmed.startsWith('man ')) {
      const arg = trimmed.replace(/^man\s+/, '').trim()
      const cmd = findCommand(arg)
      if (!cmd) {
        out([line(`No manual entry for ${arg || '(nothing)'}`, 'error')])
      } else {
        const manLines = MAN_PAGES[cmd.name]
        const header = `${cmd.name.toUpperCase().replace(/\s+/g, ' ')}(1)                    dimchatzis.cv                    ${cmd.name.toUpperCase().replace(/\s+/g, ' ')}(1)`
        out([line(header), line(''), ...(manLines || ['(no manual)']).map(t => line(t))])
      }
    } else if (trimmed.startsWith('which ') || trimmed.startsWith('whereis ')) {
      const arg = trimmed.replace(/^(which|whereis)\s+/, '').trim()
      const fsPath = findInPath(arg)
      if (fsPath) {
        out([line(fsPath)])
      } else {
        const cmd = findCommand(arg)
        if (!cmd) {
          out([line(`which: ${arg || '(nothing)'}: not found`, 'error')])
        } else {
          out([line(cmd.path === 'builtin' ? `${cmd.name}: shell built-in command` : cmd.path)])
        }
      }
    } else if (trimmed === 'cd' || trimmed.startsWith('cd ')) {
      const pathArg = trimmed === 'cd' ? HOME : trimmed.replace(/^cd\s+/, '').trim()
      const resolved = resolvePath(cwd.value, pathArg)
      const node = getNode(FS, resolved)
      if (!node) {
        out([line(`cd: ${pathArg}: No such file or directory`, 'error')])
      } else if (node.t !== 'd') {
        out([line(`cd: ${pathArg}: Not a directory`, 'error')])
      } else {
        cwd.value = resolved || '/'
      }
    } else if (trimmed === 'pwd') {
      out([line(cwd.value || '/')])
    } else if (trimmed === 'ls' || trimmed === 'dir' || trimmed.startsWith('ls ') || trimmed.startsWith('dir ')) {
      const pathArg = trimmed === 'ls' || trimmed === 'dir' ? '' : trimmed.replace(/^(ls|dir)\s+/, '').trim()
      const resolved = resolvePath(cwd.value, pathArg)
      const entries = listDir(FS, resolved)
      if (entries === null) {
        const node = getNode(FS, resolved)
        out([line(`ls: ${pathArg || resolved}: ${!node ? 'No such file or directory' : 'Not a directory'}`, 'error')])
      } else {
        const names = entries
          .map(({ name, node: n }) => (n.t === 'd' ? name + '/' : name))
          .sort((a, b) => (a.endsWith('/') ? 0 : 1) - (b.endsWith('/') ? 0 : 1) || a.localeCompare(b))
        out(names.length ? [line(names.join('  '))] : [line('')])
      }
    } else if (trimmed === 'cat' || trimmed.startsWith('cat ')) {
      if (trimmed === 'cat') {
        out([line('cat: missing operand', 'error')])
      } else {
        const pathArg = raw.replace(/^cat\s+/i, '').trim()
        const toResolve = pathArg === 'about' || pathArg.endsWith('/about') ? pathArg.replace(/about$/, 'about.txt') : pathArg
        const resolved = resolvePath(cwd.value, toResolve)
        const node = getNode(FS, resolved)
        if (!node) {
          out([line(`cat: ${pathArg}: No such file or directory`, 'error')])
        } else if (node.t === 'd') {
          out([line(`cat: ${pathArg}: Is a directory`, 'error')])
        } else if (node.t === 'e') {
          out([line(`cat: ${pathArg}: Permission denied`, 'error')])
        } else if (node.t === 'f') {
          if (node.special === 'about') {
            out([
              line(`const engineer = {\n  name: "${cv.name}",\n  role: "${cv.roleDisplay ?? cv.title}"\n};`, 'code'),
              line(`→ ${cv.tagline}`),
            ])
          } else {
            const body = (node.body || '').split('\n')
            out(body.length ? body.map(t => line(t)) : [line('')])
          }
        }
      }
    } else if (trimmed === 'play snake' || trimmed === 'snake') {
      appRefs.gameOpen.value = true
      out([line('→ Launching snake.exe...')])
    } else if (trimmed === 'calculator' || trimmed === 'calc') {
      appRefs.calculatorOpen.value = true
      out([line('→ Opening calculator.exe...')])
    } else if (trimmed === 'notepad' || trimmed === 'notes') {
      appRefs.notepadOpen.value = true
      out([line('→ Opening notepad.exe...')])
    } else if (trimmed === 'typing' || trimmed === 'typing test') {
      appRefs.typingTestOpen.value = true
      out([line('→ Opening typing-test.exe...')])
    } else if (trimmed === 'encoder' || trimmed === 'base64' || trimmed === 'decode') {
      appRefs.encoderOpen.value = true
      out([line('→ Opening encoder.exe...')])
    } else if (trimmed === 'qr' || trimmed === 'qrcode') {
      appRefs.qrcodeOpen.value = true
      out([line('→ Opening qrcode.exe...')])
    } else if (trimmed === 'pomodoro' || trimmed === 'tomato') {
      appRefs.pomodoroOpen.value = true
      out([line('→ Opening pomodoro.exe...')])
    } else if (trimmed === 'color' || trimmed === 'color picker' || trimmed === 'picker') {
      appRefs.colorPickerOpen.value = true
      out([line('→ Opening color-picker...')])
    } else if (trimmed === 'stopwatch') {
      appRefs.stopwatchOpen.value = true
      out([line('→ Opening stopwatch...')])
    } else if (trimmed === 'password' || trimmed === 'passgen') {
      appRefs.passwordOpen.value = true
      out([line('→ Opening password generator...')])
    } else if (trimmed === 'duck' || trimmed === 'rubberduck' || trimmed === 'rubber duck') {
      appRefs.duckOpen.value = true
      out([line('→ Launching rubberduck.exe... *quack*')])
    } else if (trimmed === 'theme' || trimmed === 'theme light' || trimmed === 'theme dark') {
      if (trimmed === 'theme light') {
        themeApi.applyTheme('light')
        out([line('Theme set to light.')])
      } else if (trimmed === 'theme dark') {
        themeApi.applyTheme('dark')
        out([line('Theme set to dark.')])
      } else {
        themeApi.toggleTheme()
        out([line('Theme: ' + themeApi.theme.value + '.')])
      }
    } else if (trimmed === 'build something' || trimmed === 'build') {
      appRefs.showPlayPrompt.value = true
      out([line('→ Opening build-something...')])
    } else if (trimmed === 'whoami') {
      out([line(cv.name)])
    } else if (trimmed === 'version' || trimmed === '-v' || trimmed === '--version') {
      const base = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
      const v = getFancyVersion(base)
      out([
        line('dimchatzis.cv'),
        line(''),
        line(`  version:  v${v}`),
        line(''),
        line('  (what you see is what you get)'),
      ])
    } else if (trimmed === 'date') {
      const now = new Date()
      out([line(now.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'medium' }))])
    } else if (trimmed === 'fortune') {
      out([line(FORTUNES[Math.floor(Math.random() * FORTUNES.length)])])
    } else if (trimmed === 'neofetch') {
      out([
        line("       .' ".padEnd(20) + cv.name),
        line("       .'  ".padEnd(20) + cv.title),
        line("       '   ".padEnd(20) + cv.location),
        line(''),
        line('  OS: Vue.js (Composition API)'),
        line('  Host: dimchatzis.com'),
        line('  Kernel: JavaScript ES2022+'),
        line('  Shell: bash (this terminal)'),
        line('  Theme: Cyberpunk Green'),
      ])
    } else if (trimmed === 'ls' || trimmed === 'dir') {
      out([
        line('about.txt    snake.exe    build-something/'),
        line('calculator.exe  notepad.exe  typing-test.exe'),
        line('encoder.exe  qrcode.exe  pomodoro.exe  rubberduck.exe'),
        line('README.md    projects/    coffee.sh'),
      ])
    } else if (trimmed.startsWith('echo ')) {
      const rest = raw.replace(/^echo\s+/i, '').trim()
      out([line(rest || '(empty)')])
    } else if (trimmed.startsWith('wget ')) {
      const urlArg = raw.replace(/^wget\s+/i, '').trim().split(/\s+/)[0]
      let hostname = 'dimchatzis.com'
      let filename = 'index.html'
      try {
        const u = new URL(urlArg.startsWith('http') ? urlArg : 'https://' + urlArg)
        hostname = u.hostname
        const pathname = u.pathname || '/'
        filename = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '').split('/').pop() || 'index.html'
      } catch (_) {}
      const lastEntry = commandHistory.value[commandHistory.value.length - 1]
      out([
        line(`--${new Date().toISOString()}--  ${urlArg}`),
        line(`Resolving ${hostname} (${hostname})... 127.0.0.1`),
        line(`Connecting to ${hostname} (${hostname})|127.0.0.1|:443... connected.`),
        line(`HTTP request sent, awaiting response... 200 OK`),
        line(`Length: 4242 (4.1K) [application/octet-stream]`),
        line(`Saving to: '${filename}'`),
        line(''),
      ])
      let progress = 0
      const wgetInterval = setInterval(() => {
        progress += 4 + Math.floor(Math.random() * 6)
        if (progress >= 100) {
          clearInterval(wgetInterval)
          lastEntry.output = [
            line(`--${new Date().toISOString()}--  ${urlArg}`),
            line(`Resolving ${hostname} (${hostname})... 127.0.0.1`),
            line(`Connecting to ${hostname} (${hostname})|127.0.0.1|:443... connected.`),
            line(`HTTP request sent, awaiting response... 200 OK`),
            line(`Length: 4242 (4.1K) [application/octet-stream]`),
            line(`Saving to: '${filename}'`),
            line(''),
            line(`${filename}           100%[====================] 4.14K  --.-KB/s   in 0s`),
            line(''),
            line('2025-01-01 12:00:00 (4.14 KB/s) - ‘' + filename + '’ saved [4242/4242]'),
            line(''),
            line('(Just kidding — run npm run coffee to say hi ☕)'),
          ]
          nextTick(scrollTerminalToBottom)
          return
        }
        const filled = Math.floor((progress / 100) * 20)
        const bar = '='.repeat(filled) + '>' + ' '.repeat(19 - filled)
        const speed = (1.2 + Math.random() * 1.5).toFixed(2)
        lastEntry.output = [
          line(`--${new Date().toISOString()}--  ${urlArg}`),
          line(`Resolving ${hostname} (${hostname})... 127.0.0.1`),
          line(`Connecting to ${hostname} (${hostname})|127.0.0.1|:443... connected.`),
          line(`HTTP request sent, awaiting response... 200 OK`),
          line(`Length: 4242 (4.1K) [application/octet-stream]`),
          line(`Saving to: '${filename}'`),
          line(''),
          line(`${filename}         ${String(progress).padStart(3)}%[${bar}] ${(4.14 * progress / 100).toFixed(2)}K  ${speed}KB/s  in 0s`),
        ]
        nextTick(scrollTerminalToBottom)
      }, 120)
    } else if (trimmed === 'coffee') {
      out([
        line('Brewing... ☕'),
        line('Error: Out of beans. Try again tomorrow.'),
      ])
    } else if (trimmed === 'npm run coffee') {
      const subject = encodeURIComponent('Hi from your terminal ☕')
      const body = encodeURIComponent(
        'Hey Dimitris,\n\nI ran npm install dimchatzis and then npm run coffee. Just saying hi!\n\n'
      )
      out([
        line('> dimchatzis@1.0.0 coffee'),
        line('> open mail client'),
        line(''),
        line('Opening mail client to say hi...'),
      ])
      window.location.href = `mailto:${cv.email}?subject=${subject}&body=${body}`
    } else if (trimmed === 'sudo make sandwich' || trimmed === 'sudo make me a sandwich') {
      out([line('Okay. Here you go. 🥪')])
    } else if (trimmed.startsWith('sudo ')) {
      out([line('Nice try. (This is my terminal 😏)')])
    } else if (trimmed === 'sudo') {
      out([line('Nice try. (This is my terminal 😏)')])
    } else if (trimmed === 'rm -rf /' || trimmed === 'rm -rf / --no-preserve-root') {
      out([line("rm: cannot remove '/': Permission denied. (Also, nice try. 😏)")])
    } else if (trimmed === 'npm install' || trimmed === 'npm i') {
      out([line('Did you mean: npm install dimchatzis ?')])
    } else if (trimmed === ':q' || trimmed === ':q!' || trimmed === 'vim' || trimmed === 'vi') {
      out([line("E173: 1 file to edit. (You're already in the terminal.)")])
    } else if (trimmed === 'uname -a' || trimmed === 'uname') {
      out([line('Linux dimchatzis-cv 6.0.0-vue-vite-generic x86_64 GNU/Web')])
    } else if (
      (trimmed.startsWith('curl ') && (trimmed.includes('api/me') || trimmed.includes('dimchatzis.com'))) ||
      trimmed === 'curl api/me' ||
      trimmed === 'curl'
    ) {
      const json = JSON.stringify(
        {
          name: cv.name,
          role: cv.title,
          location: cv.location,
          email: cv.email,
          tagline: cv.tagline,
          skills: cv.skills.length,
          experience: cv.experience.length,
          endpoints: { cv: 'https://dimchatzis.com', api: 'https://dimchatzis.com/api/me' },
        },
        null,
        2
      )
      out([line(json, 'code')])
    } else if (trimmed === 'npm install dimchatzis' || trimmed === 'npm i dimchatzis') {
      out([
        line(''),
        line('> dimchatzis@1.0.0 preinstall'),
        line('> echo "Checking if human..."'),
        line(''),
        line('npm WARN deprecated legacy-peer-deps (coffee dependency)'),
        line(''),
        line('added 1 package, and audited 2 packages in 0.42s'),
        line(''),
        line('found 0 vulnerabilities'),
        line(''),
        line('✓ Dimitris Chatzis added to your network.'),
        line('  Run `npm run coffee` to say hi.'),
        line(''),
      ])
    } else if (trimmed === 'projects' || trimmed.startsWith('projects ')) {
      const filterMatch = trimmed.match(/projects\s+--filter\s+(npm|wordpress|composer|rust|web)/)
      const filter = filterMatch ? filterMatch[1] : 'all'
      appRefs.projectFilter.value = filter
      nextTick(() => {
        const el = mainRef.value?.querySelector?.('#projects')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      const filterLabels = { npm: 'NPM', wordpress: 'WordPress', composer: 'Composer', rust: 'Rust', web: 'Web' }
      const projects = (cv.projects || []).filter((p) => filter === 'all' || p.type === filter)
      const lines = projects.length
        ? [
            line(`${filter === 'all' ? 'All' : filterLabels[filter] || filter} projects (${projects.length}):`),
            ...projects.map((p) => line(`  • ${p.title} [${p.type}] — ${p.repo}`)),
            line(''),
            line('→ Scrolled to projects section.'),
          ]
        : [line('No projects found.'), line('→ Scrolled to projects section.')]
      out(lines)
    } else if (trimmed === 'weather') {
      const lastEntry = commandHistory.value[commandHistory.value.length - 1]
      out([line('Fetching weather for Athens...')])
      fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=37.98&longitude=23.73&current=temperature_2m,weather_code&timezone=Europe/Athens'
      )
        .then(r => r.json())
        .then(data => {
          const temp = data?.current?.temperature_2m ?? '?'
          const code = data?.current?.weather_code ?? 0
          const desc = weatherCodeToDesc(code)
          lastEntry.output = [...lastEntry.output, line(`${temp}°C · ${desc}`, 'output')]
        })
        .catch(() => {
          lastEntry.output = [...lastEntry.output, line('Weather API unavailable. Try again later.', 'error')]
        })
    } else if (!trimmed) {
      out([])
    } else {
      out([line(`Command not found: ${trimmed}. Type help for commands.`, 'error')])
    }
    terminalInput.value = ''
    cursorPos.value = 0
    nextTick(() => {
      scrollTerminalToBottom()
      inputRef.value?.focus()
    })
  }

  function openDuck() {
    appRefs.duckOpen.value = true
  }

  return {
    tabs,
    activeTabId,
    switchTab,
    addTab,
    closeTab,
    terminalLines,
    currentLineIndex,
    inputReady,
    terminalInput,
    cursorPos,
    inputRef,
    terminalScrollRef,
    mainRef,
    terminalContainerRef,
    commandHistory,
    executedCommands,
    historyIndex,
    savedInputBeforeHistory,
    tabCompletionIndex,
    cwd,
    isFullscreen,
    promptPrefix,
    runCommand,
    typeNextChar,
    onTerminalKeydown,
    scrollTerminalToBottom,
    toggleFullscreen,
    onFullscreenChange,
    introLines,
    commandSuggestion,
    suggestionSuffix,
    syncCursorPos,
    isModalOpen,
    openDuck,
  }
}
