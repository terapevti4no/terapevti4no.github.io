import { readPreferences, type Theme } from '@terapevti4no/ui';
import { sanitize, type Settings } from './session';
export type { Theme };
function record(): Record<string, unknown> {
  try {
    const value = JSON.parse(localStorage.getItem('emdrdot:v1') || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
export function readSaved() {
  return { ...readPreferences({ storageKey: 'emdrdot:v1', fallbackKeys: ['terapevti4no:v1'] }), settings: sanitize(record().settings as Partial<Settings>) };
}
export function saveSettings(settings: Settings) {
  try { localStorage.setItem('emdrdot:v1', JSON.stringify({ ...record(), settings })); }
  catch { /* Practice also works with browser storage disabled. */ }
}
