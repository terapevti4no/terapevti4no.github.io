const messages = {
  ru: {
    brand: 'терапевтично', eyebrow: 'НЕБОЛЬШИЕ ПОМОЩНИКИ',
    title: 'Больше внимания практике',
    intro: 'Всё нужное — под рукой. Выберите инструмент\nи начните в своём темпе.',
    category: 'Визуальная стимуляция',
    description: 'Движущаяся точка и настраиваемый таймер. Выберите скорость, количество подходов и время отдыха.',
    feature1: 'Без регистрации', feature2: 'Настройки сохраняются',
    more: 'Здесь будут появляться новые инструменты.',
    note: 'Инструменты помогают организовать практику и не заменяют работу со специалистом.',
    footerBrand: 'ТЕРАПЕВТИЧНО', footer: 'С вниманием к простому',
    language: 'Язык', dark: 'Тёмная тема', light: 'Светлая тема',
    pageTitle: 'Терапевтично — инструменты для практики',
    pageDescription: 'Терапевтично — простые инструменты для практики. EMDR Dot и другие небольшие помощники в одном месте.',
  },
  en: {
    brand: 'terapevti4no', eyebrow: 'A FEW HELPING TOOLS',
    title: 'More room for practice.',
    intro: 'What you need, close at hand. Choose a tool\nand begin at your own pace.',
    category: 'Visual stimulation',
    description: 'A moving dot and an adjustable timer. Choose the speed, number of sets and rest time.',
    feature1: 'No sign-up', feature2: 'Settings remembered',
    more: 'More tools will find their home here.',
    note: 'These tools support your practice and do not replace working with a qualified professional.',
    footerBrand: 'TERAPEVTI4NO', footer: 'Care in the simple things',
    language: 'Language', dark: 'Dark theme', light: 'Light theme',
    pageTitle: 'terapevti4no — tools for practice',
    pageDescription: 'Simple tools for practice. EMDR Dot and other small helpers, all in one place.',
  },
};
const preferences = window.hubPreferences;
function render() {
  const t = messages[preferences.lang];
  document.documentElement.lang = preferences.lang;
  document.documentElement.dataset.theme = preferences.theme;
  document.title = t.pageTitle;
  document.querySelector('meta[name="description"]').content = t.pageDescription;
  document.querySelector('meta[name="theme-color"]').content = preferences.theme === 'dark' ? '#171d1a' : '#f6f5f0';
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t[element.dataset.i18n]; });
  document.querySelector('[data-brand]').setAttribute('aria-label', t.brand);
  document.querySelector('[data-language-group]').setAttribute('aria-label', t.language);
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === preferences.lang)));
  const toggle = document.querySelector('[data-theme-toggle]');
  const label = preferences.theme === 'light' ? t.dark : t.light;
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
  try { localStorage.setItem('terapevti4no:v1', JSON.stringify(preferences)); } catch { /* Browsing with storage disabled is supported. */ }
}
document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => {
  preferences.lang = button.dataset.lang;
  render();
}));
document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
  preferences.theme = preferences.theme === 'light' ? 'dark' : 'light';
  render();
});
render();
