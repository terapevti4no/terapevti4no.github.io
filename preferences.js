// Read before styles load to avoid a flash of the wrong theme.
(() => {
  const validTheme = value => value === 'light' || value === 'dark';
  const validLang = value => value === 'ru' || value === 'en';
  const read = key => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch { return {}; }
  };
  const saved = read('terapevti4no:v1');
  // Both Pages sites share an origin. Reuse existing EMDR preferences on
  // the first visit, without modifying its settings or storage record.
  const emdr = read('emdrdot:v1');
  const locale = navigator.languages?.[0] || navigator.language || 'en';
  const preferences = {
    theme: validTheme(saved.theme) ? saved.theme : validTheme(emdr.theme) ? emdr.theme : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark',
    lang: validLang(saved.lang) ? saved.lang : validLang(emdr.lang) ? emdr.lang : locale.toLowerCase().split('-')[0] === 'ru' ? 'ru' : 'en',
  };
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.lang = preferences.lang;
  window.hubPreferences = preferences;
})();
