import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

const navItems = [
  { name: 'Quản lý bài viết', icon: 'article', path: '/manage' },
  { name: 'Hộp thoại', icon: 'inbox', path: '/messages' },
  { name: 'Tạo bài viết', icon: 'add_circle', path: '/create' },
  { name: 'Kết nối Fanpage', icon: 'hub', path: '/connect' },
  { name: 'App Review', icon: 'fact_check', path: '/review' },
];

export const Sidebar = () => {
  const { user } = useAuth();
  
  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-surface-muted border-r border-border-base flex flex-col gap-space-2 p-space-3 z-50">
      <div className="mb-space-5 px-space-2 flex flex-col justify-center">
        <div className="flex items-center gap-3">
          <img src="/image.png" alt="ezitalent logo" className="h-8 w-8 rounded-md object-contain" />
          <h1 className="font-display-lg text-display-lg font-bold text-on-surface">ezitalent</h1>
        </div>
      </div>

      <nav className="flex flex-col gap-space-1 overflow-y-auto flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center gap-space-3 p-space-2 rounded-lg transition-colors duration-200 cursor-pointer',
                isActive
                  ? 'text-text-accent font-bold bg-state-hover'
                  : 'text-secondary font-medium hover:bg-state-hover hover:text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="active-nav-indicator"></div>}
                <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
                <span className="font-body-md text-body-md">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-space-4 border-t border-border-base shrink-0">
        <div className="flex items-center gap-space-2 px-space-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex items-center justify-center font-bold text-sm text-primary">
            {(user?.name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body-md text-body-md font-bold truncate">{user?.name ?? 'Admin User'}</p>
            <p className="font-label-xs text-label-xs text-text-secondary truncate">{user?.username ?? 'admin@ezitalent.tech'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
