import { useState } from 'react';
import clsx from 'clsx';
import { facebookApi } from '../../../shared/api/facebookApi';
import { usePages } from '../../pages/PageContext';
import { useToast } from '../../../shared/context/ToastContext';

export const ConnectFanpage = () => {
  const { pages, selectedPageId, selectPage, refreshPages, isLoadingPages, pagesError } = usePages();
  const { addToast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await facebookApi.getOAuthUrl();
      window.location.href = response.url;
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Không lấy được Facebook OAuth URL', 'error');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (pageId: string) => {
    try {
      await facebookApi.disconnectPage(pageId, 'Disconnected from frontend');
      await refreshPages();
      addToast('Đã ngắt kết nối Fanpage.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Không thể ngắt kết nối Fanpage', 'error');
    }
  };

  return (
    <div className="space-y-space-6">
      {/* Hero Onboarding Section */}
      <section className="flex justify-center mt-space-4">
        <div className="bg-surface-muted border border-border-base rounded-xl p-space-6 md:p-12 text-center max-w-3xl w-full shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-container text-primary mb-space-4">
            <span className="material-symbols-outlined text-[32px]" data-icon="add_link">add_link</span>
          </div>
          <h2 className="font-display-2xl text-display-2xl mb-space-3 text-on-surface">Chào mừng bạn đến với ezitalent!</h2>
          <p className="font-body-md text-body-md text-text-secondary mb-space-6 max-w-lg mx-auto">
            Để bắt đầu, hãy kết nối Trang Facebook của bạn để quản lý tin nhắn và bài viết một cách hiệu quả.
          </p>
          <button 
            onClick={() => void handleOAuthConnect()} 
            disabled={isConnecting}
            className={clsx(
              "inline-flex items-center gap-space-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-space-6 py-3 rounded-lg font-bold transition-all transform active:scale-95 shadow-md",
              isConnecting && "opacity-80 cursor-wait"
            )}
          >
            {isConnecting ? (
              <span className="material-symbols-outlined animate-spin" data-icon="refresh">refresh</span>
            ) : (
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
            )}
            {isConnecting ? 'Đang kết nối...' : 'Kết nối với Facebook'}
          </button>
        </div>
      </section>



      {pagesError && (
        <div className="flex items-start gap-2 rounded-md border border-error-container bg-error-container p-3 text-sm text-on-error-container">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{pagesError}</span>
        </div>
      )}

      {/* Connected Pages Section */}
      <section className="space-y-space-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display-lg text-display-lg text-on-surface">Các trang đã kết nối</h3>
          <div className="text-text-secondary font-body-sm text-body-sm flex items-center gap-space-1">
            <span className="material-symbols-outlined text-[18px]" data-icon="info">info</span>
            {isLoadingPages ? 'Đang tải...' : `Đang hiển thị ${pages.length} trang`}
          </div>
        </div>

        {pages.length === 0 && !isLoadingPages ? (
          <div className="flex flex-col items-center justify-center py-space-6 text-center border-2 border-dashed border-border-base rounded-xl opacity-60">
            <span className="material-symbols-outlined text-space-6 mb-space-2" data-icon="cloud_off">cloud_off</span>
            <p className="font-body-md text-body-md">Chưa có trang nào được kết nối.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {pages.map((page) => {
              const isSelected = selectedPageId === page.fbPageId;
              const missingPerms = page.missingPermissions || [];
              const hasMissingPermissions = missingPerms.length > 0;
              return (
                <div
                  key={page.fbPageId}
                  className={clsx(
                    'bg-surface-muted border rounded-xl p-space-4 flex flex-col gap-space-4 transition-all group',
                    isSelected ? 'border-text-accent ring-1 ring-text-accent' : 'border-border-base hover:border-text-accent'
                  )}
                >
                  <div className="flex items-center gap-space-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-border-base flex-shrink-0 flex items-center justify-center bg-surface-container font-bold text-xl text-primary">
                      {page.pageName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display-lg text-display-lg text-[18px] truncate">{page.pageName}</h4>
                      <div className="flex items-center gap-space-2 mt-space-1">
                        <span className={clsx("flex h-2 w-2 rounded-full", page.tokenStatus === 'ACTIVE' ? "bg-emerald-500" : "bg-error")}></span>
                        <span className={clsx("font-label-xs text-label-xs font-bold uppercase tracking-wider", page.tokenStatus === 'ACTIVE' ? "text-emerald-600" : "text-error")}>
                          {page.tokenStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Lỗi kết nối'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid gap-2 text-sm text-text-secondary bg-surface-base p-3 rounded-lg border border-border-base">
                    <div className="flex justify-between gap-3">
                      <span>Facebook Page ID</span>
                      <span className="font-medium text-text-primary">{page.fbPageId}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Webhook</span>
                      <span className={page.webhookSubscribed ? 'text-emerald-600' : 'text-error'}>
                        {page.webhookSubscribed ? 'Subscribed' : 'Not subscribed'}
                      </span>
                    </div>
                    {hasMissingPermissions && (
                      <div className="rounded-md bg-error-container p-2 text-xs text-on-error-container mt-1">
                        Thiếu quyền: {missingPerms.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex justify-between items-center pt-2">
                    <button 
                      onClick={() => selectPage(page.fbPageId)}
                      className={clsx(
                        "px-space-4 py-2 border rounded-lg font-bold transition-colors",
                        isSelected 
                          ? "bg-text-accent text-white border-text-accent" 
                          : "border-border-base text-primary hover:bg-state-hover"
                      )}
                    >
                      {isSelected ? 'Đang chọn' : 'Quản lý'}
                    </button>
                    <button 
                      onClick={() => void handleDisconnect(page.fbPageId)}
                      className="text-error hover:bg-error-container px-3 py-2 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Ngắt kết nối
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
