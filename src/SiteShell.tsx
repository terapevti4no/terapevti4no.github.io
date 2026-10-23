import { createContext, useContext, useLayoutEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { useLocation } from 'react-router';
import { Header, usePreferences, type ToolName } from '@terapevti4no/ui';

const ImmersiveContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);

// Exercises hide the existing header instead of unmounting it. Cleanup restores
// the shell when leaving an exercise through browser history as well as its UI.
export function useImmersiveMode(active: boolean) {
  const setImmersive = useContext(ImmersiveContext);
  if (!setImmersive) throw new Error('SiteShell is required');
  useLayoutEffect(() => {
    setImmersive(active);
    return () => setImmersive(false);
  }, [active, setImmersive]);
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const { lang, setLang, theme, setTheme } = usePreferences();
  const { pathname } = useLocation();
  const [immersive, setImmersive] = useState(false);
  const path = pathname.replace(/\/+$/, '');
  const tool: ToolName | undefined = path === '/cloudbye' ? 'cloudbye' : path === '/breaze' ? 'breaze' : path === '/emdrdot' ? 'emdrdot' : path === '/underground' ? 'underground' : undefined;

  return <ImmersiveContext.Provider value={setImmersive}>
    <div className={`app-shell${immersive ? ' is-immersive' : ''}`} data-tool={tool}>
      <Header lang={lang} theme={theme} onLanguageChange={setLang} onThemeChange={setTheme} tool={tool} toolHref={tool ? `/${tool}/` : '/'} hidden={immersive}/>
      {children}
    </div>
  </ImmersiveContext.Provider>;
}
