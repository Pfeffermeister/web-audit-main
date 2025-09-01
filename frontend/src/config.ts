// Backend-API Base URL
const FALLBACK_API = 'https://api.stradinger.me';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  FALLBACK_API;

// API Endpoints für Backend-Proxy (Das Backend leitet weiter an workflow.stradinger.me)
export const API_ENDPOINTS = {
  wcag: '/api/wcag-scan',
  seo: '/api/seo-audit',
  statement: '/api/statement-generation'
} as const;

// Timeout für API-Calls (in ms)
export const API_TIMEOUT = 300000; // 5 Minuten
