import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { defaults, limits, sanitize, setDuration, type Settings } from './session';
import { messages, type Lang } from './i18n';
import type { Theme } from './preferences';
import { Footer, Icon, InfoNote, PageIntro, PageLayout } from '@terapevti4no/ui';
type Props = {
    settings: Settings;
    setSettings: Dispatch<SetStateAction<Settings>>;
    lang: Lang;
    setLang: Dispatch<SetStateAction<Lang>>;
    theme: Theme;
    setTheme: Dispatch<SetStateAction<Theme>>;
    onStart: () => void;
};
export default function SettingsScreen({ settings, setSettings, lang, setLang, theme, setTheme, onStart }: Props) {
    const [fullscreen, setFullscreen] = useState(false);
    const [error, setError] = useState('');
    const [drafts, setDrafts] = useState<Partial<Record<keyof typeof limits, string>>>({});
    const t = messages[lang];
    useEffect(() => { const update = () => setFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', update); return () => document.removeEventListener('fullscreenchange', update); }, []);
    async function toggleFullscreen() { try {
        if (document.fullscreenElement)
            await document.exitFullscreen();
        else
            await document.documentElement.requestFullscreen();
        setError('');
    }
    catch {
        setError(t.fullscreenError);
    } }
    const seconds = (ms: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(ms / 1000);
    const total = settings.countdown * 1000 + setDuration(settings) * settings.sets + settings.rest * 1000 * (settings.sets - 1);
    function field(key: keyof typeof limits, label: string, unit?: string, help?: string) {
        return (
            <label className="field" htmlFor={key}>
                <span>{label}</span>
                <div className="number-wrap">
                    <input
                        id={key}
                        type="number"
                        required
                        min={limits[key][0]}
                        max={limits[key][1]}
                        step="1"
                        value={drafts[key] ?? settings[key]}
                        onChange={e => {
                            const value = e.target.value;
                            const number = e.target.valueAsNumber;
                            setDrafts(current => ({ ...current, [key]: value }));
                            if (Number.isFinite(number)) {
                                setSettings(current => ({ ...current, [key]: number }));
                            }
                        }}
                        onBlur={e => {
                            // React may retain the input's spelling when its numeric value is unchanged.
                            e.currentTarget.value = String(sanitize(settings)[key]);
                            setSettings(current => sanitize(current));
                            setDrafts(current => {
                                const next = { ...current };
                                delete next[key];
                                return next;
                            });
                        }}
                    />
                    {unit && <span className="unit">{unit}</span>}
                </div>
                {help && <small>{help}</small>}
            </label>
        );
    }
    return <PageLayout lang={lang} theme={theme} onLanguageChange={setLang} onThemeChange={setTheme} tool="emdrdot" homeHref="/" toolHref="/emdrdot/" footer={<Footer brand="EMDR DOT">{lang === 'ru' ? 'Простой инструмент визуальной стимуляции' : 'A simple visual stimulation tool'}</Footer>}>
      <PageIntro eyebrow={t.eyebrow} title={t.title} description={t.intro}/>
      <form className="settings-card ui-card" onSubmit={e => { e.preventDefault(); setSettings(s => sanitize(s)); onStart(); }}><div className="card-heading"><h2>{t.setup}</h2><button type="button" className="text-button" onClick={() => { setSettings({ ...defaults }); setDrafts({}); }}>{t.reset}</button></div><fieldset className="mode-field"><legend>{t.mode}</legend><div className="mode-toggle"><button type="button" aria-pressed={settings.mode === 'cycles'} onClick={() => setSettings(s => ({ ...s, mode: 'cycles' }))}>{t.byCycles}</button><button type="button" aria-pressed={settings.mode === 'time'} onClick={() => setSettings(s => ({ ...s, mode: 'time' }))}>{t.byTime}</button></div></fieldset><div className="field-grid">{field('cycleMs', t.cycleMs, t.ms, t.cycleHelp)}{settings.mode === 'cycles' ? field('cycles', t.cycles) : field('duration', t.duration, t.sec)}{field('sets', t.sets)}{field('rest', t.rest, t.sec)}{field('countdown', t.countdown, t.sec)}</div>{settings.mode === 'time' && <p className="mode-note">{t.timeModeHelp}</p>}<div className="summary"><div><span>{t.summarySet}</span><strong>{seconds(setDuration(settings))} <small>{t.sec}</small></strong></div><div><span>{t.summaryTotal}</span><strong>{seconds(total)} <small>{t.sec}</small></strong></div>{settings.mode === 'time' && <div><span>{t.summaryCycles}</span><strong>≈ {new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(settings.duration * 1000 / settings.cycleMs)}</strong></div>}</div><div className="fullscreen-hint"><Icon name="expand"/><div><p>{t.hint} <button type="button" className="text-button" onClick={toggleFullscreen}>{fullscreen ? t.exitFullscreen : t.fullscreen}</button></p><p className="orientation-hint">{t.rotateHint}</p></div></div>{error && <p className="error" role="status">{error}</p>}<button type="submit" className="primary start-button">{t.start}<Icon name="arrow"/></button></form>
      <InfoNote>{t.footer}</InfoNote>
    </PageLayout>;
}
