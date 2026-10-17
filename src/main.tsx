import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Work Zone OS Service Worker for offline field caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Work Zone OS] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Work Zone OS] Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
