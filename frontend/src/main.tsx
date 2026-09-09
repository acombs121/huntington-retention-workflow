import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Bounded vite:preloadError retry handler per Cloud Run Demo Specification
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const hasReloaded = sessionStorage.getItem('vite-preload-retry');
  if (!hasReloaded) {
    sessionStorage.setItem('vite-preload-retry', 'true');
    window.location.reload();
  } else {
    console.error('Failed to load updated application chunk:', event);
  }
});

// Cleanup timer after window load
window.addEventListener('load', () => {
  setTimeout(() => {
    sessionStorage.removeItem('vite-preload-retry');
  }, 5000);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
