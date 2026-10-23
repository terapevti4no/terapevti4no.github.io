import './style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePreferences } from '@terapevti4no/ui';
import { messages } from './i18n';
import { readSettings, saveSettings } from './preferences';
import { sanitize, type Settings } from './session';
import SettingsScreen from './SettingsScreen';
import Practice from './Practice';

export default function App() {
  const { lang, setLang, theme, setTheme } = usePreferences();
  const [settings, setSettings] = useState(readSettings);
  const [running, setRunning] = useState<{ settings: Settings; name: string } | null>(null);
  const lastChoice = useRef('');
  const exit = useCallback(() => setRunning(null), []);
  const t = messages[lang];
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => { document.title = t.pageTitle; document.querySelector('meta[name="description"]')?.setAttribute('content', t.description); }, [t]);
  useEffect(() => { if (!running && lastChoice.current) { const raf = requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-start="${lastChoice.current}"]`)?.focus()); return () => cancelAnimationFrame(raf); } }, [running]);
  if (running) return <Practice settings={running.settings} name={running.name} t={t} onExit={exit}/>;
  return <SettingsScreen settings={settings} setSettings={setSettings} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} t={t} onStart={(next, name, id) => { lastChoice.current = id; setRunning({ settings: sanitize(next), name }); }}/>;
}
