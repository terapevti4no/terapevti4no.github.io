import { Component, lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router';
import { usePreferences } from '@terapevti4no/ui';

// Keep these imports dynamic: neither practice code nor CSS belongs in the shell.
const Home = lazy(() => import('./App'));
const Breaze = lazy(() => import('./practices/breaze/App'));
const EmdrDot = lazy(() => import('./practices/emdrdot/App'));
const Cloudbye = lazy(() => import('./practices/cloudbye/App'));
const Underground = lazy(() => import('./practices/underground/App'));

class PageErrorBoundary extends Component<{ children: ReactNode; lang: 'ru' | 'en' }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    const ru = this.props.lang === 'ru';
    return <main className="route-message" role="alert">
      <h1>{ru ? 'Не удалось открыть страницу' : 'Could not open this page'}</h1>
      <p>{ru ? 'Проверьте подключение и попробуйте ещё раз.' : 'Check your connection and try again.'}</p>
      <button type="button" onClick={() => window.location.reload()}>{ru ? 'Попробовать ещё раз' : 'Try again'}</button>
      <Link to="/">{ru ? 'Все инструменты' : 'All tools'}</Link>
    </main>;
  }
}

function Page({ name, children }: { name: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = root.current?.querySelector<HTMLHeadingElement>('h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }, []);
  return <div className={`route-page page-${name}`} ref={root}>{children}</div>;
}

function NotFound() {
  const { lang } = usePreferences();
  const title = lang === 'ru' ? 'Страница не найдена' : 'Page not found';
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', title);
  }, [title]);
  return <main className="route-message"><h1>{title}</h1><Link to="/">{lang === 'ru' ? 'Все инструменты' : 'All tools'}</Link></main>;
}

export default function AppRouter() {
  const { lang } = usePreferences();
  const { pathname } = useLocation();
  return <PageErrorBoundary key={pathname} lang={lang}>
    <Suspense fallback={<main className="route-message" role="status">{lang === 'ru' ? 'Загрузка…' : 'Loading…'}</main>}>
      <Routes>
        <Route path="/" element={<Page name="home"><Home/></Page>}/>
        <Route path="/breaze" element={<Page name="breaze"><Breaze/></Page>}/>
        <Route path="/emdrdot" element={<Page name="emdrdot"><EmdrDot/></Page>}/>
        <Route path="/cloudbye" element={<Page name="cloudbye"><Cloudbye/></Page>}/>
        <Route path="/underground" element={<Page name="underground"><Underground/></Page>}/>
        <Route path="*" element={<Page name="not-found"><NotFound/></Page>}/>
      </Routes>
    </Suspense>
  </PageErrorBoundary>;
}
