import { useEffect } from 'react';
import { Footer, InfoNote, PageIntro, PageLayout, usePreferences } from '@terapevti4no/ui';
import { messages } from './i18n';
import { MoreToolsNote, ToolCatalog } from './ToolCatalog';
import './style.css';

export default function HomePage() {
  const { lang, setLang, theme, setTheme } = usePreferences();
  const t = messages[lang];
  useEffect(() => {
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.pageDescription);
  }, [t]);
  return <PageLayout lang={lang} theme={theme} onLanguageChange={setLang} onThemeChange={setTheme} homeHref="/" footer={<Footer brand={t.footerBrand}>{t.footer}</Footer>}>
    <PageIntro eyebrow={t.eyebrow} title={t.title} description={t.intro}/>
    <ToolCatalog lang={lang}/>
    <MoreToolsNote>{t.more}</MoreToolsNote>
    <InfoNote>{t.note}</InfoNote>
  </PageLayout>;
}
