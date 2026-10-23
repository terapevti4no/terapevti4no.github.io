import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon, PageIntro, PageLayout, usePreferences } from '@terapevti4no/ui';
import { useImmersiveMode } from '../../SiteShell';
import './style.css';

export default function Cloudbye() {
  const { lang } = usePreferences();
  const ru = lang === 'ru';
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [adding, setAdding] = useState(false);
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
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
      if (!running || adding) thoughtInput.current?.focus({ preventScroll: true });
      else practiceTitle.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [running, adding]);
  const addThought = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setThoughts(current => [...current, text]);
    setDraft('');
    thoughtInput.current?.focus();
  };
  const begin = () => {
    const text = draft.trim();
    if (!thoughts.length && !text) return;
    if (text) setThoughts(current => [...current, text]);
    setDraft(''); setIndex(0); setCycle(0); setPaused(false); setRunning(true);
  };
  const finish = () => {
    setRunning(false); setAdding(false);
  };
  const editor = () => <form className="cloud-editor" onSubmit={addThought}>
    <label htmlFor="cloud-thought">{ru ? 'Какая мысль сейчас с вами?' : 'What thought is with you right now?'}</label>
    <div className="cloud-input-wrap"><input type="text" ref={thoughtInput} id="cloud-thought" aria-describedby="cloud-thought-count" maxLength={240} value={draft} onChange={event => setDraft(event.target.value)} placeholder={ru ? 'Например: «А вдруг у меня не получится…»' : 'For example: “What if I can’t do it…”'}/>
    <small id="cloud-thought-count" className="cloud-thought-count">{draft.length}/240</small></div>
    <button className="cloud-add-button" type="submit" disabled={!draft.trim()} aria-label={ru ? 'Добавить мысль' : 'Add thought'}>+</button>
  </form>;
  if (running) return <main id="main" className="cloud-practice">
    <div className="cloud-guidance"><h1 ref={practiceTitle} tabIndex={-1}>{ru ? 'Пусть мысли проплывают мимо' : 'Let your thoughts drift by'}</h1><p>{ru ? 'Не нужно их прогонять или менять. Просто замечайте и возвращайтесь к небу.' : 'No need to push them away or change them. Just notice, and return to the sky.'}</p></div>
    <div className="cloud-sky" aria-label={ru ? 'Мысли на облаках' : 'Thoughts on clouds'}>
      <div className="cloud-wisp cloud-wisp-one"/><div className="cloud-wisp cloud-wisp-two"/>
      <div key={cycle} className="thought-cloud" style={{ animationPlayState: paused || adding ? 'paused' : 'running' }} onAnimationEnd={() => { setIndex(current => (current + 1) % thoughts.length); setCycle(current => current + 1); }}><p>{thoughts[index]}</p></div>
    </div>
    <div className="cloud-bottom">
      {adding && <div className="cloud-add-panel">{editor()}<button className="cloud-text-button" onClick={() => setAdding(false)}>{ru ? 'Отмена' : 'Cancel'}</button></div>}
      <div className="cloud-controls"><button onClick={() => setAdding(value => !value)} aria-expanded={adding}>{ru ? '+ Мысль' : '+ Thought'}</button><button onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? (ru ? 'Продолжить' : 'Resume') : (ru ? 'Пауза' : 'Pause')}</button><button onClick={finish}>{ru ? 'Завершить' : 'Finish'}</button></div>
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
