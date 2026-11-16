import { useCallback, useMemo, useRef, useState } from 'react';
import { fetchCveById, fetchRecentCves } from '../utils/nvdApi';
import { CACHE_TTL_MS, CveDataContext, feedKey } from './CveDataContext';

const EMPTY_CACHE = { feeds: {}, byId: {} };

export default function CveDataProvider({ children, fetchFeed = fetchRecentCves, fetchOne = fetchCveById }) {
  // The ref is the synchronous source of truth for cache checks; state drives re-renders.
  const cacheRef = useRef(EMPTY_CACHE);
  const inFlightRef = useRef({});
  const [cache, setCache] = useState(EMPTY_CACHE);

  const commit = useCallback((updater) => {
    cacheRef.current = updater(cacheRef.current);
    setCache(cacheRef.current);
  }, []);

  const dedupe = useCallback((key, request) => {
    if (!inFlightRef.current[key]) {
      inFlightRef.current[key] = request().finally(() => {
        delete inFlightRef.current[key];
      });
    }
    return inFlightRef.current[key];
  }, []);

  const loadFeed = useCallback(
    ({ days, keyword = '' }, { force = false } = {}) => {
      const key = feedKey({ days, keyword });
      const cached = cacheRef.current.feeds[key];
      if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return Promise.resolve(cached);
      }

      return dedupe(`feed:${key}`, async () => {
        const { cves, totalResults } = await fetchFeed({ days, keyword });
        const entry = { ids: cves.map((cve) => cve.id), totalResults, fetchedAt: Date.now() };
        commit((prev) => ({
          feeds: { ...prev.feeds, [key]: entry },
          byId: { ...prev.byId, ...Object.fromEntries(cves.map((cve) => [cve.id, cve])) },
        }));
        return entry;
      });
    },
    [commit, dedupe, fetchFeed],
  );

  const loadCve = useCallback(
    (cveId) => {
      const id = cveId.toUpperCase();
      const cached = cacheRef.current.byId[id];
      if (cached) return Promise.resolve(cached);

      return dedupe(`cve:${id}`, async () => {
        const cve = await fetchOne(id);
        commit((prev) => ({ ...prev, byId: { ...prev.byId, [cve.id]: cve } }));
        return cve;
      });
    },
    [commit, dedupe, fetchOne],
  );

  const getFeed = useCallback(
    (params) => {
      const entry = cache.feeds[feedKey(params)];
      if (!entry) return null;
      return { ...entry, cves: entry.ids.map((id) => cache.byId[id]).filter(Boolean) };
    },
    [cache],
  );

  const getCve = useCallback((cveId) => cache.byId[cveId?.toUpperCase()] ?? null, [cache]);

  const value = useMemo(
    () => ({ loadFeed, loadCve, getFeed, getCve }),
    [loadFeed, loadCve, getFeed, getCve],
  );

  return <CveDataContext.Provider value={value}>{children}</CveDataContext.Provider>;
}
