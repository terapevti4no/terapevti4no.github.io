import type { Lang } from '@terapevti4no/ui';
import type { Rhythm } from './session';
export interface Preset { id: string; rhythm: Rhythm; copy: Record<Lang, { name: string; description: string }> }
export const presets: Preset[] = [
  { id: 'balance', rhythm: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }, copy: {
    ru: { name: 'Равновесие', description: 'Равные вдох и выдох. Без задержек.' },
    en: { name: 'Balance', description: 'Equal inhales and exhales. No holds.' },
  } },
  { id: 'long-exhale', rhythm: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }, copy: {
    ru: { name: 'Плавный выдох', description: 'Выдох немного длиннее вдоха.' },
    en: { name: 'Gentle exhale', description: 'An exhale a little longer than the inhale.' },
  } },
  { id: 'box', rhythm: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }, copy: {
    ru: { name: 'Квадрат', description: 'Четыре равные фазы, включая паузы.' },
    en: { name: 'Box', description: 'Four equal phases, including the holds.' },
  } },
  { id: '478', rhythm: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }, copy: {
    ru: { name: 'Тихая пауза', description: 'Ритм 4–7–8 с длительной паузой.' },
    en: { name: 'Quiet pause', description: 'The 4–7–8 rhythm with a longer hold.' },
  } },
];
