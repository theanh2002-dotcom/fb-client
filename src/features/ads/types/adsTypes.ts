export interface AdsPlanRequest {
  plan_id?: string;
  owner_id?: string;
  ad_account_id: string;
  page_id: string;
  campaign_data: CampaignData;
  adsets: AdSetData[];
}

export interface CampaignData {
  name: string;
  objective: string;
  buying_type: string;
  special_ad_categories: string[];
  is_cbo: boolean;
  daily_budget?: number;
  bid_strategy?: string;
}

export interface AdSetData {
  name: string;
  daily_budget?: number;
  lifetime_budget?: number;
  start_time?: string;
  end_time?: string;
  config_data: {
    optimization_goal: string;
    billing_event: string;
    destination_type?: string;
    bid_strategy?: string;
    bid_amount?: number;
  };
  targeting: {
    geo_locations: {
      countries: string[];
    };
  };
  ads: AdData[];
}

export interface AdData {
  name: string;
  creative_data: {
    name: string;
    type: string;
    message?: string;
    headline?: string;
    link_url?: string;
    call_to_action_type?: string;
    image_hash?: string;
    video_id?: string;
    object_story_id?: string;
    asset_id?: string;
  };
}

export interface AdsPlanResponse {
  id: string;
  planId: string;
  ownerId: string;
  adAccountId: string;
  pageId: string;
  fbCampaignId?: string;
  currentStep?: string;
  totalAds?: number;
  successCount?: number;
  failureCount?: number;
  status: string;
  errorMessage?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdsAccount {
  id: string;
  accountId: string;
  ownerId: string;
  fbUserId: string;
  name: string;
  currency: string;
  timezoneName: string;
  fbAccountStatus: number;
  balance: number;
  syncStatus: string;
}

export interface AdsAsset {
  id: string;
  adAccountId: string;
  fbAssetId?: string | null;
  type: 'IMAGE' | 'VIDEO';
  name: string;
  url: string;
  thumbnailUrl?: string | null;
  hash?: string | null;
  fileSizeBytes?: number;
  videoDurationSeconds?: number | null;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED' | 'EXPIRED';
  errorMessage?: string | null;
}

export interface AdsPagePost {
  id: string;
  fbPostId: string | null;
  content: string | null;
  linkUrl?: string | null;
  status: string;
  createdAt?: string | null;
}
