import { useCallback, useEffect, useState } from 'react';
import { feedKey } from '../contexts/CveDataContext';
import { useCveData } from './useCveData';

export function useCveFeed({ days, keyword = '' }) {
  const { loadFeed, getFeed } = useCveData();
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState({ key: null, error: null });
  const requestKey = `${feedKey({ days, keyword })}#${attempt}`;

  useEffect(() => {
    let ignore = false;

    loadFeed({ days, keyword }, { force: attempt > 0 })
      .then(() => {
        if (!ignore) setSettled({ key: requestKey, error: null });
      })
      .catch((err) => {
        if (!ignore) setSettled({ key: requestKey, error: err.message });
      });

    return () => {
      ignore = true;
    };
  }, [days, keyword, attempt, requestKey, loadFeed]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const feed = getFeed({ days, keyword });
  const isPending = settled.key !== requestKey;

  return {
    cves: feed?.cves ?? [],
    totalResults: feed?.totalResults ?? 0,
    fetchedAt: feed?.fetchedAt ?? null,
    // Show cached data immediately instead of a spinner when revisiting a route.
    isLoading: isPending && !feed,
    isRefreshing: isPending && Boolean(feed),
    error: isPending ? null : settled.error,
    retry,
  };
}
