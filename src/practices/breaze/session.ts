export type BreathPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
export type Phase = 'countdown' | BreathPhase | 'done';
export interface Rhythm { inhale: number; holdIn: number; exhale: number; holdOut: number }
export interface Settings extends Rhythm { cycles: number; countdown: number }
export const phaseOrder: BreathPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut'];
export const limits = { inhale: [1, 60], holdIn: [0, 60], exhale: [1, 60], holdOut: [0, 60], cycles: [1, 100], countdown: [0, 120] } as const;
export const defaults: Settings = { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0, cycles: 4, countdown: 5 };
export function sanitize(input: unknown): Settings {
  const value = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const result = { ...defaults };
  for (const key of Object.keys(limits) as (keyof Settings)[]) {
    const number = value[key]; const [min, max] = limits[key];
    if (typeof number === 'number' && Number.isFinite(number)) result[key] = Math.max(min, Math.min(max, Math.round(number)));
  }
  return result;
}
export const cycleDuration = (s: Rhythm) => phaseOrder.reduce((total, phase) => total + s[phase] * 1000, 0);
export const totalDuration = (s: Settings) => s.countdown * 1000 + cycleDuration(s) * s.cycles;
export interface Frame { phase: Phase; cycle: number; remaining: number; progress: number }
export function frameAt(elapsed: number, settings: Settings): Frame {
  const time = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
  const countdown = settings.countdown * 1000;
  if (time < countdown) return { phase: 'countdown', cycle: 1, remaining: countdown - time, progress: time / countdown };
  const duration = cycleDuration(settings);
  const active = time - countdown;
  if (active >= duration * settings.cycles) return { phase: 'done', cycle: settings.cycles, remaining: 0, progress: 1 };
  const index = Math.floor(active / duration);
  let within = active - index * duration;
  for (const phase of phaseOrder) {
    const length = settings[phase] * 1000;
    if (length > 0 && within < length) return { phase, cycle: index + 1, remaining: length - within, progress: within / length };
    within -= length;
  }
  throw new Error('Invalid breathing rhythm');
}

// Time is independent of React rendering: pauses freeze elapsed time exactly.
export class SessionClock {
  private previous: number;
  elapsed = 0;
  paused = false;
  constructor(now: number) { this.previous = now; }
  advance(now: number) {
    const next = Math.max(this.previous, now);
    if (!this.paused) this.elapsed += next - this.previous;
    this.previous = next;
    return this.elapsed;
  }
  setPaused(paused: boolean, now: number) { this.advance(now); this.paused = paused; }
}
