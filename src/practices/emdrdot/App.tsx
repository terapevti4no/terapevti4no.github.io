import { useImmersiveMode } from '../../SiteShell';
import './style.css';
import { useEffect, useState } from 'react';
import { usePreferences } from '@terapevti4no/ui';
import { messages } from './i18n';
import { readSaved, saveSettings } from './preferences';
import Practice from './Practice';
import SettingsScreen from './SettingsScreen';
export default function App() {
    const [settings, setSettings] = useState(() => readSaved().settings);
    const { lang } = usePreferences();
    const [running, setRunning] = useState(false);
    useImmersiveMode(running);
    const t = messages[lang];
    useEffect(() => {
        document.title = lang === 'ru' ? 'EMDR Dot — визуальная стимуляция' : 'EMDR Dot — visual stimulation';
        document.querySelector('meta[name="description"]')?.setAttribute('content', t.intro);
    }, [lang, t]);
    useEffect(() => { saveSettings(settings); }, [settings]);
    if (running)
        return <Practice settings={settings} t={t} onExit={() => setRunning(false)}/>;
    return <SettingsScreen settings={settings} setSettings={setSettings} lang={lang} onStart={() => setRunning(true)}/>;
}
