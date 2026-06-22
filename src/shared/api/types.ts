export type BaseResponse<T> = {
  status: number;
  message: string;
  payload: T;
};

export type BasePagination<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
};

export type AuthorizedUser = {
  id: string;
  name: string;
  username: string;
  roles: string[];
};

export type DemoLoginResponse = {
  token: string;
  user: AuthorizedUser;
};

export type FacebookOAuthUrlResponse = {
  url: string;
  state: string;
};

export type FacebookOAuthExchangeResponse = {
  code: string | null;
  state: string | null;
  error: string | null;
  errorDescription: string | null;
  exchanged: boolean;
  connected: boolean;
  pages: FacebookPage[];
};

export type FacebookPage = {
  id: string;
  fbPageId: string;
  pageName: string;
  category: string | null;
  tokenStatus: string;
  connectionStatus: string;
  webhookSubscribed: boolean;
  grantedPermissions: string[];
  missingPermissions: string[];
};

export type FacebookConversation = {
  id: string;
  pageId: string;
  senderPsid: string;
  senderName: string | null;
  senderAvatarUrl: string | null;
  status: string;
  lastMessageAt: string | null;
  lastInboundAt: string | null;
  lastOutboundAt: string | null;
  unreadCount: number;
};

export type FacebookMessage = {
  id: string;
  conversationId: string;
  pageId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  facebookMessageId: string | null;
  senderId: string;
  recipientId: string;
  messageType: 'TEXT' | 'IMAGE';
  content: string | null;
  attachmentUrl: string | null;
  status: string;
  errorMessage: string | null;
  occurredAt: string;
};

export type FacebookPostMedia = {
  id: string;
  mediaType: string;
  mediaUrl: string;
  facebookMediaId: string | null;
  mediaOrder: number;
};

export type FacebookPagePost = {
  id: string;
  pageId: string;
  fbPostId: string | null;
  content: string;
  status: 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  errorMessage: string | null;
  publishedAt: string | null;
  createdBy: string | null;
  media: FacebookPostMedia[];
};

export type FacebookDisconnectPageResponse = {
  pageId: string;
  fbPageId: string;
  connectionStatus: string;
  tokenStatus: string;
  disconnectedAt: string | null;
};

export type FacebookDataDeletionResponse = {
  requestId: string;
  status: string;
  confirmationCode: string;
  message: string;
};
