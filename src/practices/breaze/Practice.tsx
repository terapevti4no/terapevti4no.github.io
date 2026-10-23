import { useCallback, useEffect, useRef, useState } from 'react';
import { frameAt, SessionClock, type Settings } from './session';
import type { Messages } from './i18n';
import { useMobileWakeLock } from './useMobileWakeLock';

type Props = { settings: Settings; name: string; t: Messages; onExit: () => void };
export default function Practice({ settings, name, t, onExit }: Props) {
  const [frame, setFrame] = useState(() => frameAt(0, settings));
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const clock = useRef(new SessionClock(performance.now()));
  const main = useRef<HTMLElement>(null);
  const orb = useRef<HTMLDivElement>(null);
  const lastInteraction = useRef(performance.now());
  const done = useRef(false);
  const reveal = useCallback(() => { lastInteraction.current = performance.now(); setVisible(true); }, []);
  const togglePause = useCallback(() => {
    if (done.current) return;
    const timer = clock.current; timer.setPaused(!timer.paused, performance.now());
    setPaused(timer.paused); setFrame(frameAt(timer.elapsed, settings)); reveal();
  }, [settings, reveal]);
  useMobileWakeLock(!paused && frame.phase !== 'done');
  useEffect(() => {
    const timer = new SessionClock(performance.now()); clock.current = timer;
    let raf = 0, previousKey = '';
    main.current?.focus({ preventScroll: true });
    const tick = (now: number) => {
      const current = frameAt(timer.advance(now), settings);
      // Each phase joins the next at the same radius with zero velocity.
      const eased = (1 - Math.cos(Math.PI * current.progress)) / 2;
      const expansion = current.phase === 'inhale' ? eased : current.phase === 'holdIn' ? 1 : current.phase === 'exhale' ? 1 - eased : 0;
      const pulse = Math.sin(Math.PI * current.progress) ** 2 * 0.045;
      const adjustment = current.phase === 'holdIn' ? -pulse : current.phase === 'holdOut' || current.phase === 'countdown' ? pulse : 0;
      if (orb.current) orb.current.style.transform = `scale(${0.48 + expansion * 0.52 + adjustment})`;
      const key = `${current.phase}:${current.cycle}:${Math.ceil(current.remaining / 1000)}`;
      if (key !== previousKey) { previousKey = key; setFrame(current); }
      done.current = current.phase === 'done';
      setVisible(now - lastInteraction.current < 2200);
      if (!done.current) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const visibility = () => { if (document.hidden && !done.current) { timer.setPaused(true, performance.now()); setPaused(true); setFrame(frameAt(timer.elapsed, settings)); reveal(); } };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onExit(); }
      if (event.code === 'Space' && !event.repeat && !(event.target instanceof Element && event.target.closest('button,a,input,textarea,select'))) { event.preventDefault(); togglePause(); }
    };
    document.addEventListener('visibilitychange', visibility); window.addEventListener('keydown', keyboard);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('keydown', keyboard); };
  }, [settings, onExit, togglePause, reveal]);
  const finished = frame.phase === 'done';
  const title = finished ? t.done : frame.phase === 'countdown' ? t.prepare : frame.phase === 'holdIn' || frame.phase === 'holdOut' ? t.pause : t[frame.phase];
  return <main ref={main} tabIndex={-1} className={`practice${finished ? ' is-done' : ''}`} aria-label={name} onPointerMove={reveal} onPointerDown={reveal} style={{ cursor: visible || paused || finished ? 'auto' : 'none' }}>
    <section className="practice-message">
      <p className="eyebrow">{name}</p>
      {finished && <h1 aria-live="polite">{title}</h1>}
      {finished ? <><p>{t.doneText}</p><button type="button" className="primary" onClick={onExit}>{t.back}</button></> : <>
        <div className="breathing-visual" data-breath-phase={frame.phase}>
          <div className="breathing-orb" ref={orb} aria-hidden="true"/>
          <div className="breathing-caption"><h1 aria-live="polite">{title}</h1><div className="count-number" data-phase={frame.phase}>{Math.ceil(frame.remaining / 1000)}</div></div>
        </div>
        <p className="cycle-label">{t.cycle} {frame.cycle} {t.of} {settings.cycles}</p>
        <p className="pause-status" role="status">{paused ? t.paused : '\u00a0'}</p>
      </>}
    </section>
    {!finished && <div className={`practice-controls${visible || paused || frame.phase === 'countdown' ? ' is-visible' : ''}`} onFocus={reveal}>
      <div><button type="button" onClick={togglePause}>{paused ? t.resume : t.pause}</button><button type="button" onClick={onExit}>{t.stop}</button></div>
      <small>{t.controls}</small>
    </div>}
  </main>;
}
