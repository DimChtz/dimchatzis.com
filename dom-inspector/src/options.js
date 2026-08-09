export const DEFAULT_OPTIONS = {
  ignoreSelector: null,
  showBoxModel: true,
  showMoreStyles: true,
  showA11y: true,
  showHierarchy: true,
  showBoxModelLayers: false,
  showComputedExpandable: true,
  clickToPin: true,
  compact: false,
  historySize: 30,
}

export const STORAGE_KEY_BUTTON_COLLAPSED = 'dom-inspector-button-collapsed'
export const SHORTCUT_MODIFIER = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'Meta' : 'Control'
export const SHORTCUT_KEY = 'I'
export const SHORTCUT_USE_ALT = true

export const COMPUTED_STYLE_KEYS = [
  'display', 'position', 'top', 'right', 'bottom', 'left',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-width', 'border-style', 'border-color', 'border-radius',
  'box-sizing', 'overflow', 'overflow-x', 'overflow-y',
  'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
  'align-items', 'align-self', 'justify-content', 'justify-self', 'gap',
  'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
  'font-size', 'font-weight', 'line-height', 'color', 'background-color',
  'opacity', 'visibility', 'z-index', 'transform', 'transition', 'animation',
]
