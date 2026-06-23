import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { facebookApi } from '../../../shared/api/facebookApi';
import type { BasePagination, FacebookPagePost } from '../../../shared/api/types';
import { formatDateTime } from '../../../shared/utils/date';
import { usePages } from '../../pages/PageContext';
import { useToast } from '../../../shared/context/ToastContext';

export const ManagePosts = () => {
  const { selectedPage, selectedPageId } = usePages();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<FacebookPagePost[]>([]);
  const [pagination, setPagination] = useState<BasePagination<FacebookPagePost> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!selectedPageId) {
      setPosts([]);
      setPagination(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await facebookApi.listPosts(selectedPageId, page, 20);
      setPosts(response.content || []);
      setPagination(response);
    } catch (loadError) {
      addToast(loadError instanceof Error ? loadError.message : 'Không tải được lịch sử bài viết', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedPageId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadPosts(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPosts]);

  const stats = useMemo(() => {
    const published = posts.filter((post) => post.status === 'PUBLISHED').length;
    const failed = posts.filter((post) => post.status === 'FAILED').length;
    return { published, failed, total: pagination?.totalElements ?? posts.length };
  }, [pagination?.totalElements, posts]);

  return (
    <div className="flex gap-gutter w-full flex-col xl:flex-row">
      {/* Left Side: Post Feed */}
      <div className="flex-1 space-y-space-4">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-space-2">
          <div>
            <h1 className="font-display-lg text-display-lg font-bold text-text-primary">
              Quản lý Bài viết
            </h1>
            <p className="text-body-sm text-text-secondary mt-1">
              {selectedPage ? `Fanpage: ${selectedPage.pageName}` : 'Chưa chọn Fanpage'}
            </p>
          </div>
          <div className="flex items-center gap-space-2">
            <button 
              onClick={() => void loadPosts()} 
              disabled={isLoading || !selectedPageId}
              className="flex items-center gap-2 px-space-3 py-space-2 rounded-lg border border-border-base text-text-secondary hover:bg-state-hover transition-colors text-body-sm font-semibold disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`} data-icon="refresh">refresh</span>
              Tải lại
            </button>
            <Link to="/create">
              <button className="flex items-center gap-2 px-space-4 py-space-2 rounded-lg bg-primary text-white hover:bg-on-primary-fixed-variant transition-colors text-body-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
                Tạo bài viết
              </button>
            </Link>
          </div>
        </div>

        {!selectedPageId && (
          <div className="rounded-xl border border-dashed border-border-base bg-surface-muted p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-text-secondary mb-space-3 opacity-50" data-icon="storefront">storefront</span>
            <p className="text-body-md font-medium text-text-primary">Chưa có Fanpage được chọn</p>
            <p className="mt-2 text-body-sm text-text-secondary">Kết nối hoặc chọn Fanpage để xem lịch sử bài viết.</p>
            <Link to="/connect">
              <button className="mt-space-4 px-space-4 py-space-2 rounded-lg bg-primary text-white font-semibold text-body-sm hover:bg-on-primary-fixed-variant transition-colors">
                Đi tới Kết nối Fanpage
              </button>
            </Link>
          </div>
        )}



        {selectedPageId && posts.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-border-base bg-surface-muted p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-text-secondary mb-space-3 opacity-50" data-icon="post_add">post_add</span>
            <p className="text-body-md font-medium text-text-primary">Chưa có bài viết nào trong hệ thống</p>
            <p className="mt-2 text-body-sm text-text-secondary">Bài đăng qua màn Tạo bài viết sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="space-y-space-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-surface-muted border border-border-base rounded-xl overflow-hidden shadow-sm">
                <div className="p-space-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-space-3">
                    <div className="flex items-center gap-space-3">
                      <div className="w-10 h-10 rounded-lg border border-border-base flex items-center justify-center bg-surface-container font-bold text-primary">
                        {(selectedPage?.pageName ?? 'FB').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary text-body-md">{selectedPage?.pageName ?? 'Fanpage'}</h3>
                        <p className="text-text-secondary text-body-sm flex items-center gap-1">
                          {formatDateTime(post.createdAt)} • <span className="material-symbols-outlined text-[14px]">public</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          post.status === 'PUBLISHED'
                            ? 'px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-green-50 text-green-700'
                            : post.status === 'FAILED'
                              ? 'px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-error-container text-on-error-container'
                              : 'px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-container text-text-secondary'
                        }
                      >
                        {post.status}
                      </span>
                      <button className="text-text-secondary hover:bg-state-hover p-1.5 rounded-full transition-colors">
                        <span className="material-symbols-outlined" data-icon="more_horiz">more_horiz</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-space-3 mb-space-4">
                    <p className="text-body-md text-text-primary whitespace-pre-wrap break-words">
                      {post.content || '(Bài viết chỉ có ảnh)'}
                    </p>
                    
                    {(post.media || []).length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2 rounded-lg overflow-hidden border border-border-base">
                        {(post.media || []).map((media) => (
                          <a
                            key={media.id || media.mediaUrl}
                            href={media.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden relative group"
                          >
                            <img className="w-full h-48 object-cover transition-transform group-hover:scale-105" src={media.mediaUrl} alt="Post media" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Engagement Bar Mock */}
                  <div className="flex items-center justify-between border-t border-border-base pt-space-3 mt-space-3">
                    <div className="flex gap-space-4">
                      <button className="flex items-center gap-space-1 text-text-secondary hover:text-text-accent transition-colors">
                        <span className="material-symbols-outlined text-[20px]" data-icon="thumb_up">thumb_up</span>
                        <span className="text-body-md font-medium">Thích</span>
                      </button>
                      <button className="flex items-center gap-space-1 text-text-secondary hover:text-text-accent transition-colors">
                        <span className="material-symbols-outlined text-[20px]" data-icon="chat_bubble">chat_bubble</span>
                        <span className="text-body-md font-medium">Bình luận</span>
                      </button>
                      <button className="flex items-center gap-space-1 text-text-secondary hover:text-text-accent transition-colors">
                        <span className="material-symbols-outlined text-[20px]" data-icon="share">share</span>
                        <span className="text-body-md font-medium">Chia sẻ</span>
                      </button>
                    </div>
                    <div className="text-label-xs text-text-secondary text-right">
                      ID: {post.id.slice(-6)} <br/>
                      FB ID: {post.fbPostId ? post.fbPostId.slice(-6) : '--'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between rounded-xl border border-border-base bg-surface-muted p-4 shadow-sm mt-space-4">
            <span className="text-body-sm text-text-secondary">
              Trang {(pagination.number || 0) + 1} / {pagination.totalPages} · Tổng {pagination.totalElements} bài viết
            </span>
            <div className="flex gap-2">
              <button 
                className="px-space-3 py-1.5 border border-border-base rounded-lg text-body-sm font-semibold hover:bg-state-hover transition-colors disabled:opacity-50"
                disabled={page <= 1} 
                onClick={() => setPage((current) => current - 1)}
              >
                Trước
              </button>
              <button 
                className="px-space-3 py-1.5 border border-border-base rounded-lg text-body-sm font-semibold hover:bg-state-hover transition-colors disabled:opacity-50"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: Stats & Management */}
      <aside className="w-full xl:w-80 space-y-space-4 shrink-0">
        
        {/* Stats Monthly Card */}
        <div className="bg-surface-muted border border-border-base rounded-xl p-space-4 shadow-sm">
          <h2 className="text-body-md font-bold text-text-primary mb-space-3 uppercase tracking-wider">Thống kê nội bộ</h2>
          <div className="grid grid-cols-2 gap-space-3">
            <div className="p-space-3 bg-surface-container-low rounded-lg border border-border-base">
              <p className="text-label-xs text-text-secondary mb-1">Tổng bài viết</p>
              <p className="text-display-lg text-primary">{stats.total}</p>
            </div>
            <div className="p-space-3 bg-surface-container-low rounded-lg border border-border-base">
              <p className="text-label-xs text-text-secondary mb-1">Thành công</p>
              <p className="text-display-lg text-green-600">{stats.published}</p>
            </div>
          </div>
          <div className="mt-space-4 pt-space-4 border-t border-border-base space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-text-secondary">Lỗi (Failed)</span>
              <span className="text-body-sm font-semibold text-error">{stats.failed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-text-secondary">Tỷ lệ thành công</span>
              <span className="text-body-sm font-semibold text-text-primary">
                {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Scope Backend */}
        <div className="bg-surface-muted border border-border-base rounded-xl p-space-4 shadow-sm">
          <div className="flex items-center gap-space-2 text-body-md font-bold text-text-primary uppercase tracking-wider mb-space-3">
            <span className="material-symbols-outlined text-[20px]" data-icon="info">info</span>
            Scope hệ thống
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            Phase App Review hiện hỗ trợ đăng bài text và ảnh bằng URL. Lịch đăng, video, reels, comment sync và insight thực tế chưa được expose trong version demo API.
          </p>
        </div>

        {/* Quick Actions CTA */}
        <div className="bg-primary-container p-space-4 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-white font-bold text-body-md mb-1">Tạo bài viết mới?</h3>
            <p className="text-on-primary-container text-body-sm mb-space-3">Đăng text hoặc ảnh trực tiếp lên Fanpage.</p>
            <Link to="/create">
              <button className="bg-white text-primary px-space-4 py-space-2 rounded-lg font-bold text-body-sm flex items-center gap-2 hover:shadow-md transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]" data-icon="edit_square">edit_square</span>
                Tạo ngay
              </button>
            </Link>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" data-icon="post_add">post_add</span>
        </div>

      </aside>
    </div>
  );
};
