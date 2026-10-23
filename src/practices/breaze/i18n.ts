export const messages = {
  ru: {
    eyebrow: 'В СВОЁМ РИТМЕ', title: 'Пространство для дыхания', intro: 'Выберите практику или настройте свой ритм.\nНачните с комфортного для вас темпа.',
    practices: 'Выберите практику', choose: 'Нажмите на плашку, чтобы начать', cycles: 'Количество циклов', countdown: 'Отсчёт перед стартом', sec: 'с',
    custom: 'Свой ритм', customDescription: 'Настройте вдох, выдох и обе паузы.', customize: 'Настроить', start: 'Начать практику',
    inhale: 'Вдох', holdIn: 'Пауза после вдоха', exhale: 'Выдох', holdOut: 'Пауза после выдоха',
    rhythmOrder: 'Вдох · пауза · выдох · пауза', zeroHint: 'Пауза 0 секунд пропускается полностью.',
    cycle: 'Цикл', of: 'из', prepare: 'Старт через', paused: 'Практика на паузе', pause: 'Пауза', resume: 'Продолжить', stop: 'Завершить',
    done: 'Практика завершена', doneText: 'Вернитесь к обычному дыханию в своём темпе.', back: 'К практикам',
    controls: 'Пробел — пауза · Esc — завершить', note: 'Дышите без усилия. Если ритм неудобен, сократите время. При головокружении остановитесь и вернитесь к обычному дыханию.',
    footer: 'Дыхание в своём ритме', pageTitle: 'Breaze — дыхательные практики', description: 'Дыхательные практики с готовыми ритмами и своими настройками. Вдох, пауза, выдох, пауза.',
    total: 'Длительность', cycleHelp: 'Один цикл — вдох, обе паузы и выдох.', countdownHelp: '0 — начать сразу.', invalid: 'Проверьте значения: вдох и выдох от 1 до 60 с, паузы от 0 до 60 с.',
  },
  en: {
    eyebrow: 'AT YOUR OWN PACE', title: 'Room to breathe', intro: 'Choose a practice or find your own rhythm.\nBegin at a pace that feels comfortable.',
    practices: 'Choose a practice', choose: 'Select a card to begin', cycles: 'Number of cycles', countdown: 'Countdown before start', sec: 's',
    custom: 'Your rhythm', customDescription: 'Set the inhale, exhale and both holds.', customize: 'Customize', start: 'Begin practice',
    inhale: 'Inhale', holdIn: 'Hold after inhale', exhale: 'Exhale', holdOut: 'Hold after exhale',
    rhythmOrder: 'Inhale · hold · exhale · hold', zeroHint: 'A 0-second hold is skipped completely.',
    cycle: 'Cycle', of: 'of', prepare: 'Get ready', paused: 'Practice paused', pause: 'Pause', resume: 'Resume', stop: 'Stop',
    done: 'Practice complete', doneText: 'Return to your natural breathing at your own pace.', back: 'Back to practices',
    controls: 'Space — pause · Esc — finish', note: 'Breathe without forcing. Shorten any uncomfortable rhythm. If you feel dizzy, stop and return to normal breathing.',
    footer: 'Breathe at your own pace', pageTitle: 'Breaze — breathing practices', description: 'Breathing practices with preset and custom rhythms. Inhale, hold, exhale, hold.',
    total: 'Duration', cycleHelp: 'One cycle includes an inhale, both holds and an exhale.', countdownHelp: '0 — begin immediately.', invalid: 'Check the values: inhale/exhale 1–60 s, holds 0–60 s.',
  },
} as const;
export type Messages = { [K in keyof typeof messages.ru]: string };
