export function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage can be unavailable (private mode, quota); the app still works in-memory.
  }
}
