import React from 'react';
import { createRoot } from 'react-dom/client';
import { faviconUrl } from '@terapevti4no/ui';
import App from './App';
import '@terapevti4no/ui/styles.css';
import './style.css';
document.querySelector('link[rel="icon"]')?.setAttribute('href', faviconUrl);
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
