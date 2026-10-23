import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Footer, Icon, InfoNote, PageIntro, PageLayout, type Lang, type Theme } from '@terapevti4no/ui';
import { presets } from './presets';
import { cycleDuration, limits, phaseOrder, sanitize, type Settings } from './session';
import type { Messages } from './i18n';

type Props = { settings: Settings; setSettings: Dispatch<SetStateAction<Settings>>; lang: Lang; setLang: (lang: Lang) => void; theme: Theme; setTheme: (theme: Theme) => void; t: Messages; onStart: (settings: Settings, name: string, id: string) => void };
export default function SettingsScreen({ settings, setSettings, lang, setLang, theme, setTheme, t, onStart }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [drafts, setDrafts] = useState<Partial<Record<keyof Settings, string>>>({});
  const common = useRef<HTMLFormElement>(null);
  const field = (key: keyof Settings, label: string, hint?: string) => <label className="field" htmlFor={key}>
    <span>{label}</span><div className="number-wrap"><input id={key} type="number" required min={limits[key][0]} max={limits[key][1]} step="1" value={drafts[key] ?? settings[key]}
      onChange={event => { const input = event.currentTarget; setDrafts(current => ({ ...current, [key]: input.value })); if (input.validity.valid && input.value !== '') setSettings(current => ({ ...current, [key]: input.valueAsNumber })); }}
      onBlur={event => { const value = event.currentTarget.valueAsNumber; const next = sanitize({ ...settings, [key]: Number.isFinite(value) ? value : settings[key] }); event.currentTarget.value = String(next[key]); setSettings(next); setDrafts(current => { const copy = { ...current }; delete copy[key]; return copy; }); }}/>{key !== 'cycles' && <span className="unit">{t.sec}</span>}</div>{hint && <small>{hint}</small>}
  </label>;
  const start = (next: Settings, name: string, id: string) => { if (common.current?.reportValidity()) onStart(sanitize(next), name, id); };
  return <PageLayout lang={lang} theme={theme} onLanguageChange={setLang} onThemeChange={setTheme} tool="breaze" homeHref="/" toolHref="/breaze/" footer={<Footer brand="BREAZE">{t.footer}</Footer>}>
    <PageIntro eyebrow={t.eyebrow} title={t.title} description={t.intro}/>
    <form className="session-options ui-card" ref={common} onSubmit={event => event.preventDefault()}>
      {field('cycles', t.cycles, t.cycleHelp)}{field('countdown', t.countdown, t.countdownHelp)}
    </form>
    <section className="presets" aria-labelledby="practices-title">
      <div className="section-heading"><h2 id="practices-title">{t.practices}</h2><p>{t.choose}</p></div>
      <p className="rhythm-legend">{t.rhythmOrder}</p>
      <div className="preset-grid">{presets.map(preset => <button className="preset-card ui-card" type="button" key={preset.id} data-start={preset.id} onClick={() => start({ ...settings, ...preset.rhythm }, preset.copy[lang].name, preset.id)}>
        <span className="preset-title">{preset.copy[lang].name}<Icon name="arrow"/></span>
        <span className="preset-description">{preset.copy[lang].description}</span>
        <span className="preset-bottom"><span className="rhythm">{phaseOrder.map(phase => preset.rhythm[phase]).join(' · ')}</span><span>{t.total}: {cycleDuration(preset.rhythm) * settings.cycles / 1000} {t.sec}</span></span>
      </button>)}</div>
      <div className={`custom-choice ui-card${customOpen ? ' is-open' : ''}`}>
        <div className="custom-heading"><div><strong>{t.custom}</strong><p>{t.customDescription}</p></div>
          <button className="custom-action" type="button" aria-expanded={customOpen} aria-controls="custom-settings" onClick={() => setCustomOpen(open => !open)}>{t.customize}<Icon name="arrow"/></button>
        </div>
        <div className="custom-summary"><span className="rhythm">{phaseOrder.map(phase => settings[phase]).join(' · ')}</span><span>{t.total}: {cycleDuration(settings) * settings.cycles / 1000} {t.sec}</span></div>
        <form id="custom-settings" className="custom-settings" hidden={!customOpen} onSubmit={event => { event.preventDefault(); start(settings, t.custom, 'custom'); }}>
          <div className="rhythm-fields">{phaseOrder.map(phase => <div key={phase}>{field(phase, t[phase])}</div>)}</div>
          <p className="zero-hint">{t.zeroHint}</p>
        </form>
        <button type="submit" form="custom-settings" className="primary custom-start" data-start="custom">{t.start}<Icon name="arrow"/></button>
      </div>
    </section>
    <InfoNote>{t.note}</InfoNote>
  </PageLayout>;
}
