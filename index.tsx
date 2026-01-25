import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// iOS Safari Zoom Prevention Logic
if (typeof document !== 'undefined') {
  // Prevent pinch-to-zoom (gesturestart)
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  });

  // Prevent double-tap to zoom (sometimes bypasses CSS)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);