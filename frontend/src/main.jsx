import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "311500663954-tbtm3h9u4esi9ft6cvjsnriqc6eqf58g.apps.googleusercontent.com";

// Configure Axios - Global defaults and interceptors removed.
// Authentication tokens and base URL management are now handled centrally in src/api/axiosClient.js
// This prevents conflicts and ensures consistent behavior across the application.

/**
 * Global window.open security guard.
 * Automatically adds 'noopener,noreferrer' to any window opening call,
 * EXCEPT for Google Authentication popups which require the opener reference.
 */
const originalWindowOpen = window.open;
window.open = function (url, target, features) {
  // If no URL is provided, it might be a library-managed window (like Google Auth popup)
  // that opens an empty window first. We should NOT enforce noopener/noreferrer then.
  const isTargetedGoogleAuth = target && typeof target === 'string' && (target.toLowerCase().includes('google') || target.toLowerCase().includes('gsi'));
  const isGoogleUrl = url && (url.toString().includes('accounts.google.com') || url.toString().includes('google.com/auth'));

  const isGoogleAuth = isGoogleUrl || isTargetedGoogleAuth;

  if (url && !isGoogleAuth) {
    if (!features) {
      features = "noopener,noreferrer";
    } else {
      if (!features.toLowerCase().includes("noopener")) features += ",noopener";
      if (!features.toLowerCase().includes("noreferrer")) features += ",noreferrer";
    }
  }

  return originalWindowOpen.call(window, url, target, features);
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
