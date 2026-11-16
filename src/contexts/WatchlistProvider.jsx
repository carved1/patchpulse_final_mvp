import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import { WATCHLIST_STORAGE_KEY, WatchlistContext, watchlistReducer } from './WatchlistContext';

export default function WatchlistProvider({ children }) {
  const [items, dispatch] = useReducer(watchlistReducer, undefined, () =>
    readStorage(WATCHLIST_STORAGE_KEY, []),
  );

  useEffect(() => {
    writeStorage(WATCHLIST_STORAGE_KEY, items);
  }, [items]);

  const add = useCallback((cve) => {
    dispatch({ type: 'add', cve, addedAt: new Date().toISOString() });
  }, []);

  const remove = useCallback((cveId) => dispatch({ type: 'remove', cveId }), []);

  const update = useCallback(
    (cveId, changes) => dispatch({ type: 'update', cveId, changes }),
    [],
  );

  const isWatched = useCallback((cveId) => items.some((item) => item.cveId === cveId), [items]);

  const getItem = useCallback(
    (cveId) => items.find((item) => item.cveId === cveId) ?? null,
    [items],
  );

  const value = useMemo(
    () => ({ items, count: items.length, add, remove, update, isWatched, getItem }),
    [items, add, remove, update, isWatched, getItem],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}
