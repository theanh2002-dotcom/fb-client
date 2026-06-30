import { apiClient } from '../../../shared/api/httpClient';
import type { AdsAccount, AdsAsset, AdsPagePost, AdsPlanRequest, AdsPlanResponse } from '../types/adsTypes';

export const adsApi = {
  listAccounts: () => apiClient.get<AdsAccount[]>('/api/facebook/ads/accounts'),

  syncAccounts: () => apiClient.post<AdsAccount[]>('/api/facebook/ads/accounts/sync'),

  getPlans: () => apiClient.get<AdsPlanResponse[]>('/api/facebook/ads/plans'),

  getPlan: (planId: string) => apiClient.get<AdsPlanResponse>(`/api/facebook/ads/plans/${planId}`),

  listPagePosts: (pageId: string) =>
    apiClient.get<AdsPagePost[]>(`/api/facebook/ads/page-posts?page_id=${encodeURIComponent(pageId)}&limit=100`),

  createPlan: (data: AdsPlanRequest) => apiClient.post<AdsPlanResponse>('/api/facebook/ads/plans', data),

  uploadAsset: (adAccountId: string, type: 'IMAGE' | 'VIDEO', file: File) => {
    const formData = new FormData();
    formData.append('ad_account_id', adAccountId);
    formData.append('type', type);
    formData.append('file', file);
    return apiClient.post<AdsAsset>('/api/facebook/ads/assets', formData);
  },
};
