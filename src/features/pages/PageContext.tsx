/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { facebookApi } from '../../shared/api/facebookApi';
import type { FacebookPage } from '../../shared/api/types';

const SELECTED_PAGE_KEY = 'fb_selected_page_id';

type PageContextValue = {
  pages: FacebookPage[];
  selectedPage: FacebookPage | null;
  selectedPageId: string | null;
  isLoadingPages: boolean;
  pagesError: string | null;
  refreshPages: () => Promise<void>;
  selectPage: (fbPageId: string) => void;
};

const PageContext = createContext<PageContextValue | null>(null);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(() => localStorage.getItem(SELECTED_PAGE_KEY));
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);

  const selectPage = useCallback((fbPageId: string) => {
    localStorage.setItem(SELECTED_PAGE_KEY, fbPageId);
    setSelectedPageId(fbPageId);
  }, []);

  const refreshPages = useCallback(async () => {
    if (!isAuthenticated) {
      setPages([]);
      setSelectedPageId(null);
      localStorage.removeItem(SELECTED_PAGE_KEY);
      return;
    }

    setIsLoadingPages(true);
    setPagesError(null);
    try {
      const nextPages = await facebookApi.listPages();
      setPages(nextPages);
      const currentStillExists = nextPages.some((page) => page.fbPageId === selectedPageId);
      if (nextPages.length > 0 && !currentStillExists) {
        selectPage(nextPages[0].fbPageId);
      }
      if (nextPages.length === 0) {
        localStorage.removeItem(SELECTED_PAGE_KEY);
        setSelectedPageId(null);
      }
    } catch (error) {
      setPagesError(error instanceof Error ? error.message : 'Không tải được danh sách Fanpage');
    } finally {
      setIsLoadingPages(false);
    }
  }, [isAuthenticated, selectPage, selectedPageId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshPages(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshPages]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.fbPageId === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  const value = useMemo<PageContextValue>(
    () => ({
      pages,
      selectedPage,
      selectedPageId,
      isLoadingPages,
      pagesError,
      refreshPages,
      selectPage,
    }),
    [isLoadingPages, pages, pagesError, refreshPages, selectPage, selectedPage, selectedPageId],
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePages() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePages must be used within PageProvider');
  }
  return context;
}
