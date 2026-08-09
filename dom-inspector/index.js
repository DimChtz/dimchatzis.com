/**
 * vue-dom-inspector
 * DevTools-style DOM inspector for Vue 3.
 * Hover to inspect; click to pin; Escape to unpin or close.
 *
 * @example
 * import { DomInspector, useDomInspector } from './dom-inspector'
 * <DomInspector v-model:active="inspectorActive" />
 */

export { default as DomInspector } from './src/DomInspector.vue'
export { useDomInspector } from './src/useDomInspector.js'
