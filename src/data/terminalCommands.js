export const HELP_TEXT = [
  '  cat about.txt  — 📄 Show about',
  '  play snake     — 🎮 Open Snake game',
  '  build something — ✨ Build something (quick game)',
  '  calculator     — 🧮 Open calculator',
  '  notepad        — 📝 Open notepad (auto-saves)',
  '  typing         — ⌨️  Typing speed test',
  '  encoder        — 🔐 Base64 / URL encode & decode',
  '  qr             — 📱 QR code generator',
  '  pomodoro       — 🍅 Focus timer (25/5 min)',
  '  color          — 🎨 Color picker (hex/RGB/HSL, palette)',
  '  stopwatch      — ⏱️  Stopwatch with laps',
  '  password       — 🔑 Password generator',
  '  theme [light|dark] — 🌓 Set theme (or toggle)',
  '  whoami         — 👤 Who is behind this terminal',
  '  version        — 🔢 Show build version',
  '  date           — 📅 Current date & time',
  '  fortune        — 🍀 Random dev quote',
  '  neofetch       — 🖥️  System info (parody)',
  '  weather        — 🌤️  Live weather (Athens)',
  '  curl api/me    — 📡 Fetch CV as JSON',
  '  npm i dimchatzis — 📦 Install me (parody)',
  '  npm run coffee  — ☕ Say hi (opens email)',
  '  ls             — 📁 List files',
  '  echo <text>    — 📢 Echo text back',
  '  duck           — 🦆 Rubber duck debugging (tell it your bug)',
  '  coffee         — ☕ Brew a virtual coffee',
  '  clear          — 🧹 Clear terminal',
  '  cd [path]      — 📂 Change directory',
  '  pwd            — 📍 Print working directory',
  '  man <cmd>      — 📖 Manual page for a command',
  '  which <cmd>    — 🔍 Path of a command',
  '  history        — 📜 List previous commands',
  '  ↑/↓            — Command history',
  '  Tab            — Complete command',
  '  help [filter]  — Show help (optional filter)',
  '  projects [--filter npm|wordpress|composer|rust|web] — 📦 Show projects, scroll to section, filter by type',
]

export const TAB_COMMANDS = [
  'cat about.txt', 'play snake', 'build something', 'calculator', 'notepad', 'typing', 'encoder', 'qr', 'pomodoro', 'color', 'stopwatch', 'password',
  'duck', 'whoami', 'version', 'date', 'fortune', 'neofetch', 'ls', 'echo ', 'coffee', 'clear', 'weather', 'theme', 'theme light', 'theme dark',
  'curl https://dimchatzis.com/api/me', 'npm install dimchatzis', 'npm run coffee',
  'help', 'help ', 'man ', 'which ', 'history', 'cd', 'cd ..', 'cd ~', 'cd /', 'pwd',
  'projects', 'projects --filter npm', 'projects --filter wordpress', 'projects --filter composer', 'projects --filter rust', 'projects --filter web',
]

export const COMMANDS = [
  { name: 'cat about.txt', aliases: ['cat about', 'cat about.txt'], path: '/usr/bin/cat', helpLine: '  cat about.txt  — 📄 Show about' },
  { name: 'snake', aliases: ['play snake', 'snake'], path: '/usr/games/snake.exe', helpLine: '  play snake     — 🎮 Open Snake game' },
  { name: 'build something', aliases: ['build', 'build something'], path: '/usr/bin/build-something', helpLine: '  build something — ✨ Build something (quick game)' },
  { name: 'calculator', aliases: ['calculator', 'calc'], path: '/usr/bin/calculator.exe', helpLine: '  calculator     — 🧮 Open calculator' },
  { name: 'notepad', aliases: ['notepad', 'notes'], path: '/usr/bin/notepad.exe', helpLine: '  notepad        — 📝 Open notepad (auto-saves)' },
  { name: 'typing', aliases: ['typing', 'typing test'], path: '/usr/bin/typing-test.exe', helpLine: '  typing         — ⌨️  Typing speed test' },
  { name: 'encoder', aliases: ['encoder', 'base64', 'decode'], path: '/usr/bin/encoder.exe', helpLine: '  encoder        — 🔐 Base64 / URL encode & decode' },
  { name: 'qr', aliases: ['qr', 'qrcode'], path: '/usr/bin/qrcode.exe', helpLine: '  qr             — 📱 QR code generator' },
  { name: 'pomodoro', aliases: ['pomodoro', 'tomato'], path: '/usr/bin/pomodoro.exe', helpLine: '  pomodoro       — 🍅 Focus timer (25/5 min)' },
  { name: 'color', aliases: ['color', 'color picker', 'picker'], path: '/apps/color-picker', helpLine: '  color          — 🎨 Color picker (hex/RGB/HSL, palette)' },
  { name: 'stopwatch', aliases: ['stopwatch', 'stop watch'], path: '/apps/stopwatch', helpLine: '  stopwatch      — ⏱️  Stopwatch with laps' },
  { name: 'password', aliases: ['password', 'passgen'], path: '/apps/password', helpLine: '  password       — 🔑 Password generator' },
  { name: 'theme', aliases: ['theme', 'theme light', 'theme dark'], path: 'builtin', helpLine: '  theme [light|dark] — 🌓 Set theme (or toggle)' },
  { name: 'whoami', aliases: ['whoami'], path: '/usr/bin/whoami', helpLine: '  whoami         — 👤 Who is behind this terminal' },
  { name: 'version', aliases: ['version', '-v', '--version'], path: '/usr/bin/version', helpLine: '  version        — 🔢 Show build version' },
  { name: 'date', aliases: ['date'], path: '/usr/bin/date', helpLine: '  date           — 📅 Current date & time' },
  { name: 'fortune', aliases: ['fortune'], path: '/usr/games/fortune', helpLine: '  fortune        — 🍀 Random dev quote' },
  { name: 'neofetch', aliases: ['neofetch'], path: '/usr/bin/neofetch', helpLine: '  neofetch       — 🖥️  System info (parody)' },
  { name: 'weather', aliases: ['weather'], path: '/usr/bin/weather', helpLine: '  weather        — 🌤️  Live weather (Athens)' },
  { name: 'curl api/me', aliases: ['curl', 'curl api/me'], path: '/usr/bin/curl', helpLine: '  curl api/me    — 📡 Fetch CV as JSON' },
  { name: 'npm install dimchatzis', aliases: ['npm i dimchatzis', 'npm install dimchatzis'], path: '/usr/lib/node_modules/dimchatzis', helpLine: '  npm i dimchatzis — 📦 Install me (parody)' },
  { name: 'npm run coffee', aliases: ['npm run coffee'], path: '/usr/lib/node_modules/dimchatzis/scripts/coffee', helpLine: '  npm run coffee  — ☕ Say hi (opens email)' },
  { name: 'ls', aliases: ['ls', 'dir'], path: '/usr/bin/ls', helpLine: '  ls             — 📁 List files' },
  { name: 'echo', aliases: ['echo'], path: '/usr/bin/echo', helpLine: '  echo <text>    — 📢 Echo text back' },
  { name: 'duck', aliases: ['duck', 'rubberduck', 'rubber duck'], path: '/usr/bin/rubberduck.exe', helpLine: '  duck           — 🦆 Rubber duck debugging (tell it your bug)' },
  { name: 'coffee', aliases: ['coffee'], path: '/usr/bin/coffee.sh', helpLine: '  coffee         — ☕ Brew a virtual coffee' },
  { name: 'clear', aliases: ['clear'], path: 'builtin', helpLine: '  clear          — 🧹 Clear terminal' },
  { name: 'cd', aliases: ['cd'], path: 'builtin', helpLine: '  cd [path]      — 📂 Change directory' },
  { name: 'pwd', aliases: ['pwd'], path: 'builtin', helpLine: '  pwd            — 📍 Print working directory' },
  { name: 'help', aliases: ['help'], path: 'builtin', helpLine: '  help [filter]  — Show help (optional filter)' },
  { name: 'man', aliases: ['man'], path: '/usr/bin/man', helpLine: '  man <cmd>      — 📖 Manual page for a command' },
  { name: 'which', aliases: ['which', 'whereis'], path: 'builtin', helpLine: '  which <cmd>    — 🔍 Path of a command' },
  { name: 'history', aliases: ['history'], path: 'builtin', helpLine: '  history        — 📜 List previous commands' },
  { name: 'projects', aliases: ['projects', 'projects --filter npm', 'projects --filter wordpress', 'projects --filter composer', 'projects --filter rust', 'projects --filter web'], path: 'builtin', helpLine: '  projects [--filter npm|wordpress|composer|rust|web] — 📦 Show projects, scroll to section, filter by type' },
]

export const MAN_PAGES = {
  'cat about.txt': ['NAME', '       cat about.txt - display about block', '', 'SYNOPSIS', '       cat about.txt', '       cat about', '', 'DESCRIPTION', '       Prints the engineer object and tagline (JavaScript-style).', ''],
  'snake': ['NAME', '       snake - classic snake game', '', 'SYNOPSIS', '       snake', '       play snake', '', 'DESCRIPTION', '       Launches the snake game in a new window.', ''],
  'build something': ['NAME', '       build something - quick building game', '', 'SYNOPSIS', '       build something', '       build', '', 'DESCRIPTION', '       Opens a small game where you build something.', ''],
  'calculator': ['NAME', '       calculator - simple calculator', '', 'SYNOPSIS', '       calculator', '       calc', '', 'DESCRIPTION', '       Opens an in-page calculator.', ''],
  'notepad': ['NAME', '       notepad - scratchpad (auto-saves)', '', 'SYNOPSIS', '       notepad', '       notes', '', 'DESCRIPTION', '       Opens a notepad; content is saved in your browser.', ''],
  'typing': ['NAME', '       typing - typing speed test', '', 'SYNOPSIS', '       typing', '       typing test', '', 'DESCRIPTION', '       Opens the typing speed test.', ''],
  'encoder': ['NAME', '       encoder - Base64 / URL encode & decode', '', 'SYNOPSIS', '       encoder', '       base64', '       decode', '', 'DESCRIPTION', '       Opens the encoder/decoder tool.', ''],
  'qr': ['NAME', '       qr - QR code generator', '', 'SYNOPSIS', '       qr', '       qrcode', '', 'DESCRIPTION', '       Opens the QR code generator.', ''],
  'pomodoro': ['NAME', '       pomodoro - focus timer', '', 'SYNOPSIS', '       pomodoro', '       tomato', '', 'DESCRIPTION', '       Starts a 25/5 min Pomodoro timer.', ''],
  'color': ['NAME', '       color - color picker', '', 'SYNOPSIS', '       color', '       color picker', '       picker', '', 'DESCRIPTION', '       Opens a color picker with hex/RGB/HSL, copy formats, and saved palette.', ''],
  'stopwatch': ['NAME', '       stopwatch - stopwatch with laps', '', 'SYNOPSIS', '       stopwatch', '', 'DESCRIPTION', '       Starts a stopwatch with lap times.', ''],
  'password': ['NAME', '       password - generate secure passwords', '', 'SYNOPSIS', '       password', '       passgen', '', 'DESCRIPTION', '       Opens a password generator (length, options, copy).', ''],
  'theme': ['NAME', '       theme - set terminal theme', '', 'SYNOPSIS', '       theme', '       theme light', '       theme dark', '', 'DESCRIPTION', '       With no argument, toggles light/dark. Otherwise sets theme.', ''],
  'whoami': ['NAME', '       whoami - print current user', '', 'SYNOPSIS', '       whoami', '', 'DESCRIPTION', '       Prints the name behind this terminal.', ''],
  'version': ['NAME', '       version - print build version', '', 'SYNOPSIS', '       version', '       -v', '       --version', '', 'DESCRIPTION', '       Prints the current build version. What you see is what you get.', ''],
  'date': ['NAME', '       date - print date and time', '', 'SYNOPSIS', '       date', '', 'DESCRIPTION', '       Prints current date and time.', ''],
  'fortune': ['NAME', '       fortune - random dev quote', '', 'SYNOPSIS', '       fortune', '', 'DESCRIPTION', '       Prints a random developer quote.', ''],
  'neofetch': ['NAME', '       neofetch - system info (parody)', '', 'SYNOPSIS', '       neofetch', '', 'DESCRIPTION', '       Displays system information in neofetch style.', ''],
  'weather': ['NAME', '       weather - live weather for Athens', '', 'SYNOPSIS', '       weather', '', 'DESCRIPTION', '       Fetches and displays current weather for Athens.', ''],
  'curl api/me': ['NAME', '       curl api/me - fetch CV as JSON', '', 'SYNOPSIS', '       curl api/me', '       curl https://dimchatzis.com/api/me', '', 'DESCRIPTION', '       Fetches the CV payload as JSON.', ''],
  'npm install dimchatzis': ['NAME', '       npm install dimchatzis - add Dimitris to your network', '', 'SYNOPSIS', '       npm install dimchatzis', '       npm i dimchatzis', '', 'DESCRIPTION', '       Parody install. Run npm run coffee to say hi.', ''],
  'npm run coffee': ['NAME', '       npm run coffee - open mail client', '', 'SYNOPSIS', '       npm run coffee', '', 'DESCRIPTION', '       Opens your mail client to send a message.', ''],
  'ls': ['NAME', '       ls - list files', '', 'SYNOPSIS', '       ls', '       dir', '', 'DESCRIPTION', '       Lists virtual files and apps in this terminal.', ''],
  'echo': ['NAME', '       echo - echo text', '', 'SYNOPSIS', '       echo <text>', '', 'DESCRIPTION', '       Prints the given text.', ''],
  'duck': ['NAME', '       duck - rubber duck debugging', '', 'SYNOPSIS', '       duck', '       rubberduck', '', 'DESCRIPTION', '       Opens a rubber duck. Explain your bug to it. It won\'t judge.', '       (It might quack.) Based on the time-honoured practice of', '       rubber duck debugging: the act of explaining your code', '       to an inanimate object until the solution appears.', ''],
  'coffee': ['NAME', '       coffee - brew virtual coffee', '', 'SYNOPSIS', '       coffee', '', 'DESCRIPTION', '       Brews a virtual coffee (may run out of beans).', ''],
  'clear': ['NAME', '       clear - clear terminal', '', 'SYNOPSIS', '       clear', '', 'DESCRIPTION', '       Clears the terminal screen and history.', ''],
  'help': ['NAME', '       help - list or search commands', '', 'SYNOPSIS', '       help [filter]', '', 'DESCRIPTION', '       With no filter, lists all commands. With a filter, shows only matching lines (fuzzy).', ''],
  'cd': ['NAME', '       cd - change directory', '', 'SYNOPSIS', '       cd [path]', '', 'DESCRIPTION', '       Change current directory. With no path, go to home. Use .. for parent, ~ for home.', ''],
  'pwd': ['NAME', '       pwd - print working directory', '', 'SYNOPSIS', '       pwd', '', 'DESCRIPTION', '       Print the current working directory.', ''],
  'man': ['NAME', '       man - display manual pages', '', 'SYNOPSIS', '       man <command>', '', 'DESCRIPTION', '       Displays the manual page for the given command.', ''],
  'which': ['NAME', '       which - locate a command', '', 'SYNOPSIS', '       which <command>', '       whereis <command>', '', 'DESCRIPTION', '       Prints the path of the given command.', ''],
  'history': ['NAME', '       history - list command history', '', 'SYNOPSIS', '       history [n]', '       !n', '', 'DESCRIPTION', '       Lists the last 50 commands. Use !n to re-run the nth command.', ''],
  'projects': ['NAME', '       projects - show open source projects', '', 'SYNOPSIS', '       projects', '       projects --filter npm', '       projects --filter wordpress', '       projects --filter composer', '       projects --filter rust', '       projects --filter web', '', 'DESCRIPTION', '       Scrolls to the projects section and optionally filters by type.', '       With no filter, shows all projects. Use --filter to filter by:', '       npm (NPM packages), wordpress (WordPress plugins), composer (Composer packages),', '       rust (Rust crates), or web (web projects).', ''],
}

export const FORTUNES = [
  'There are only 10 types of people: those who get binary and those who don\'t.',
  'A bug in the code is worth two in the spec.',
  'Real programmers count from 0.',
  'It works on my machine. 🤷',
  'Delete the code. Delete the code. Delete the code. — The Cat in the Hat (probably)',
  'First solve the problem. Then write the code. — John Johnson',
  'Any sufficiently advanced bug is indistinguishable from a feature.',
  'Talk is cheap. Show me the code. — Linus Torvalds',
  'The best error message is the one that never shows up.',
  'Code is like humor. When you have to explain it, it\'s bad. — Cory House',
]

export function weatherCodeToDesc(code) {
  const map = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Snow', 75: 'Heavy snow',
    80: 'Slight rain showers', 81: 'Rain showers', 82: 'Heavy rain showers',
    95: 'Thunderstorm', 96: 'Thunderstorm (hail)', 99: 'Thunderstorm (heavy hail)',
  }
  return map[code] ?? 'Unknown'
}

export function findCommand(keyword) {
  if (!keyword || !keyword.trim()) return null
  const k = keyword.trim().toLowerCase()
  const exact = COMMANDS.find(c => c.name === k || c.aliases.some(a => a === k))
  if (exact) return exact
  const fuzzy = COMMANDS.filter(c =>
    c.name.includes(k) || c.aliases.some(a => a.includes(k))
  )
  return fuzzy.length === 1 ? fuzzy[0] : fuzzy.length > 1 ? fuzzy : null
}

export function getFilteredHelpLines(filter) {
  if (!filter || !filter.trim()) return HELP_TEXT
  const k = filter.trim().toLowerCase()
  return HELP_TEXT.filter(t => t.toLowerCase().includes(k))
}
