import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { TimezoneProvider } from './lib/TimezoneContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TimezoneProvider>
      <App />
    </TimezoneProvider>
  </StrictMode>,
);
