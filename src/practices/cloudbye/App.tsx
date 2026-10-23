import { useEffect, useReducer, useRef, useState, type FormEvent } from 'react';
import { Icon, PageIntro, PageLayout, PracticeControl, usePreferences } from '@terapevti4no/ui';
import { useImmersiveMode } from '../../SiteShell';
import CloudArt, { cloudShapes } from './CloudArt';
import { initialScene, sceneReducer } from './scene';
import WindGust from './WindGust';
import { cloudAtPoint, useCloudWind } from './useCloudWind';
import './style.css';

export default function Cloudbye() {
  const { lang } = usePreferences();
  const ru = lang === 'ru';
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [running, setRunning] = useState(false);
  const [gust, setGust] = useState<{ id: number; x: number; y: number; direction: 1 | -1 } | null>(null);
  const gustId = useRef(0);
  const blow = useCloudWind();
  const [scene, dispatchScene] = useReducer(sceneReducer, undefined, initialScene);
  const thoughtInput = useRef<HTMLInputElement>(null);
  const practiceTitle = useRef<HTMLHeadingElement>(null);
  useImmersiveMode(running);
  useEffect(() => {
    document.title = ru ? 'cloudbye — мысли на облаках' : 'cloudbye — thoughts on clouds';
    document.querySelector('meta[name="description"]')?.setAttribute('content', ru ? 'Замечайте мысли и наблюдайте, как они проплывают мимо.' : 'Notice your thoughts and watch them drift by.');
  }, [ru]);
  useEffect(() => {
    // The route also focuses its heading on mount; focus the editor afterwards.
    const frame = requestAnimationFrame(() => {
      if (!running) thoughtInput.current?.focus({ preventScroll: true });
      else practiceTitle.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [running]);
  const addThought = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setThoughts(current => [...current, text]);
    setDraft('');
    if (running) {
      dispatchScene({ type: 'add', thoughtIndex: thoughts.length });
    }
    thoughtInput.current?.focus();
  };
  const begin = () => {
    const text = draft.trim();
    if (!thoughts.length && !text) return;
    if (text) setThoughts(current => [...current, text]);
    setDraft(''); setGust(null); dispatchScene({ type: 'reset' }); setRunning(true);
  };
  const finish = () => {
    setRunning(false);
  };
  const editor = () => <form className={`cloud-editor${running ? ' cloud-practice-editor' : ''}`} onSubmit={addThought}>
    {!running && <label htmlFor="cloud-thought">{ru ? 'Какая мысль сейчас с вами?' : 'What thought is with you right now?'}</label>}
    <div className="cloud-input-wrap"><input type="text" ref={thoughtInput} id="cloud-thought" aria-label={running ? (ru ? 'Новая мысль' : 'New thought') : undefined} aria-describedby="cloud-thought-count" maxLength={240} value={draft} onChange={event => setDraft(event.target.value)} placeholder={running ? (ru ? 'Новая мысль…' : 'New thought…') : (ru ? 'Например: «А вдруг у меня не получится…»' : 'For example: “What if I can’t do it…”')}/>
    <small id="cloud-thought-count" className="cloud-thought-count">{draft.length}/240</small></div>
    <button className="cloud-add-button" type="submit" disabled={!draft.trim()} aria-label={ru ? 'Добавить мысль' : 'Add thought'}>+</button>
    {running && <PracticeControl action="close" label={ru ? 'Закрыть практику' : 'Close practice'} onClick={finish}/>}
  </form>;
  if (running) return <main id="main" className="cloud-practice">
    <div className="cloud-light" aria-hidden="true"/>
    <div className="cloud-guidance"><h1 ref={practiceTitle} tabIndex={-1}>{ru ? 'Пусть мысли проплывают мимо' : 'Let your thoughts drift by'}</h1><p>{ru ? 'Не нужно их прогонять или менять. Просто замечайте и возвращайтесь к небу.' : 'No need to push them away or change them. Just notice, and return to the sky.'}</p></div>
    <div className="cloud-sky" aria-label={ru ? 'Мысли на облаках' : 'Thoughts on clouds'} onPointerMove={event => {
      if (event.pointerType === 'mouse') event.currentTarget.style.cursor = cloudAtPoint(event.currentTarget, event.clientX, event.clientY) ? 'pointer' : '';
    }} onClick={event => {
      const slot = cloudAtPoint(event.currentTarget, event.clientX, event.clientY, event.target instanceof Element ? event.target.closest('.cloud-slot') : null);
      const cloud = slot?.querySelector<HTMLElement>('.thought-cloud');
      if (!slot || !cloud) return;
      const bounds = cloud.getBoundingClientRect();
      const direction = event.clientX < bounds.left + bounds.width / 2 ? 1 : -1;
      blow(slot, direction);
      const skyBounds = event.currentTarget.getBoundingClientRect();
      setGust({ id: ++gustId.current, x: event.clientX - skyBounds.left, y: event.clientY - skyBounds.top, direction });
    }}>
      <div className="cloud-distance cloud-distance-far"><CloudArt shape="wide"/></div>
      <div className="cloud-distance cloud-distance-near"><CloudArt shape="wispy"/></div>
      {scene.clouds.map(cloud => <div key={cloud.id} className={`cloud-slot${cloud.leaving ? ' is-leaving' : cloud.fresh ? ' is-new' : ''}`} onAnimationEnd={event => {
        if (event.target === event.currentTarget && cloud.leaving) dispatchScene({ type: 'finish', id: cloud.id, count: thoughts.length });
      }}>
        <div className="thought-cloud" tabIndex={0} role="group" aria-describedby="cloud-wind-hint" aria-label={ru ? 'Облако: вправо — ускорить, влево — замедлить' : 'Cloud: right arrow to speed up, left arrow to slow down'} title={ru ? 'Сзади — ускорить, спереди — замедлить' : 'Tap behind to speed up, ahead to slow down'} onKeyDown={event => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          const slot = event.currentTarget.parentElement;
          if (slot) blow(slot, event.key === 'ArrowRight' ? 1 : -1);
        }} onAnimationEnd={event => {
          // Only the journey itself advances the scene, not the text or volume.
          if (event.target === event.currentTarget) dispatchScene({ type: 'finish', id: cloud.id, count: thoughts.length });
        }}>
          <div className="cloud-volume"><CloudArt shape={cloudShapes[cloud.thoughtIndex % cloudShapes.length]}/></div>
          <p>{thoughts[cloud.thoughtIndex]}</p>
        </div>
      </div>)}
      {gust && <WindGust key={gust.id} x={gust.x} y={gust.y} direction={gust.direction} onComplete={() => setGust(current => current?.id === gust.id ? null : current)}/>}
    </div>
    <div className="cloud-bottom">
      <p className="cloud-wind-hint" id="cloud-wind-hint">{ru ? 'Нажмите сзади облака, чтобы подтолкнуть, или спереди, чтобы замедлить.' : 'Tap behind a cloud to nudge it, or ahead of it to slow it down.'}</p>
      {editor()}
    </div>
  </main>;
  return <PageLayout>
    <PageIntro eyebrow={ru ? 'МЫСЛИ НА ОБЛАКАХ' : 'THOUGHTS ON CLOUDS'} title={ru ? 'Вы — не ваши мысли' : 'You are more than your thoughts'} description={ru ? 'Представьте, что каждая мысль — облако. Вы можете заметить её и позволить ей плыть дальше.' : 'Imagine each thought as a cloud. You can notice it and let it drift on.'}/>
    <section className="cloud-setup ui-card">
      {!!thoughts.length && <ul className="cloud-thought-list">{thoughts.map((thought, i) => <li key={i}><span>{thought}</span><button onClick={() => setThoughts(current => current.filter((_, n) => n !== i))} aria-label={`${ru ? 'Удалить мысль' : 'Remove thought'} ${i + 1}`}>×</button></li>)}</ul>}
      {editor()}
      <p className="cloud-help">{ru ? 'Можно добавить несколько мыслей. Если появятся новые — добавьте их прямо в практике.' : 'Add one or several thoughts. You can add more during the practice.'}</p>
      <button type="button" className="primary cloud-start" disabled={!thoughts.length && !draft.trim()} onClick={begin}>{ru ? 'Начать' : 'Begin'}<Icon name="arrow"/></button>
    </section>
    <p className="cloud-private">{ru ? 'В своём темпе, без таймера. Мысли не сохраняются после перезагрузки страницы.' : 'At your own pace, without a timer. Thoughts are not saved after you reload the page.'}</p>
  </PageLayout>;
}
