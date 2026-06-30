import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { facebookApi } from '../../../shared/api/facebookApi';
import type { FacebookConversation, FacebookMessage } from '../../../shared/api/types';
import { formatTime } from '../../../shared/utils/date';
import { usePages } from '../../pages/PageContext';
import { useToast } from '../../../shared/context/ToastContext';

export const Inbox = () => {
  const { selectedPageId } = usePages();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState<FacebookConversation[]>([]);
  const [messages, setMessages] = useState<FacebookMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [messageType] = useState<'TEXT' | 'IMAGE'>('TEXT');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const filteredConversations = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return conversations;
    }
    return conversations.filter((conversation) => {
      const displayName = conversation.senderName ?? conversation.senderPsid ?? 'Unknown';
      const psidMatch = conversation.senderPsid ? conversation.senderPsid.toLowerCase().includes(keyword) : false;
      return displayName.toLowerCase().includes(keyword) || psidMatch;
    });
  }, [conversations, search]);

  const loadConversations = useCallback(async () => {
    if (!selectedPageId) {
      setConversations([]);
      setSelectedConversationId(null);
      return;
    }
    setIsLoadingConversations(true);
    setIsLoadingConversations(true);
    try {
      const response = await facebookApi.listConversations(selectedPageId);
      setConversations(response.content || []);
      setSelectedConversationId((current) => {
        if (current && (response.content || []).some((conversation) => conversation.id === current)) {
          return current;
        }
        return (response.content || [])[0]?.id ?? null;
      });
    } catch (loadError) {
      addToast(loadError instanceof Error ? loadError.message : 'Không tải được hộp thoại', 'error');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [selectedPageId]);

  const loadMessages = useCallback(async () => {
    if (!selectedPageId || !selectedConversationId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    setIsLoadingMessages(true);
    try {
      const response = await facebookApi.listMessages(selectedPageId, selectedConversationId);
      setMessages(response.content || []);
    } catch (loadError) {
      addToast(loadError instanceof Error ? loadError.message : 'Không tải được tin nhắn', 'error');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [selectedConversationId, selectedPageId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadConversations(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadMessages(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadMessages]);

  const handleSend = async () => {
    if (!selectedPageId || !selectedConversation) {
      addToast('Chọn hội thoại trước khi gửi tin nhắn.', 'error');
      return;
    }
    if (!draft.trim()) {
      return;
    }
    setIsSending(true);
    setIsSending(true);
    try {
      const sentMessage = await facebookApi.sendMessage(selectedPageId, selectedConversation.senderPsid, draft.trim(), messageType);
      setMessages((current) => [...current, sentMessage]);
      setDraft('');
      await loadConversations();
    } catch (sendError) {
      addToast(sendError instanceof Error ? sendError.message : 'Gửi tin nhắn thất bại', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-surface-muted overflow-hidden">
      {/* Left Pane: Conversation List */}
      <section className="w-full md:w-[360px] border-r border-border-base flex flex-col bg-surface-muted shrink-0">
        <div className="p-space-3 border-b border-border-base">
          <div className="flex items-center justify-between mb-space-3">
            <h1 className="font-display-lg text-display-lg text-primary">Hộp thoại</h1>
            <button
              className="p-1.5 text-text-secondary hover:bg-state-hover hover:text-text-primary rounded-full transition-colors disabled:opacity-50"
              disabled={isLoadingConversations || !selectedPageId}
              onClick={() => void loadConversations()}
              title="Tải lại hội thoại"
            >
              <span className={clsx("material-symbols-outlined text-[20px]", isLoadingConversations && "animate-spin")} data-icon="refresh">refresh</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]" data-icon="search">search</span>
            <input
              className="w-full bg-surface-base border border-border-base rounded-lg py-2 pl-10 pr-4 text-body-sm focus:outline-none focus:border-text-accent transition-colors"
              placeholder="Tìm kiếm hội thoại..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedPageId && (
            <div className="p-space-4 text-body-sm text-text-secondary">Chọn hoặc kết nối Fanpage để xem hội thoại.</div>
          )}
          {selectedPageId && filteredConversations.length === 0 && !isLoadingConversations && (
            <div className="p-space-4 text-body-sm text-text-secondary">Chưa có hội thoại nào. Tin nhắn inbound từ webhook sẽ xuất hiện tại đây.</div>
          )}
          {filteredConversations.map((conversation) => {
            const displayName = conversation.senderName ?? conversation.senderPsid ?? 'Unknown';
            const isActive = conversation.id === selectedConversationId;
            return (
              <div
                key={conversation.id}
                className={clsx(
                  'flex items-center gap-3 p-space-3 cursor-pointer transition-colors',
                  isActive ? 'bg-state-hover border-r-4 border-text-accent' : 'hover:bg-surface-base',
                )}
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <div className="relative flex-shrink-0">
                  {conversation.senderAvatarUrl ? (
                    <img className="w-10 h-10 rounded-full object-cover" src={conversation.senderAvatarUrl} alt={displayName} />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-text-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={clsx("font-body-md truncate", isActive ? "font-bold text-text-primary" : "font-semibold text-text-primary")}>{displayName}</span>
                    <span className={clsx("text-[11px]", isActive ? "text-text-accent font-medium" : "text-text-secondary")}>{formatTime(conversation.lastMessageAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-body-sm text-text-secondary truncate">PSID: {conversation.senderPsid}</p>
                    {conversation.unreadCount > 0 && <span className="w-2 h-2 bg-text-accent rounded-full shrink-0 ml-2"></span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right Pane: Active Chat */}
      <section className="hidden md:flex flex-1 flex-col bg-surface-base overflow-hidden">
        {/* Chat Header */}
        <header className="h-16 flex items-center justify-between px-space-4 bg-surface-muted border-b border-border-base flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {selectedConversation?.senderAvatarUrl ? (
                <img className="w-10 h-10 rounded-full object-cover" src={selectedConversation.senderAvatarUrl} alt="Avatar" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {(selectedConversation?.senderName ?? selectedConversation?.senderPsid ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
              {selectedConversation && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-surface-muted rounded-full"></span>
              )}
            </div>
            <div>
              <p className="font-body-md font-bold text-text-primary leading-tight">
                {selectedConversation?.senderName ?? selectedConversation?.senderPsid ?? 'Chưa chọn hội thoại'}
              </p>
              {selectedConversation ? (
                <p className="text-label-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Đang hoạt động (PSID: {selectedConversation.senderPsid})
                </p>
              ) : (
                <p className="text-label-xs text-text-secondary">Chọn hội thoại bên trái</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-text-secondary hover:text-text-accent hover:bg-state-hover rounded-lg transition-all disabled:opacity-50"
              disabled={isLoadingMessages || !selectedConversationId}
              onClick={() => void loadMessages()}
              title="Tải lại tin nhắn"
            >
              <span className={clsx("material-symbols-outlined text-[22px]", isLoadingMessages && "animate-spin")} data-icon="refresh">refresh</span>
            </button>
          </div>
        </header>



        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-space-4 space-y-6">
          {selectedConversationId && messages.length === 0 && !isLoadingMessages && (
            <div className="flex h-full items-center justify-center text-body-sm text-text-secondary">Chưa có tin nhắn trong hội thoại này.</div>
          )}
          {!selectedConversationId && (
            <div className="flex h-full items-center justify-center text-body-sm text-text-secondary">Chọn một hội thoại để xem tin nhắn.</div>
          )}
          
          {messages.map((message) => {
            const isOutbound = message.direction === 'OUTBOUND';
            return (
              <div
                key={message.id}
                className={clsx('flex items-end gap-3 max-w-[80%]', isOutbound ? 'ml-auto flex-row-reverse' : '')}
              >
                {!isOutbound && selectedConversation?.senderAvatarUrl ? (
                  <img className="w-8 h-8 rounded-full flex-shrink-0 object-cover" src={selectedConversation.senderAvatarUrl} alt="Avatar" />
                ) : (
                  <div
                    className={clsx(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold',
                      isOutbound ? 'bg-primary text-white' : 'bg-primary-fixed text-on-primary-fixed',
                    )}
                  >
                    {isOutbound ? 'EZ' : (selectedConversation?.senderName ?? 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                <div className={clsx('space-y-1', isOutbound && 'items-end flex flex-col')}>
                  <div
                    className={clsx(
                      'p-3 rounded-2xl shadow-sm',
                      isOutbound
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-surface-muted border border-border-base text-text-primary rounded-bl-none',
                    )}
                  >
                    {message.messageType === 'IMAGE' && message.attachmentUrl ? (
                      <div className={clsx("flex items-center gap-3", !isOutbound && "bg-surface-muted border border-border-base p-3 rounded-2xl shadow-sm")}>
                        <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md">
                          <img className="max-h-64 max-w-sm object-cover rounded-md" src={message.attachmentUrl} alt="Message attachment" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-body-md whitespace-pre-wrap break-words">{message.content ?? message.attachmentUrl}</p>
                    )}
                  </div>
                  <p className="px-1 text-[10px] text-text-secondary">
                    {formatTime(message.occurredAt)} · {message.status}
                    {message.errorMessage ? ` · ${message.errorMessage}` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Footer */}
        <footer className="p-space-3 bg-surface-muted border-t border-border-base flex-shrink-0">
          <div className="flex items-center gap-2 bg-surface-base border border-border-base rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-text-accent/20 focus-within:border-text-accent transition-all">
            <textarea
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-body-md py-2 px-3 resize-none h-10 leading-6 custom-scrollbar"
              placeholder="Nhập tin nhắn..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              disabled={!selectedConversation}
              rows={1}
            />
            <button
              className="bg-text-accent text-white px-5 py-2 rounded-lg font-semibold text-body-sm hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
              onClick={() => void handleSend()}
              disabled={!selectedConversation || !draft.trim() || isSending}
            >
              {isSending ? (
                <span className="material-symbols-outlined text-[18px] animate-spin" data-icon="refresh">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]" data-icon="send">send</span>
              )}
              <span className="hidden sm:inline">{isSending ? 'Đang gửi' : 'Gửi'}</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};
