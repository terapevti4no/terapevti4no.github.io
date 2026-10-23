import type { Lang, ToolName } from '@terapevti4no/ui';
export type Tool = {
  id: string;
  name: string;
  logo?: ToolName;
  href: string;
  copy: Record<Lang, { category: string; description: string; features: string[] }>;
};

export const tools: Tool[] = [
  {
    id: 'emdrdot', name: 'EMDR Dot', logo: 'emdrdot',
    href: '/emdrdot/',
    copy: {
      ru: {
        category: 'Визуальная стимуляция',
        description: 'Движущаяся точка и настраиваемый таймер. Выберите скорость, количество подходов и время отдыха.',
        features: ['Без регистрации', 'Настройки сохраняются'],
      },
      en: {
        category: 'Visual stimulation',
        description: 'A moving dot and an adjustable timer. Choose the speed, number of sets and rest time.',
        features: ['No sign-up', 'Settings remembered'],
      },
    },
  },
  {
    id: 'breaze', name: 'Breaze', logo: 'breaze',
    href: '/breaze/',
    copy: {
      ru: {
        category: 'Дыхательные практики',
        description: 'Вдох, пауза, выдох, пауза. Выберите готовый ритм или настройте свой, с отсчётом перед стартом.',
        features: ['Четыре готовых ритма', 'Свои настройки'],
      },
      en: {
        category: 'Breathing practices',
        description: 'Inhale, hold, exhale, hold. Choose a preset or set your own rhythm, with a countdown before you begin.',
        features: ['Four preset rhythms', 'Custom settings'],
      },
    },
  },
  {
    id: 'underground', name: 'Underground', logo: 'underground',
    href: '/underground/',
    copy: {
      ru: {
        category: 'Практика заземления',
        description: 'Пять чувств — пять шагов. Замечайте то, что видите, ощущаете, слышите, чувствуете на запах и вкус, в своём темпе.',
        features: ['Техника 5–4–3–2–1', 'Без таймера'],
      },
      en: {
        category: 'Grounding practice',
        description: 'Five senses, five steps. Notice what you can see, feel, hear, smell and taste at your own pace.',
        features: ['5–4–3–2–1 technique', 'No timer'],
      },
    },
  },
  {
    id: 'cloudbye', name: 'cloudbye', logo: 'cloudbye', href: '/cloudbye/',
    copy: {
      ru: { category: 'Наблюдение за мыслями', description: 'Поместите мысли на облака и наблюдайте, как они проплывают мимо. Можно добавлять новые прямо в практике.', features: ['В своём темпе', 'Без сохранения мыслей'] },
      en: { category: 'Observing thoughts', description: 'Place your thoughts on clouds and watch them drift by. Add new thoughts during the practice.', features: ['At your own pace', 'Thoughts stay private'] },
    },
  },
];
