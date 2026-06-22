/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_TOKEN_KEY } from '../../shared/api/httpClient';
import { facebookApi } from '../../shared/api/facebookApi';
import type { AuthorizedUser } from '../../shared/api/types';

type AuthContextValue = {
  token: string | null;
  user: AuthorizedUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitialToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialToken = getInitialToken();
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(initialToken));

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsBootstrapping(false);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    facebookApi
      .me()
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearSession();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession, token]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await facebookApi.demoLogin(email, password);
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    setIsBootstrapping(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(AUTH_TOKEN_KEY)) {
        await facebookApi.logout();
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      logout,
    }),
    [isBootstrapping, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
