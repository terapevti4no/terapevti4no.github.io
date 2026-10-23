import { useCallback, useEffect, useRef } from 'react';

type Gust = { force: number; rate: number };

// Include the soft edge and a little empty space ahead of and behind each cloud.
export function cloudAtPoint(sky: HTMLElement, x: number, y: number, preferred?: Element | null): HTMLElement | null {
  let nearest: HTMLElement | null = null;
  let distance = 1;
  sky.querySelectorAll<HTMLElement>('.cloud-slot').forEach(slot => {
    const cloud = slot.querySelector<HTMLElement>('.thought-cloud');
    const volume = slot.querySelector<HTMLElement>('.cloud-volume');
    if (!cloud || !volume || Number(getComputedStyle(slot).opacity) * Number(getComputedStyle(cloud).opacity) < .12) return;
    const bounds = volume.getBoundingClientRect();
    const dx = (x - (bounds.left + bounds.width / 2)) / (bounds.width * .46 + 72);
    const dy = (y - (bounds.top + bounds.height * .54)) / (bounds.height * .34 + 24);
    const hit = dx * dx + dy * dy;
    const score = preferred === slot && hit < 1 ? -1 : hit;
    if (score < distance) { distance = score; nearest = slot; }
  });
  return nearest;
}

export function useCloudWind() {
  const gusts = useRef(new Map<HTMLElement, Gust>());
  const frame = useRef<number | null>(null);
  const previous = useRef(0);
  const advance = useCallback(function advanceWind(now: number) {
    const elapsed = Math.max(0, now - previous.current);
    previous.current = now;
    gusts.current.forEach((gust, cloud) => {
      if (!cloud.isConnected) { gusts.current.delete(cloud); return; }
      gust.force *= Math.exp(-elapsed / 1400);
      gust.rate += (1 + gust.force - gust.rate) * (1 - Math.exp(-elapsed / 130));
      const settled = Math.abs(gust.force) < .015 && Math.abs(gust.rate - 1) < .02;
      // Keep each cloud's movement, text and departure in sync without restarting.
      cloud.getAnimations({ subtree: true }).forEach(animation => {
        if (animation.playState === 'running') animation.updatePlaybackRate(settled ? 1 : gust.rate);
      });
      if (settled) gusts.current.delete(cloud);
    });
    frame.current = gusts.current.size ? requestAnimationFrame(advanceWind) : null;
  }, []);
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    gusts.current.clear();
  }, []);
  return useCallback((cloud: HTMLElement, direction: 1 | -1) => {
    const gust = gusts.current.get(cloud) ?? { force: 0, rate: 1 };
    gust.force = Math.max(-.6, Math.min(1, direction * (.8 + Math.max(0, direction * gust.force) * .35)));
    gusts.current.set(cloud, gust);
    if (frame.current === null) {
      previous.current = performance.now();
      frame.current = requestAnimationFrame(advance);
    }
  }, [advance]);
}
