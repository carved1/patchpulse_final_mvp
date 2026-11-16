import { useCallback, useMemo, useState } from 'react';
import { findDemoUser } from '../utils/demoUsers';
import { readStorage, writeStorage } from '../utils/storage';
import { AUTH_STORAGE_KEY, AuthContext } from './AuthContext';

function createToken() {
  return `demo-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStorage(AUTH_STORAGE_KEY, null));

  const login = useCallback(async (email, password) => {
    const user = findDemoUser(email, password);
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    const nextSession = { user, token: createToken() };
    writeStorage(AUTH_STORAGE_KEY, nextSession);
    setSession(nextSession);
    return user;
  }, []);

  const logout = useCallback(() => {
    writeStorage(AUTH_STORAGE_KEY, null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      isAdmin: session?.user?.role === 'admin',
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
