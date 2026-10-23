import { defaults, sanitize, type Settings } from './session';
function readRecord(): Record<string, unknown> {
  try { const value = JSON.parse(localStorage.getItem('breaze:v1') || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  catch { return {}; }
}
export function readSettings(): Settings { return sanitize(readRecord().settings ?? defaults); }
export function saveSettings(settings: Settings) {
  try { localStorage.setItem('breaze:v1', JSON.stringify({ ...readRecord(), settings })); } catch { /* Storage is optional. */ }
}
