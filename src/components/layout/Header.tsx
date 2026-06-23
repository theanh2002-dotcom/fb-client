import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { usePages } from '../../features/pages/PageContext';

export const Header = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { pages, selectedPageId, selectPage, refreshPages, isLoadingPages } = usePages();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 right-0 h-header-height w-[calc(100%-theme(spacing.sidebar-width))] bg-surface-muted border-b border-border-base flex justify-between items-center px-gutter z-40">
      <div className="flex items-center gap-space-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]" data-icon="search">search</span>
          <input className="w-full h-10 pl-10 pr-4 bg-surface-base border border-border-base rounded-lg font-body-md text-body-md focus:outline-none focus:border-text-accent focus:ring-1 focus:ring-text-accent transition-all" placeholder="Tìm kiếm trang, bài viết..." type="text"/>
        </div>
      </div>
      <div className="flex items-center gap-space-4">
        
        {/* Page selector kept from original app logic */}
        <div className="hidden lg:flex items-center gap-2">
          <select
            className="h-10 max-w-[240px] rounded-lg border border-border-base bg-surface-base px-3 text-sm text-text-primary focus:outline-none focus:border-text-accent focus:ring-1 focus:ring-text-accent"
            value={selectedPageId ?? ''}
            onChange={(event) => selectPage(event.target.value)}
            disabled={pages.length === 0}
          >
            {pages.length === 0 ? (
              <option value="">Chua co Fanpage</option>
            ) : (
              pages.map((page) => (
                <option key={page.fbPageId} value={page.fbPageId}>
                  {page.pageName}
                </option>
              ))
            )}
          </select>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-state-hover text-text-secondary transition-colors disabled:opacity-50"
            disabled={isLoadingPages}
            onClick={() => void refreshPages()}
            title="Tai lai Fanpage"
          >
            <span className={`material-symbols-outlined ${isLoadingPages ? 'animate-spin' : ''}`} data-icon="refresh">refresh</span>
          </button>
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-state-hover text-text-secondary transition-colors relative">
          <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-border-base mx-space-1"></div>
        
        <div className="relative" ref={menuRef}>
          <div className="flex items-center gap-space-2 cursor-pointer group" onClick={() => setIsMenuOpen(!isMenuOpen)} title="Tài khoản">
            <span className="font-body-md text-body-md font-medium group-hover:text-text-accent transition-colors">{user?.name ?? 'Admin'}</span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border-base flex items-center justify-center bg-primary-container text-on-primary-container text-sm font-bold">
              {(user?.name ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-base rounded-xl shadow-lg shadow-black/5 border border-border-base py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-border-base mb-2">
                <p className="text-sm font-bold text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-secondary truncate mt-0.5">{user?.username}</p>
              </div>
              <button 
                onClick={() => void handleLogout()}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors flex items-center gap-2 font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
