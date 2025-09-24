import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './hooks/useTheme';

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        // The development environment can cause a cross-origin registration error.
        // We catch this specific error to prevent it from breaking the app,
        // while allowing other registration errors to be logged.
        const isCrossOriginError = error instanceof Error && error.message.includes("does not match the current origin");
        
        if (isCrossOriginError) {
            console.warn(`Service Worker registration failed due to a cross-origin restriction. This is expected in some development environments. Offline features will be disabled.`);
        } else {
            console.error('Service Worker registration failed:', error);
        }
      });
  });
}
// ------------------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);