import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AUTH_STORAGE_KEY } from '../contexts/AuthContext';
import AuthProvider from '../contexts/AuthProvider';
import CveDataProvider from '../contexts/CveDataProvider';
import { WATCHLIST_STORAGE_KEY, watchlistReducer } from '../contexts/WatchlistContext';
import WatchlistProvider from '../contexts/WatchlistProvider';
import { useAuth } from '../hooks/useAuth';
import { useCveData } from '../hooks/useCveData';
import { useWatchlist } from '../hooks/useWatchlist';
import { normalizeCve } from '../utils/cveFormatters';
import { makeRawCve } from '../test/fixtures';

const cve = normalizeCve(makeRawCve({ id: 'CVE-2026-0100' }));

describe('AuthContext', () => {
  it('logs in a valid user, persists the session, and logs out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(false);

    await act(() => result.current.login('admin@patchpulse.dev', 'patchpulse'));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user).not.toHaveProperty('password');
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)).user.email).toBe('admin@patchpulse.dev');

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('rejects invalid credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await expect(result.current.login('analyst@patchpulse.dev', 'wrong')).rejects.toThrow(/invalid/i);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('restores a saved session on mount', () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: { name: 'Avery', role: 'analyst' }, token: 't' }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.user.name).toBe('Avery');
    expect(result.current.isAdmin).toBe(false);
  });
});

describe('watchlistReducer', () => {
  it('returns new state objects instead of mutating', () => {
    const initial = [];
    const added = watchlistReducer(initial, { type: 'add', cve, addedAt: 'now' });
    expect(initial).toEqual([]);
    expect(added).toHaveLength(1);

    const updated = watchlistReducer(added, { type: 'update', cveId: cve.id, changes: { status: 'patched' } });
    expect(added[0].status).toBe('todo');
    expect(updated[0].status).toBe('patched');
    expect(updated[0]).not.toBe(added[0]);
  });

  it('ignores duplicate adds', () => {
    const state = watchlistReducer([], { type: 'add', cve, addedAt: 'now' });
    expect(watchlistReducer(state, { type: 'add', cve, addedAt: 'later' })).toBe(state);
  });
});

describe('WatchlistContext', () => {
  it('adds, updates, removes, and persists items', () => {
    const { result } = renderHook(() => useWatchlist(), { wrapper: WatchlistProvider });

    act(() => result.current.add(cve));
    expect(result.current.count).toBe(1);
    expect(result.current.isWatched(cve.id)).toBe(true);

    act(() => result.current.update(cve.id, { status: 'in-progress', assignee: 'Sam Rivera' }));
    expect(result.current.getItem(cve.id)).toMatchObject({ status: 'in-progress', assignee: 'Sam Rivera' });
    expect(JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY))[0].status).toBe('in-progress');

    act(() => result.current.remove(cve.id));
    expect(result.current.count).toBe(0);
  });
});

describe('CveDataContext', () => {
  function setup() {
    const fetchFeed = vi.fn().mockResolvedValue({ cves: [cve], totalResults: 1 });
    const fetchOne = vi.fn().mockResolvedValue(cve);
    const wrapper = ({ children }) => (
      <CveDataProvider fetchFeed={fetchFeed} fetchOne={fetchOne}>{children}</CveDataProvider>
    );
    const { result } = renderHook(() => useCveData(), { wrapper });
    return { result, fetchFeed, fetchOne };
  }

  it('caches feeds so repeat loads do not hit the API again', async () => {
    const { result, fetchFeed } = setup();

    await act(() => result.current.loadFeed({ days: 3 }));
    await act(() => result.current.loadFeed({ days: 3 }));

    expect(fetchFeed).toHaveBeenCalledTimes(1);
    expect(result.current.getFeed({ days: 3 }).cves[0].id).toBe(cve.id);
  });

  it('deduplicates concurrent requests', async () => {
    const { result, fetchFeed } = setup();
    await act(() => Promise.all([result.current.loadFeed({ days: 1 }), result.current.loadFeed({ days: 1 })]));
    expect(fetchFeed).toHaveBeenCalledTimes(1);
  });

  it('serves single CVEs from the feed cache before fetching by id', async () => {
    const { result, fetchOne } = setup();
    await act(() => result.current.loadFeed({ days: 3 }));
    await act(() => result.current.loadCve(cve.id));
    expect(fetchOne).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.getCve(cve.id.toLowerCase())).not.toBeNull());
  });
});
