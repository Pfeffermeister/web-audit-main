// Backend-API Base URL
export const API_BASE_URL = import.meta.env.PROD
  ? 'http://localhost:3002'  // Backend läuft auf Port 3002
  : 'http://localhost:3002'; // Development Port

// API Endpoints für Backend-Proxy (Das Backend leitet weiter an workflow.stradinger.me)
export const API_ENDPOINTS = {
  wcag: '/api/wcag-scan',
  seo: '/api/seo-audit',
  statement: '/api/statement-generation'
} as const;

// Timeout für API-Calls (in ms)
export const API_TIMEOUT = 300000; // 5 Minuten
