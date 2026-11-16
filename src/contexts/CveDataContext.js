import { createContext } from 'react';

export const CACHE_TTL_MS = 5 * 60 * 1000;

export const CveDataContext = createContext(null);

export function feedKey({ days, keyword = '' }) {
  return `${days}:${keyword.trim().toLowerCase()}`;
}
