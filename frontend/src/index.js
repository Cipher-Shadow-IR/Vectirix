import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const isResizeObserverError = (source) => {
  const msg = source?.message || source?.error?.message || source?.reason?.message || '';
  return msg.includes('ResizeObserver loop');
};

const handler = (e) => {
  if (isResizeObserverError(e)) {
    e.stopImmediatePropagation();
  }
};

window.addEventListener('error', handler, { capture: true });
window.addEventListener('unhandledrejection', handler, { capture: true });

const origOnerror = window.onerror;
window.onerror = (msg, source, lineno, colno, error) => {
  if ((msg || '')?.includes?.('ResizeObserver loop') || error?.message?.includes?.('ResizeObserver loop')) {
    return true;
  }
  return origOnerror ? origOnerror(msg, source, lineno, colno, error) : false;
};

const origError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('ResizeObserver loop') ||
    args[0]?.toString?.().includes?.('ResizeObserver loop')
  ) {
    return;
  }
  origError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
