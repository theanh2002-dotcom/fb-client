import { apiClient } from './httpClient';
import type {
  AuthorizedUser,
  BasePagination,
  DemoLoginResponse,
  FacebookConversation,
  FacebookDataDeletionResponse,
  FacebookDisconnectPageResponse,
  FacebookMessage,
  FacebookOAuthExchangeResponse,
  FacebookOAuthUrlResponse,
  FacebookPage,
  FacebookPagePost,
} from './types';

export const facebookApi = {
  demoLogin: (email: string, password: string) =>
    apiClient.post<DemoLoginResponse>('/api/auth/demo-login', { email, password }, { skipAuth: true }),
  me: () => apiClient.get<AuthorizedUser>('/api/auth/me'),
  logout: () => apiClient.post<null>('/api/auth/logout'),
  getOAuthUrl: () => apiClient.get<FacebookOAuthUrlResponse>('/api/facebook/oauth/url'),
  handleOAuthCallback: (queryString: string) =>
    apiClient.get<FacebookOAuthExchangeResponse>(`/api/facebook/oauth/callback${queryString}`),
  listPages: () => apiClient.get<FacebookPage[]>('/api/pages'),
  getPage: (pageId: string) => apiClient.get<FacebookPage>(`/api/pages/${pageId}`),
  connectPage: (userAccessToken: string) =>
    apiClient.post<FacebookPage[]>('/api/facebook/pages/connect', { user_access_token: userAccessToken }),
  disconnectPage: (pageId: string, reason: string) =>
    apiClient.post<FacebookDisconnectPageResponse>(`/api/pages/${pageId}/disconnect`, { reason }),
  listPosts: (pageId: string, page = 1, limit = 20) =>
    apiClient.get<BasePagination<FacebookPagePost>>(`/api/pages/${pageId}/posts?page=${page}&limit=${limit}`),
  publishPost: (pageId: string, content: string, imageUrls: string[]) =>
    apiClient.post<FacebookPagePost>(`/api/pages/${pageId}/posts`, { content, imageUrls }),
  listConversations: (pageId: string, page = 1, limit = 20) =>
    apiClient.get<BasePagination<FacebookConversation>>(
      `/api/pages/${pageId}/conversations?page=${page}&limit=${limit}`,
    ),
  listMessages: (pageId: string, conversationId: string, page = 1, limit = 50) =>
    apiClient.get<BasePagination<FacebookMessage>>(
      `/api/pages/${pageId}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    ),
  sendMessage: (pageId: string, recipientPsid: string, content: string, messageType: 'TEXT' | 'IMAGE') =>
    apiClient.post<FacebookMessage>(`/api/pages/${pageId}/messages`, {
      recipientPsid,
      content,
      messageType,
    }),
  privacyPolicy: () => apiClient.get<string>('/privacy-policy', { skipAuth: true }),
  dataDeletionInstructions: () => apiClient.get<string>('/data-deletion', { skipAuth: true }),
  submitDataDeletion: (request: {
    requesterEmail: string;
    fbUserId: string;
    fbPageId: string;
    note: string;
  }) => apiClient.post<FacebookDataDeletionResponse>('/api/data-deletion', request, { skipAuth: true }),
};
