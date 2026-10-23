import './style.css';
import { useEffect, useRef, useState } from 'react';
import { Footer, Icon, InfoNote, PageIntro, PageLayout, usePreferences } from '@terapevti4no/ui';

const copy = {
 ru: {
  eyebrow: 'ЗДЕСЬ И СЕЙЧАС', title: 'Заметьте, что рядом', intro: 'Посмотрите вокруг и пройдите пять шагов\nв своём темпе.',
  begin: 'Начать', overview: '5–4–3–2–1', explanation: 'Посмотрите вокруг, почувствуйте опору, прислушайтесь. Здесь не нужно спешить или искать правильный ответ.',
  senses: ['Вижу', 'Ощущаю', 'Слышу', 'Запах', 'Вкус'],
  titles: ['Найдите 5 вещей, которые видите', 'Заметьте 4 телесных ощущения', 'Прислушайтесь к 3 звукам', 'Заметьте 2 запаха', 'Заметьте 1 вкус'],
  hints: ['Цвет стены, свет в окне, предмет рядом. Позвольте взгляду остановиться на каждой вещи.', 'Стопы на полу, спина на стуле, ткань на коже, предмет в руках. Обратите внимание на текстуру и температуру.', 'Близкие и далёкие: шум за окном, голоса, шорох одежды. Не обязательно искать громкие звуки.', 'Запах воздуха, одежды или напитка рядом. Если ничего не замечаете, этот шаг можно пропустить.', 'Послевкусие напитка или еды, вкус во рту. Если сейчас не получается, можно просто пропустить шаг.'],
  enterHint: 'Или нажмите пробел.', controls: 'Пробел — отметить · Esc — завершить', mark: 'Заметили что-то? Нажмите на свободную отметку.', noted: 'Отмечено', item: 'Отметка', next: 'Дальше', skip: 'Пропустить', back: 'Назад', exit: 'Завершить', step: 'Шаг', done: 'Вы здесь', doneText: 'Практика завершена. Останьтесь на мгновение с тем, что замечаете сейчас.', again: 'Пройти ещё раз', home: 'К началу', note: 'Можно пропустить любой шаг или закончить раньше. Выбирайте только комфортные для вас ощущения.', footer: 'Внимание к настоящему моменту',
 },
 en: {
  eyebrow: 'HERE AND NOW', title: 'Notice what’s around you', intro: 'Take a look around and follow five steps\nat your own pace.',
  begin: 'Begin', overview: '5–4–3–2–1', explanation: 'Look around, feel what supports you, listen. Take your time — there is no right answer to find.',
  senses: ['See', 'Feel', 'Hear', 'Smell', 'Taste'],
  titles: ['Find 5 things you can see', 'Notice 4 things you can feel', 'Listen for 3 sounds', 'Notice 2 smells', 'Notice 1 taste'],
  hints: ['The wall’s colour, light from a window, an object nearby. Let your eyes rest on each thing.', 'Feet on the floor, your back against a chair, fabric on skin, an object in your hands. Notice texture and temperature.', 'Near or far: sounds outside, voices, the rustle of clothing. Quiet sounds count too.', 'The air, your clothes or a drink nearby. If you cannot notice a smell, you can skip this step.', 'A lingering taste of food or a drink, or the taste in your mouth. You can skip this step if nothing comes to mind.'],
  enterHint: 'Or press Space.', controls: 'Space — mark · Esc — finish', mark: 'Noticed something? Tap an empty mark.', noted: 'Noticed', item: 'Mark', next: 'Next', skip: 'Skip', back: 'Back', exit: 'Finish', step: 'Step', done: 'You are here', doneText: 'The practice is complete. Stay for a moment with what you notice now.', again: 'Try again', home: 'Back to start', note: 'You can skip any step or finish early. Choose only sensations that feel comfortable.', footer: 'Attention to the present moment',
 },
};

export default function App() {
 const {lang,setLang,theme,setTheme}=usePreferences();
 const t=copy[lang];
 const [screen,setScreen]=useState<'intro'|'practice'|'done'>('intro');
 const [step,setStep]=useState(0);
 const [marks,setMarks]=useState<boolean[][]>(()=>[5,4,3,2,1].map(n=>Array<boolean>(n).fill(false)));
 const heading=useRef<HTMLHeadingElement>(null);
 const started=useRef(false);
 useEffect(()=>{document.title=lang==='ru'?'Underground — практика 5–4–3–2–1':'Underground — 5–4–3–2–1 grounding';document.querySelector('meta[name="description"]')?.setAttribute('content',t.intro.replace('\n',' '));},[lang,t]);
 useEffect(()=>{if(started.current) heading.current?.focus();else started.current=true;},[screen,step]);
 const begin=()=>{setMarks([5,4,3,2,1].map(n=>Array<boolean>(n).fill(false)));setStep(0);setScreen('practice');};
 const next=()=>{if(step===4)setScreen('done');else setStep(n=>n+1);};
 const count=marks[step].filter(Boolean).length;
 useEffect(()=>{
  if(screen!=='practice') return;
  const keyboard=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();setScreen('intro');return;}
   if((event.key!=='Enter'&&event.code!=='Space')||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey) return;
   if(event.target instanceof Element && event.target.closest('button,a,input,textarea,select') && !event.target.closest('.marks button[aria-pressed]')) return;
   event.preventDefault();
   const index=marks[step].findIndex(value=>!value);
   if(index===-1){if(step===4)setScreen('done');else setStep(current=>current+1);}
   else setMarks(current=>current.map((row,j)=>j===step?row.map((value,i)=>i===index?true:value):row));
  };
  window.addEventListener('keydown',keyboard);
  return ()=>window.removeEventListener('keydown',keyboard);
 },[screen,step,marks]);
 const content = <>
  {screen==='intro'? <>
   <PageIntro eyebrow={t.eyebrow} title={t.title} description={t.intro}/>
   <section className="welcome ui-card" aria-label={t.overview}>
    <div className="sense-overview">{t.senses.map((name,i)=><div key={name}><span>{5-i}</span><small>{name}</small></div>)}</div>
    <button type="button" className="primary" onClick={begin}>{t.begin}<Icon name="arrow"/></button>
   </section>
  </>:screen==='practice'? <>
   <section className="step-card">
    <div className="practice-copy"><p className="session-progress">{t.step} {step+1} / 5</p>
    <p className="eyebrow">{t.senses[step]}</p>
    <h1 ref={heading} tabIndex={-1}>{t.titles[step]}</h1>
    <p className="step-hint">{t.hints[step]}</p>
    </div><div className="marks" role="group" aria-label={t.mark}>{marks[step].map((checked,i)=><button key={i} className={checked?'checked':i===marks[step].findIndex(value=>!value)?'suggested':''} aria-label={`${t.item} ${i+1}`} aria-pressed={checked} onClick={()=>setMarks(current=>current.map((row,j)=>j===step?row.map((value,k)=>k===i?!value:value):row))}>{checked?<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>:<span>{i+1}</span>}</button>)}{count===5-step && <button className="marks-next" aria-label={t.next} onClick={next}><Icon name="arrow"/></button>}</div>
    <div className="practice-caption"><p className="mark-hint">{t.mark}<span className="keyboard-hint"> {t.enterHint}</span></p><p className="mark-count" role="status">{t.noted}: {count} / {5-step}</p></div>
   </section>
  </>:<section className="completion">
    <div className="completion-mark" aria-hidden="true"><svg width="48" height="52" viewBox="0 0 56 62" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 25Q28 41 50 25M11 38Q28 50 45 38M17 51Q28 58 39 51M28 4v20m-7-7 7 7 7-7"/></svg></div>
    <p className="eyebrow">{t.overview}</p><h1 ref={heading} tabIndex={-1}>{t.done}</h1><p className="step-hint">{t.doneText}</p>
    <button className="primary" onClick={begin}>{t.again}<Icon name="arrow"/></button><button className="text-button home-button" onClick={()=>setScreen('intro')}>{t.home}</button>
  </section>}
  {screen==='intro' && <InfoNote>{t.note}</InfoNote>}
 </>;
 return screen==='intro' ? <PageLayout lang={lang} theme={theme} onLanguageChange={setLang} onThemeChange={setTheme} tool="underground" homeHref="/" toolHref="/underground/" footer={<Footer brand="UNDERGROUND">{t.footer}</Footer>}>{content}</PageLayout> : <main className="grounding-practice">
  <div className="practice-content">{content}</div>
  {screen==='practice' && <div className="practice-controls"><div><button type="button" onClick={next}>{t.skip}</button><button type="button" onClick={()=>setScreen('intro')}>{t.exit}</button></div><small>{t.controls}</small></div>}
 </main>;
}
