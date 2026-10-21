import type { Lang } from '@terapevti4no/ui';
export type Tool = {
  id: string;
  name: string;
  logo?: 'emdrdot';
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
];
