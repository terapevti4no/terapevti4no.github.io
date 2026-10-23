import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults, frameAt, sanitize, setDuration } from './session.ts';
test('cycle timing returns to the left and reverses halfway', () => {
  const s = { ...defaults, countdown: 0 };
  assert.equal(frameAt(0, s).progress, 0);
  assert.equal(frameAt(750, s).progress, 1);
  assert.equal(frameAt(1500, s).progress, 0);
  assert.equal(setDuration(s), 30000);
});
test('countdown, rest, next set and completion have exact boundaries', () => {
  assert.equal(frameAt(4999, defaults).phase, 'countdown');
  assert.equal(frameAt(5000, defaults).phase, 'active');
  assert.equal(frameAt(35000, defaults).phase, 'rest');
  assert.equal(frameAt(45000, defaults).set, 2);
  assert.equal(frameAt(115000, defaults).phase, 'done');
});
test('time mode ends on time even during an incomplete cycle', () => {
  const s = { ...defaults, mode: 'time' as const, countdown: 0, duration: 1, sets: 1 };
  assert.equal(frameAt(999, s).phase, 'active');
  assert.equal(frameAt(1000, s).phase, 'done');
});
test('zero rest advances immediately and last set has no trailing rest', () => {
  const s = { ...defaults, countdown: 0, rest: 0 };
  assert.equal(frameAt(30000, s).set, 2);
  assert.equal(frameAt(90000, s).phase, 'done');
});
test('invalid saved settings cannot create invalid timing', () => {
  const s = sanitize({ cycleMs: 0, sets: -5, rest: NaN, mode: 'broken' });
  assert.equal(s.cycleMs, 1); assert.equal(s.sets, 1); assert.equal(s.rest, 10); assert.equal(s.mode, 'cycles');
});
test('only countdown allows zero; other numeric settings have a minimum of one', () => {
  const s = sanitize({ countdown: 0, cycleMs: 0, cycles: 0, duration: 0, sets: 0, rest: 0 });
  assert.equal(s.countdown, 0);
  assert.equal(sanitize({ countdown: -1 }).countdown, 0);
  for (const key of ['cycleMs', 'cycles', 'duration', 'sets', 'rest'] as const) {
    assert.equal(s[key], 1);
  }
});
