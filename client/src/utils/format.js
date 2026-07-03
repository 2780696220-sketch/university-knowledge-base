/**
 * Format a play count number to Chinese-friendly display.
 * e.g. 12345 → "1.2万", 890 → "890", 1234567 → "123.5万"
 */
export function formatPlayCount(count) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace(/\.0$/, '') + '万';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + '千';
  }
  return String(count);
}

/**
 * Normalize B站 duration string to MM:SS or HH:MM:SS.
 * B站 returns duration as a string like "45:30" or "01:23:45".
 */
export function formatDuration(duration) {
  if (!duration) return '';
  // Already in MM:SS or HH:MM:SS format — pass through
  return duration;
}
