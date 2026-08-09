# vue-dom-inspector

Advanced DevTools-style DOM inspector for Vue 3. **Hover** to see a highlight + compact label (no panel in the way). **Click** to pin and open the full panel with path, copy, navigate, selector test, and quick actions.

## Why use this instead of DevTools?

- **Stay in context** — Inspect and tweak without leaving your app or switching tabs.
- **Selector test** — Type a CSS selector and highlight all matches on the page (e.g. `.card` → 5 purple outlines).
- **Quick actions** — One click: Hide element, Outline (red border), or Log `$el` to console.
- **No panel blocking hover** — Full panel opens only when you pin; hover only shows the highlight + small label.

## UX

- **Hover** — Highlight overlay + label with selector and dimensions (e.g. `div.card · 320×200`). Nothing blocks the page.
- **Click element** — Pin it and open the full panel (path, details, Copy, Scroll, Unpin, More).
- **Path** — Expandable “Path” row with horizontal scroll; click any node to pin it.
- **Primary actions** — Copy, Scroll, Unpin.
- **+ More** — Copy as (Selector / JS / HTML), Computed, Back, Nav (↑↓←→), Quick (Hide, Outline, Log $el), Test selector.

## Features

### Inspection
- Box model, extra styles, a11y, hierarchy, expandable computed list.
- Optional box model layers overlay (margin/border/padding/content).
- Overlay label with selector and dimensions.

### When pinned
- **Path** — Breadcrumb from `body`; click to pin any ancestor.
- **Copy as** — Selector, `document.querySelector('...')`, or outer HTML.
- **Navigate** — Parent, first child, previous/next sibling (buttons or ↑↓←→).
- **History** — “← Back” to previous selection.
- **+ Computed** — Full list of computed styles.

### Wow
- **Test selector** — Input a CSS selector; all matches are highlighted with a purple overlay. Shows count (e.g. “3 match(es)”).
- **Quick actions** — **Hide** (toggle visibility), **Outline** (toggle red outline), **Log $el** (console.log the element + selector + computed styles).

### Keyboard
| Key | Action |
|-----|--------|
| `Escape` | Unpin or close inspector |
| `↑` `↓` `←` `→` | Parent / first child / prev / next sibling (when pinned) |

## Project structure (refactored)

```
dom-inspector/
  index.js              # Re-exports
  package.json
  vite.config.js
  src/
    DomInspector.vue    # Main component
    useDomInspector.js  # Composable
    options.js          # DEFAULT_OPTIONS, COMPUTED_STYLE_KEYS
    elementInfo.js      # getSelector, getBreadcrumb, getElementInfo, getBoxModelRects, etc.
    tooltipFormat.js    # escapeHtml, formatTooltipHtml
  dist/                 # npm run build
```

## Build

```bash
cd dom-inspector
npm install
npm run build
```

Output: `dist/index.js`, `dist/style.css`. For the parent app, use the source import `../dom-inspector` (resolves to `index.js`). To ship the package, publish with `dist` and set `"main": "dist/index.js"` if desired.

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { DomInspector } from '../dom-inspector'

const inspectorActive = ref(false)
</script>

<template>
  <DomInspector v-model:active="inspectorActive" />
</template>
```

**Props:** `ignoreSelector`, `showBoxModel`, `showMoreStyles`, `showA11y`, `showHierarchy`, `showBoxModelLayers`, `showComputedExpandable`, `clickToPin`, `compact`, `historySize`, `position`.

## Theming

CSS variables with fallbacks: `--bg-card`, `--border`, `--accent`, `--accent-dim`, `--bg-card-hover`, `--bg`, `--text`, `--text-muted`, `--font-mono`, `--skip-link-text`.

## Moving to own package

1. Copy the `dom-inspector` folder to a new repo.
2. Run `npm run build` before publishing.
3. Publish: `npm publish`.
