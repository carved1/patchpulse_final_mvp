import { createContext } from 'react';

export const WATCHLIST_STORAGE_KEY = 'patchpulse.watchlist';

export const WatchlistContext = createContext(null);

export function watchlistReducer(state, action) {
  switch (action.type) {
    case 'add': {
      if (state.some((item) => item.cveId === action.cve.id)) return state;
      const { id, severity, score, description, published } = action.cve;
      return [
        ...state,
        {
          cveId: id,
          snapshot: { severity, score, description, published },
          status: 'todo',
          assignee: '',
          dueDate: '',
          addedAt: action.addedAt,
        },
      ];
    }
    case 'remove':
      return state.filter((item) => item.cveId !== action.cveId);
    case 'update':
      return state.map((item) =>
        item.cveId === action.cveId ? { ...item, ...action.changes } : item,
      );
    default:
      return state;
  }
}
