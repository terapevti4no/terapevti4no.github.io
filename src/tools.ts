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
    href: 'https://terapevti4no.github.io/emdrdot/',
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
    href: 'https://terapevti4no.github.io/breaze/',
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
];
