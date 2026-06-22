import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { facebookApi } from '../../../shared/api/facebookApi';
import { usePages } from '../../pages/PageContext';
import { useToast } from '../../../shared/context/ToastContext';

export const CreatePost = () => {
  const { selectedPage, selectedPageId } = usePages();
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [imageUrlsText, setImageUrlsText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const imageUrls = useMemo(
    () =>
      imageUrlsText
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean),
    [imageUrlsText],
  );

  const canPublish = Boolean(selectedPageId && (content.trim() || imageUrls.length > 0));

  const handlePublish = async () => {
    if (!selectedPageId) {
      addToast('Chọn Fanpage trước khi đăng bài.', 'error');
      return;
    }
    setIsPublishing(true);
    try {
      const post = await facebookApi.publishPost(selectedPageId, content.trim(), imageUrls);
      addToast(`Đăng bài thành công. Facebook post id: ${post.fbPostId ?? post.id}`, 'success');
      setContent('');
      setImageUrlsText('');
    } catch (publishError) {
      addToast(publishError instanceof Error ? publishError.message : 'Đăng bài thất bại', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-gutter max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-12 gap-gutter items-start">
        
        {/* Left Column: Composer */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-space-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="font-display-xl text-display-xl text-text-primary">Tạo bài viết mới</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {selectedPage ? `Đăng lên ${selectedPage.pageName}` : 'Chưa chọn Fanpage'}
              </p>
            </div>

          </div>

          {!selectedPageId && (
            <div className="rounded-md border border-error-container bg-error-container p-3 text-sm text-on-error-container">
              Chưa có Fanpage được chọn. Vào màn Kết nối Fanpage để chọn trang trước.
            </div>
          )}

          {/* Composer Card */}
          <div className="bg-surface-muted border border-border-base rounded-xl shadow-sm overflow-hidden">
            <div className="p-space-4 border-b border-border-base bg-surface-base/50 flex items-center justify-between">
              <div className="flex gap-4">
                <button className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xl" data-icon="sentiment_satisfied">sentiment_satisfied</span>
                  <span className="text-label-xs font-semibold uppercase">Cảm xúc</span>
                </button>
                <button className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xl" data-icon="location_on">location_on</span>
                  <span className="text-label-xs font-semibold uppercase">Vị trí</span>
                </button>
                <button className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xl" data-icon="alternate_email">alternate_email</span>
                  <span className="text-label-xs font-semibold uppercase">Nhắc tên</span>
                </button>
              </div>
              <span className={clsx("text-label-xs font-medium tracking-wide", content.length > 2000 ? "text-error" : "text-text-secondary")}>
                {content.length} / 2000
              </span>
            </div>
            
            <textarea 
              className="w-full p-space-4 border-none focus:ring-0 text-body-md resize-none placeholder:text-text-secondary/50 outline-none" 
              placeholder="Bạn đang nghĩ gì?" 
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Media Upload Area */}
            <div className="border-t border-border-base p-space-4 bg-surface-container-low">
              <label className="text-sm font-medium text-text-primary mb-2 block">
                URL ảnh công khai
              </label>
              <textarea
                className="h-24 w-full rounded-md border border-border-base bg-surface-muted p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-text-accent transition-all resize-none"
                value={imageUrlsText}
                onChange={(event) => setImageUrlsText(event.target.value)}
                placeholder="Nhập URL ảnh (mỗi dòng một URL)..."
              />
            </div>
          </div>



          {/* Action Footer */}
          <div className="flex items-center justify-between mt-space-2">
            <button 
              onClick={() => { setContent(''); setImageUrlsText(''); }} 
              disabled={isPublishing}
              className="px-6 py-2.5 rounded-lg border border-transparent text-text-secondary hover:bg-state-hover font-semibold transition-all disabled:opacity-50"
            >
              Xóa nội dung
            </button>
            <div className="flex gap-space-3">
              <button className="px-6 py-2.5 rounded-lg border border-border-base text-text-primary hover:bg-surface-container-low font-semibold transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]" data-icon="event">event</span>
                Lên lịch
              </button>
              <button 
                onClick={() => void handlePublish()} 
                disabled={!canPublish || isPublishing}
                className="px-8 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPublishing ? (
                  <span className="material-symbols-outlined animate-spin" data-icon="refresh">refresh</span>
                ) : null}
                {isPublishing ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Live Preview */}
        <aside className="col-span-12 lg:col-span-5 flex flex-col gap-space-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="font-display-lg text-display-lg-mobile text-text-primary">Xem trước (Facebook)</h3>
            <span className="px-2 py-1 bg-surface-container-high text-primary rounded text-[11px] font-bold uppercase tracking-widest">Live View</span>
          </div>

          {/* Facebook Preview Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-md overflow-hidden max-w-[500px] mx-auto w-full">
            {/* Post Header */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {(selectedPage?.pageName ?? 'F').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#050505] leading-tight">{selectedPage?.pageName ?? 'Fanpage'}</h4>
                  <div className="flex items-center gap-1 text-[12px] text-[#65676B]">
                    <span>Vừa xong</span>
                    <span>·</span>
                    <span className="material-symbols-outlined text-[14px]" data-icon="public">public</span>
                  </div>
                </div>
              </div>
              <button className="text-[#65676B] hover:bg-[#F2F3F5] p-1.5 rounded-full transition-colors">
                <span className="material-symbols-outlined" data-icon="more_horiz">more_horiz</span>
              </button>
            </div>

            {/* Post Content */}
            <div className="px-3 pb-3">
              <p className={clsx("text-[14px] leading-normal whitespace-pre-wrap break-words min-h-[20px]", !content && "text-[#65676B] opacity-50")}>
                {content || 'Bạn đang nghĩ gì?'}
              </p>
            </div>

            {/* Media Placeholder */}
            <div className="relative aspect-video bg-[#F0F2F5] flex items-center justify-center overflow-hidden">
              {imageUrls[0] ? (
                <img className="h-full w-full object-cover" src={imageUrls[0]} alt="Post preview" />
              ) : (
                <>
                  <div className="flex flex-col items-center text-[#65676B] gap-2">
                    <span className="material-symbols-outlined text-4xl opacity-20" data-icon="image">image</span>
                    <p className="text-label-xs font-medium opacity-50 uppercase tracking-widest">Nội dung hình ảnh</p>
                  </div>
                  <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay">
                    <div className="w-full h-full bg-gradient-to-tr from-primary/10 to-transparent"></div>
                  </div>
                </>
              )}
            </div>

            {/* Interaction Stats */}
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-[#CED0D4] mx-3">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-[10px] text-white" data-icon="thumb_up" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#FA383E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-white" data-icon="favorite" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </div>
                </div>
                <span className="text-[13px] text-[#65676B]">0</span>
              </div>
              <div className="flex gap-2 text-[13px] text-[#65676B]">
                <span>0 bình luận</span>
                <span>0 lượt chia sẻ</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-3 py-1 flex items-center">
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[#65676B] font-semibold hover:bg-[#F2F3F5] transition-colors">
                <span className="material-symbols-outlined text-[20px]" data-icon="thumb_up">thumb_up</span>
                Thích
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[#65676B] font-semibold hover:bg-[#F2F3F5] transition-colors">
                <span className="material-symbols-outlined text-[20px]" data-icon="chat_bubble_outline">chat_bubble_outline</span>
                Bình luận
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[#65676B] font-semibold hover:bg-[#F2F3F5] transition-colors">
                <span className="material-symbols-outlined text-[20px]" data-icon="share">share</span>
                Chia sẻ
              </button>
            </div>
          </div>

          {/* Platform switching tip */}
          <div className="bg-surface-container/50 rounded-xl p-space-4 border border-border-base mt-2">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary" data-icon="info">info</span>
              <div>
                <p className="font-body-md font-semibold text-text-primary">Mẹo tối ưu</p>
                <p className="text-body-sm text-text-secondary mt-1">Sử dụng ít nhất 3 thẻ hashtag để tăng phạm vi tiếp cận tự nhiên cho bài viết của bạn trên Facebook.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
