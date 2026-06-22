import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { usePages } from '../../features/pages/PageContext';

export const Header = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { pages, selectedPageId, selectPage, refreshPages, isLoadingPages } = usePages();

  const handleLogout = async () => {
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
        
        <div className="flex items-center gap-space-2 cursor-pointer group" onClick={() => void handleLogout()} title="Dang xuat">
          <span className="font-body-md text-body-md font-medium group-hover:text-text-accent transition-colors">{user?.name ?? 'Hoàng Văn Bảo'}</span>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border-base flex items-center justify-center bg-primary-container text-on-primary-container text-sm font-bold">
            {(user?.name ?? 'H').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
