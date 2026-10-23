import { useId } from 'react';

const streams = [
  'M2 47C27 49 34 17 65 23S113 61 155 36',
  'M9 65C36 68 45 33 76 39S123 76 158 55',
  'M15 28C39 29 47 6 73 13S117 41 143 23',
];

export default function WindGust({ x, y, direction, onComplete }: { x: number; y: number; direction: 1 | -1; onComplete: () => void }) {
  const gradient = useId();
  return <div className={`cloud-gust${direction < 0 ? ' is-against' : ''}`} style={{ left: x, top: y }} aria-hidden="true">
    <svg width="144" height="84" viewBox="0 0 160 90" fill="none" strokeWidth="1.3" strokeLinecap="round" onAnimationEnd={event => {
      // The envelope outlasts the individual streams; remove only when it ends.
      if (event.target === event.currentTarget) onComplete();
    }}>
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--accent)" stopOpacity="0"/>
        <stop offset=".3" stopColor="var(--accent)" stopOpacity=".7"/>
        <stop offset=".65" stopColor="var(--cloud-highlight)" stopOpacity=".95"/>
        <stop offset="1" stopColor="var(--accent)" stopOpacity="0"/>
      </linearGradient></defs>
      {streams.map((path, index) => <path key={path} className={`cloud-wind-stream cloud-wind-stream-${index}`} d={path} pathLength="1" stroke={`url(#${gradient})`}/>)}
    </svg>
  </div>;
}
