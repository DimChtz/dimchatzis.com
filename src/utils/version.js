/**
 * Returns a fancy version string with deterministic build hash.
 * e.g. "1.0.0" → "1.0.0+7f3a2b"
 */
export function getFancyVersion(base) {
  if (!base || base === 'dev') return 'dev'
  const hash = base
    .split('')
    .reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
    .toString(16)
    .slice(0, 6)
  return `${base}+${hash}`
}
