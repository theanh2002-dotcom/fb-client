import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { usePages } from '../../pages/PageContext';
import { useToast } from '../../../shared/context/ToastContext';
import { adsApi } from '../api/adsApi';
import type { AdsAccount, AdsPagePost, AdsPlanRequest } from '../types/adsTypes';

const SYNC_ACCOUNTS_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pages, selectedPageId, selectPage, refreshPages, isLoadingPages } = usePages();
  const { addToast } = useToast();

  const [accounts, setAccounts] = useState<AdsAccount[]>([]);
  const [posts, setPosts] = useState<AdsPagePost[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');

  const [formData, setFormData] = useState({
    campaignName: `Review Ads ${new Date().toISOString().slice(0, 10)}`,
    adAccountId: '',
    pageId: selectedPageId ?? '',
    dailyBudget: 100000,
  });

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.accountId === formData.adAccountId) ?? null,
    [accounts, formData.adAccountId],
  );

  const selectedPost = useMemo(
    () => posts.find((post) => post.fbPostId === selectedPostId) ?? null,
    [posts, selectedPostId],
  );
  const objectStoryId = selectedPost?.fbPostId || '';

  useEffect(() => {
    if (selectedPageId && !formData.pageId) {
      setFormData((prev) => ({ ...prev, pageId: selectedPageId }));
    }
  }, [formData.pageId, selectedPageId]);

  const loadAccounts = async (syncFirst = false) => {
    setIsLoadingAccounts(true);
    try {
      let nextAccounts: AdsAccount[];
      if (syncFirst) {
        try {
          nextAccounts = await withTimeout(
            adsApi.syncAccounts(),
            SYNC_ACCOUNTS_TIMEOUT_MS,
            'Sync ad accounts is taking too long. Showing saved accounts instead.',
          );
          addToast('Ad accounts synced', 'success');
        } catch (syncError) {
          addToast(syncError instanceof Error ? syncError.message : 'Cannot sync ad accounts', 'error');
          nextAccounts = await adsApi.listAccounts();
        }
      } else {
        nextAccounts = await adsApi.listAccounts();
      }
      setAccounts(nextAccounts);
      if (nextAccounts.length > 0 && !nextAccounts.some((account) => account.accountId === formData.adAccountId)) {
        setFormData((prev) => ({ ...prev, adAccountId: nextAccounts[0].accountId }));
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Cannot load ad accounts', 'error');
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadPosts = async (pageId = formData.pageId) => {
    if (!pageId) {
      setPosts([]);
      setSelectedPostId('');
      return;
    }
    setIsLoadingPosts(true);
    try {
      const nextPosts = (await adsApi.listPagePosts(pageId)).filter((post) => Boolean(post.fbPostId));
      setPosts(nextPosts);
      if (nextPosts.length > 0 && !nextPosts.some((post) => post.fbPostId === selectedPostId)) {
        setSelectedPostId(nextPosts[0].fbPostId ?? '');
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Cannot load Page posts', 'error');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    void refreshPages();
    void loadAccounts(false);
  }, []);

  useEffect(() => {
    if (formData.pageId) {
      void loadPosts(formData.pageId);
    }
  }, [formData.pageId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) {
      return;
    }
    if (!formData.pageId || !formData.adAccountId) {
      addToast('Select both Page and Ad Account', 'error');
      return;
    }
    if (!objectStoryId) {
      addToast('Select a published Page post from DB before creating the ad', 'error');
      return;
    }

    setIsSubmitting(true);
    const planId = `review-${Date.now()}`;
    const planData: AdsPlanRequest = {
      plan_id: planId,
      owner_id: user.id,
      ad_account_id: formData.adAccountId,
      page_id: formData.pageId,
      campaign_data: {
        name: formData.campaignName,
        objective: 'OUTCOME_AWARENESS',
        buying_type: 'AUCTION',
        special_ad_categories: ['NONE'],
        is_cbo: false,
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      },
      adsets: [
        {
          name: `${formData.campaignName} - Ad Set`,
          daily_budget: formData.dailyBudget,
          config_data: {
            optimization_goal: 'REACH',
            billing_event: 'IMPRESSIONS',
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
          },
          targeting: {
            geo_locations: { countries: ['VN'] },
          },
          ads: [
            {
              name: `${formData.campaignName} - Ad`,
              creative_data: {
                name: `${formData.campaignName} - Creative`,
                type: 'EXISTING_POST',
                object_story_id: objectStoryId,
              },
            },
          ],
        },
      ],
    };

    try {
      await adsApi.createPlan(planData);
      addToast('Ads plan created. The ad will be created in PAUSED status.', 'success');
      navigate('/ads');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Cannot create ads plan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/ads')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-base hover:bg-state-hover transition-colors"
          aria-label="Back to ads"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-display-lg font-bold text-on-surface">Create review ad</h1>
          <p className="text-body-sm text-text-secondary">Creates one paused campaign, ad set, creative, and ad.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="flex flex-col gap-4">
          <section className="bg-surface-muted border border-border-base rounded-md p-5 space-y-4">
            <h2 className="font-body-md font-bold">Campaign setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-body-sm font-bold text-on-surface">Campaign name</span>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  className="border border-border-base rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-base"
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-body-sm font-bold text-on-surface">Daily budget</span>
                <input
                  type="number"
                  value={formData.dailyBudget}
                  onChange={(e) => setFormData({ ...formData, dailyBudget: Number(e.target.value) })}
                  className="border border-border-base rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-base"
                  min="20000"
                  required
                />
              </label>
            </div>
          </section>

          <section className="bg-surface-muted border border-border-base rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-body-md font-bold">Page and ad account</h2>
              <button
                type="button"
                onClick={() => void loadAccounts(true)}
                disabled={isLoadingAccounts}
                className="inline-flex items-center gap-2 px-3 py-2 border border-border-base rounded-md text-body-sm font-bold hover:bg-state-hover disabled:opacity-60"
              >
                <RefreshCw size={16} className={isLoadingAccounts ? 'animate-spin' : ''} />
                Sync accounts
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="font-body-sm font-bold text-on-surface">Facebook Page</span>
                <select
                  value={formData.pageId}
                  onChange={(e) => {
                    setSelectedPostId('');
                    setFormData({ ...formData, pageId: e.target.value });
                    selectPage(e.target.value);
                  }}
                  className="border border-border-base rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-base"
                  required
                >
                  <option value="">{isLoadingPages ? 'Loading pages...' : 'Select Page'}</option>
                  {pages.map((page) => (
                    <option key={page.fbPageId} value={page.fbPageId}>
                      {page.pageName} ({page.fbPageId})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-body-sm font-bold text-on-surface">Ad Account</span>
                <select
                  value={formData.adAccountId}
                  onChange={(e) => {
                    setFormData({ ...formData, adAccountId: e.target.value });
                  }}
                  className="border border-border-base rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-base"
                  required
                >
                  <option value="">{isLoadingAccounts ? 'Loading accounts...' : 'Select Ad Account'}</option>
                  {accounts.map((account) => (
                    <option key={account.accountId} value={account.accountId}>
                      {account.name} ({account.accountId})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {selectedAccount && (
              <div className="rounded-md border border-border-base bg-surface-base p-3 text-body-sm text-text-secondary">
                Currency: {selectedAccount.currency || '-'} | Timezone: {selectedAccount.timezoneName || '-'}
              </div>
            )}
          </section>

          <section className="bg-surface-muted border border-border-base rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-body-md font-bold">Existing Page post</h2>
              <button
                type="button"
                onClick={() => void loadPosts()}
                disabled={isLoadingPosts || !formData.pageId}
                className="inline-flex items-center gap-2 px-3 py-2 border border-border-base rounded-md text-body-sm font-bold hover:bg-state-hover disabled:opacity-60"
              >
                <RefreshCw size={16} className={isLoadingPosts ? 'animate-spin' : ''} />
                Refresh posts
              </button>
            </div>
            <label className="flex flex-col gap-2">
              <span className="font-body-sm font-bold text-on-surface">Published post</span>
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="border border-border-base rounded-md px-3 py-2 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-base"
                required
              >
                <option value="">
                  {isLoadingPosts ? 'Loading DB posts...' : posts.length === 0 ? 'No DB posts found' : 'Select post'}
                </option>
                {posts.map((post) => (
                  <option key={post.fbPostId ?? post.id} value={post.fbPostId ?? ''}>
                    {(post.content || '(Image post)').slice(0, 80)} - {post.fbPostId}
                  </option>
                ))}
              </select>
            </label>
            {selectedPost && (
              <div className="rounded-md border border-border-base bg-surface-base p-3 text-body-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-on-surface">
                  <FileText size={16} />
                  {selectedPost.fbPostId}
                </div>
                <p className="text-text-secondary whitespace-pre-wrap break-words">
                  {selectedPost.content || '(Image post)'}
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="bg-surface-muted border border-border-base rounded-md p-5 h-fit space-y-4">
          <h2 className="font-body-md font-bold">Review ad</h2>
          <div className="rounded-md border border-border-base bg-surface-base p-3 text-body-sm text-text-secondary space-y-2">
            <p>The ad uses an existing public Page post and will be created in PAUSED status.</p>
            <p className="break-all">Object story ID: {objectStoryId || '-'}</p>
          </div>
          <div className="pt-4 border-t border-border-base flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !objectStoryId}
              className="bg-primary text-on-primary px-6 py-2 rounded-md font-body-sm font-bold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create paused ad'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/ads')}
              className="px-4 py-2 border border-border-base text-secondary rounded-md font-body-sm font-bold hover:bg-state-hover transition-colors"
            >
              Cancel
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};
