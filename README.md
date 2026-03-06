# Terminal CV Theme

A terminal-inspired CV site built with **Vue 3** and **Vite**. Type commands in a fake terminal, play games, use dev tools, and scroll to a classic CV layout. Fork it and make it yours.

## Features

- **Interactive terminal** — Type `help` to see commands. Tab completion, command history (↑/↓), multiple tabs.
- **Games** — Snake (`play snake`), Build Something (`build something`).
- **Dev tools** — Calculator, Notepad (auto-saves), Typing speed test, Base64/URL encoder, QR code generator, Pomodoro timer, Color picker, Stopwatch, Password generator.
- **Rubber duck** — `duck` to talk through your bug.
- **Theme** — Light/dark toggle, persisted in localStorage.
- **Print** — Download CV as PDF, print-friendly layout.
- **API** — `curl api/me` returns CV as JSON.

## Use this template

1. **Fork** this repo (or use as template).
2. Edit `src/data/cv.js` — name, title, experience, education, skills, links, etc.
3. Edit `src/config/site.js` — set `repoUrl` to your GitHub repo (or remove the "Get the theme" links).
4. Optional: Add your PDF to `public/cv/` and update the link in `TerminalHero.vue` if needed.
5. Build and deploy.

## Project structure

```
src/
├── components/     # Vue components (TerminalHero, CvMain, modals, games, tools)
├── composables/    # useTerminal, useTheme
├── config/        # site.js (repo URL)
├── data/          # cv.js, terminalCommands.js
├── utils/         # version, playPromptStorage
└── style.css      # Global styles, CSS variables
scripts/
└── deploy.js      # SFTP deploy
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Deploy

Deploys `dist/` to a remote server via SFTP:

```bash
npm run deploy
```

Create `.env.deploy` (see `.env.deploy.example`):

| Variable | Required | Description |
|----------|----------|-------------|
| `DEPLOY_HOST` | ✓ | e.g. `sftp.example.com` |
| `DEPLOY_USER` | ✓ | SSH username |
| `DEPLOY_REMOTE` | ✓ | Remote path, e.g. `/var/www/html` |
| `DEPLOY_PASSWORD` or `DEPLOY_KEY` | ✓ | Auth |
| `DEPLOY_PORT` | | Default 22 |

`.env.deploy` is gitignored — never commit credentials.

## Tech

- **Vue 3** (Composition API)
- **Vite 5**
- **qrcode** — QR code generation
- No UI framework — custom CSS with CSS variables, JetBrains Mono / Outfit fonts

## License

MIT — see [LICENSE](LICENSE).
