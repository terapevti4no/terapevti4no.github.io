import { useEffect, useRef, useState } from 'react';
import { frameAt, type Settings } from './session';
import type { Messages } from './i18n';
import { useMobileWakeLock } from './useMobileWakeLock';
export default function Practice({ settings, t, onExit }: {
    settings: Settings;
    t: Messages;
    onExit: () => void;
}) {
    const [frame, setFrame] = useState(() => frameAt(0, settings));
    const [paused, setPaused] = useState(false);
    const [visible, setVisible] = useState(true);
    const ball = useRef<HTMLDivElement>(null);
    const practice = useRef<HTMLElement>(null);
    useMobileWakeLock(!paused && frame.phase !== 'done');
    const elapsed = useRef(0);
    const pausedRef = useRef(false);
    const lastInteraction = useRef(performance.now());
    const togglePause = () => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); lastInteraction.current = performance.now(); setVisible(true); };
    useEffect(() => {
        let raf = 0;
        let previous = performance.now();
        let lastPaint = 0;
        const tick = (now: number) => {
            if (!pausedRef.current)
                elapsed.current += now - previous;
            previous = now;
            const current = frameAt(elapsed.current, settings);
            if (ball.current) {
                const width = practice.current?.clientWidth ?? window.innerWidth;
                const pad = Math.min(60, width * 0.08);
                ball.current.style.transform = `translate3d(${pad + current.progress * (width - pad * 2)}px, -50%, 0) translateX(-50%)`;
                ball.current.style.visibility = current.phase === 'active' && !pausedRef.current ? 'visible' : 'hidden';
            }
            if (now - lastPaint > 80 || current.phase === 'done') {
                setFrame(current);
                setVisible(now - lastInteraction.current < 2200);
                lastPaint = now;
            }
            if (current.phase !== 'done')
                raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        const hidden = () => { if (document.hidden) {
            pausedRef.current = true;
            setPaused(true);
        } previous = performance.now(); };
        const key = (e: KeyboardEvent) => { if (e.code === 'Space' && !(e.target instanceof HTMLButtonElement)) {
            e.preventDefault();
            togglePause();
        } if (e.key === 'Escape')
            onExit(); };
        document.addEventListener('visibilitychange', hidden);
        window.addEventListener('keydown', key);
        return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', hidden); window.removeEventListener('keydown', key); };
    }, [settings, onExit]);
    const reveal = () => { lastInteraction.current = performance.now(); setVisible(true); };
    return <main ref={practice} className={`practice ${frame.phase === 'done' ? 'is-done' : ''}`} onPointerMove={reveal} onPointerDown={reveal} style={{ cursor: visible || paused || frame.phase !== 'active' ? 'auto' : 'none' }}><div className="moving-ball" ref={ball}/>{frame.phase === 'done' ? <section className="practice-message"><span className="complete-symbol" aria-hidden="true">✓</span><h1>{t.done}</h1><p>{t.doneText}</p><button className="primary" onClick={onExit}>{t.back}</button></section> : (paused || frame.phase !== 'active') && <section className="practice-message" aria-live="polite"><p className="eyebrow">{t.set} {frame.set} {t.of} {settings.sets}</p><h1>{paused ? t.paused : frame.phase === 'countdown' ? t.prepare : t.restTitle}</h1>{!paused && <div className="count-number">{Math.ceil(frame.remaining / 1000)}</div>}{paused && <button className="primary" onClick={togglePause}>{t.resume}</button>}</section>}{frame.phase !== 'done' && <div className={`practice-controls ${visible || paused || frame.phase !== 'active' ? 'is-visible' : ''}`} onFocus={reveal}><span>{t.set} {frame.set} {t.of} {settings.sets}</span><div><button onClick={togglePause}>{paused ? t.resume : t.pause}</button><button onClick={onExit}>{t.stop}</button></div><small>{t.controls}</small></div>}</main>;
}
