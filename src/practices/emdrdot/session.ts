export type Mode = 'cycles' | 'time';
export interface Settings { mode: Mode; countdown: number; cycleMs: number; cycles: number; duration: number; sets: number; rest: number }
export const defaults: Settings = { mode: 'cycles', countdown: 5, cycleMs: 1500, cycles: 20, duration: 30, sets: 3, rest: 10 };
export const limits = { countdown: [0, 120], cycleMs: [1, 20000], cycles: [1, 1000], duration: [1, 3600], sets: [1, 100], rest: [1, 600] } as const;
export function sanitize(input: unknown): Settings {
  const value = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const result = { ...defaults, mode: value.mode === 'time' ? 'time' : 'cycles' } as Settings;
  for (const key of Object.keys(limits) as (keyof typeof limits)[]) {
    const n = value[key]; const [min, max] = limits[key];
    if (typeof n === 'number' && Number.isFinite(n)) result[key] = Math.min(max, Math.max(min, Math.round(n)));
  }
  return result;
}
export const setDuration = (s: Settings) => s.mode === 'cycles' ? s.cycles * s.cycleMs : s.duration * 1000;
export type Phase = 'countdown' | 'active' | 'rest' | 'done';
export interface Frame { phase: Phase; set: number; remaining: number; progress: number }
export function frameAt(elapsed: number, s: Settings): Frame {
  let time = Math.max(0, elapsed); const start = s.countdown * 1000; const active = setDuration(s); const rest = s.rest * 1000;
  if (time < start) return { phase: 'countdown', set: 1, remaining: start - time, progress: 0.5 };
  time -= start;
  const index = Math.floor(time / (active + rest));
  if (index >= s.sets) return { phase: 'done', set: s.sets, remaining: 0, progress: 0.5 };
  const within = time - index * (active + rest);
  if (within < active) {
    const fraction = (within % s.cycleMs) / s.cycleMs;
    return { phase: 'active', set: index + 1, remaining: active - within, progress: fraction < 0.5 ? fraction * 2 : 2 - fraction * 2 };
  }
  if (index === s.sets - 1) return { phase: 'done', set: s.sets, remaining: 0, progress: 0.5 };
  return { phase: 'rest', set: index + 1, remaining: active + rest - within, progress: 0.5 };
}
