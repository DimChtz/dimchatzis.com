<script setup>
defineProps({
  /** Optional class for the wrapper (e.g. 'terminal-bar__dots'). */
  wrapperClass: { type: String, default: '' },
})
</script>

<template>
  <span class="window-dots" :class="wrapperClass">
    <span class="window-dot window-dot--red" aria-hidden="true"></span>
    <span class="window-dot window-dot--yellow" aria-hidden="true"></span>
    <span class="window-dot window-dot--green" aria-hidden="true"></span>
  </span>
</template>

<style scoped>
.window-dots {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.window-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.window-dot--red {
  background: #ff5f56;
}

.window-dot--yellow {
  background: #ffbd2e;
}

.window-dot--green {
  background: #00ff88;
}
</style>
