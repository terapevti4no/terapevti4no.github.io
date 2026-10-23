import React from 'react';
import { createRoot } from 'react-dom/client';
import { faviconUrl, PreferencesProvider } from '@terapevti4no/ui';
import { BrowserRouter } from 'react-router';
import AppRouter from './Router';
import '@terapevti4no/ui/styles.css';
import './shell.css';
document.querySelector('link[rel="icon"]')?.setAttribute('href', faviconUrl);
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><PreferencesProvider><AppRouter/></PreferencesProvider></BrowserRouter></React.StrictMode>);
