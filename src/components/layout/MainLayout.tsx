import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children, noPadding = false }: { children: React.ReactNode, noPadding?: boolean }) => {
  return (
    <div className="bg-surface-base text-text-primary antialiased min-h-screen flex flex-col">
      <Sidebar />
      <Header />
      <main className={`ml-sidebar-width pt-header-height ${noPadding ? 'h-screen overflow-hidden' : 'min-h-[calc(100vh-45px)] pb-12'}`}>
        {noPadding ? children : (
          <div className="max-w-5xl mx-auto p-gutter space-y-space-6">
            {children}
          </div>
        )}
      </main>
      {!noPadding && (
        <footer className="ml-sidebar-width bg-surface-base border-t border-border-base py-space-2 px-gutter flex justify-between items-center mt-auto shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img src="/image.png" alt="ezitalent logo" className="h-5 w-5 rounded-md object-contain" />
              <span className="font-label-xs text-label-xs font-bold text-on-surface uppercase tracking-tight">ezitalent</span>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">© 2024 ezitalent. All rights reserved.</span>
          </div>
          <div className="flex gap-space-4">
              <a href="#" className="font-body-sm text-body-sm text-secondary hover:text-primary transition-all">Privacy Policy</a>
              <a href="#" className="font-body-sm text-body-sm text-secondary hover:text-primary transition-all">Terms of Service</a>
          </div>
        </footer>
      )}
    </div>
  );
};
