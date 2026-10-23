import test from 'node:test';
import assert from 'node:assert/strict';
import { frameAt, defaults, sanitize, cycleDuration, totalDuration, SessionClock } from './session.ts';
import { presets } from './presets.ts';

test('countdown runs once and zero holds are skipped without a zero-second frame', () => {
  const s = { ...defaults, cycles: 2, countdown: 3 };
  assert.equal(frameAt(2999, s).phase, 'countdown');
  assert.deepEqual(frameAt(3000, s), { phase: 'inhale', cycle: 1, remaining: 6000, progress: 0 });
  assert.equal(frameAt(8999, s).phase, 'inhale');
  assert.equal(frameAt(9000, s).phase, 'exhale');
  assert.deepEqual(frameAt(15000, s), { phase: 'inhale', cycle: 2, remaining: 6000, progress: 0 });
  assert.equal(frameAt(27000, s).phase, 'done');
});

test('all four box phases have exact boundaries, including the final exhale hold', () => {
  const s = { ...defaults, ...presets[2].rhythm, countdown: 0, cycles: 1 };
  assert.equal(frameAt(0, s).phase, 'inhale');
  assert.equal(frameAt(4000, s).phase, 'holdIn');
  assert.equal(frameAt(9000, s).phase, 'exhale');
  assert.equal(frameAt(12000, s).phase, 'holdOut');
  assert.equal(frameAt(15999, s).phase, 'holdOut');
  assert.equal(frameAt(16000, s).phase, 'done');
});

test('4–7–8 begins the next inhale immediately after its exhale', () => {
  const s = { ...defaults, ...presets[3].rhythm, countdown: 0, cycles: 2 };
  assert.equal(frameAt(4000, s).phase, 'holdIn');
  assert.equal(frameAt(11000, s).phase, 'exhale');
  assert.deepEqual(frameAt(19000, s), { phase: 'inhale', cycle: 2, remaining: 4000, progress: 0 });
  assert.equal(frameAt(38000, s).phase, 'done');
});

test('every preset keeps time and never returns an empty active phase', () => {
  for (const preset of presets) {
    const s = { ...defaults, ...preset.rhythm, countdown: 0, cycles: 3 };
    assert.equal(totalDuration(s), cycleDuration(s) * 3);
    for (let ms = 0; ms < totalDuration(s); ms += 137) {
      const f = frameAt(ms, s);
      assert.ok(f.remaining > 0);
      assert.ok(f.cycle >= 1 && f.cycle <= 3);
      assert.ok(f.progress >= 0 && f.progress < 1);
      assert.notEqual(f.phase, 'done');
    }
    assert.equal(frameAt(totalDuration(s), s).phase, 'done');
  }
});

test('pause captures the last fraction of a second and excludes all paused time', () => {
  const c = new SessionClock(100);
  assert.equal(c.advance(1000), 900);
  c.setPaused(true, 1050);
  assert.equal(c.elapsed, 950);
  assert.equal(c.advance(12000), 950);
  c.setPaused(false, 20000);
  assert.equal(c.advance(20050), 1000);
  assert.equal(c.advance(19900), 1000);
});

test('pausing during countdown or a breath phase resumes the same remainder', () => {
  const c = new SessionClock(0);
  const s = { ...defaults, countdown: 2 };
  c.setPaused(true, 750);
  assert.equal(frameAt(c.advance(50000), s).remaining, 1250);
  c.setPaused(false, 60000);
  assert.equal(frameAt(c.advance(61250), s).phase, 'inhale');
  c.setPaused(true, 62000);
  assert.equal(frameAt(c.advance(100000), s).remaining, 5250);
});

test('only holds and pre-start countdown accept zero; malformed saved values are bounded', () => {
  assert.deepEqual(sanitize({ inhale: 0, exhale: -3, holdIn: 0, holdOut: 0, cycles: 0, countdown: 0 }), { inhale: 1, exhale: 1, holdIn: 0, holdOut: 0, cycles: 1, countdown: 0 });
  assert.deepEqual(sanitize(null), defaults);
  const s = sanitize({ inhale: Infinity, exhale: NaN, cycles: 100000, countdown: -1, holdIn: 1000, holdOut: 1.8 });
  assert.equal(s.inhale, 6); assert.equal(s.exhale, 6); assert.equal(s.cycles, 100); assert.equal(s.countdown, 0); assert.equal(s.holdIn, 60); assert.equal(s.holdOut, 2);
});
