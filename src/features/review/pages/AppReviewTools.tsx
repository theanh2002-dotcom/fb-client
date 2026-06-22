import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, ExternalLink, FileText, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { API_BASE_URL } from '../../../shared/api/httpClient';
import { facebookApi } from '../../../shared/api/facebookApi';
import type { FacebookDataDeletionResponse } from '../../../shared/api/types';
import { useAuth } from '../../auth/AuthContext';
import { usePages } from '../../pages/PageContext';

const reviewPermissions = [
  {
    permission: 'pages_show_list',
    screen: 'Connect Fanpage',
    evidence: 'Reviewer can start Facebook OAuth and select a Page returned by Facebook.',
  },
  {
    permission: 'pages_manage_metadata',
    screen: 'Connect Fanpage',
    evidence: 'Connected Page card shows Page ID, webhook subscription status, token status, and missing permissions.',
  },
  {
    permission: 'pages_manage_posts',
    screen: 'Create Post / Manage Posts',
    evidence: 'Reviewer can publish a text or image URL post and verify it appears in the post history.',
  },
  {
    permission: 'pages_messaging',
    screen: 'Inbox',
    evidence: 'Reviewer can open Page conversations, inspect messages, and send text or image replies.',
  },
];

const reviewerSteps = [
  'Login with the demo reviewer account.',
  'Open Connect Fanpage and complete Facebook OAuth with a test Page.',
  'Confirm the connected Page has no missing permissions.',
  'Create a test post, then verify it in Manage Posts.',
  'Open Inbox, select a conversation, and send a test reply.',
  'Open this Review page and submit a sample data deletion request.',
];

export const AppReviewTools = () => {
  const { user } = useAuth();
  const { selectedPage } = usePages();
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [dataDeletionInstructions, setDataDeletionInstructions] = useState('');
  const [requesterEmail, setRequesterEmail] = useState(user?.username ?? '');
  const [fbUserId, setFbUserId] = useState('');
  const [note, setNote] = useState('Frontend App Review data deletion test');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FacebookDataDeletionResponse | null>(null);

  const loadPublicDocs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [policy, deletion] = await Promise.all([
        facebookApi.privacyPolicy(),
        facebookApi.dataDeletionInstructions(),
      ]);
      setPrivacyPolicy(policy);
      setDataDeletionInstructions(deletion);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không tải được policy/data deletion');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadPublicDocs(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadPublicDocs]);

  const submitDataDeletion = async () => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const response = await facebookApi.submitDataDeletion({
        requesterEmail: requesterEmail.trim() || user?.username || '',
        fbUserId: fbUserId.trim(),
        fbPageId: selectedPage?.fbPageId ?? '',
        note: note.trim(),
      });
      setResult(response);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không gửi được data deletion request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">App Review Tools</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Màn kiểm tra các endpoint public phục vụ Meta App Review và callback data deletion.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-md border border-border-base bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-text-primary">Reviewer test flow</h2>
          </div>
          <ol className="mt-4 grid gap-3 text-sm text-text-secondary">
            {reviewerSteps.map((step, index) => (
              <li className="flex gap-3" key={step}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-on-primary">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-md border border-border-base bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-text-primary">Public review URLs</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <Link className="flex items-center justify-between rounded-md border border-border-base p-3 text-primary hover:bg-state-hover" to="/privacy-policy" target="_blank">
              Privacy Policy
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link className="flex items-center justify-between rounded-md border border-border-base p-3 text-primary hover:bg-state-hover" to="/data-deletion" target="_blank">
              Data deletion page
              <ExternalLink className="h-4 w-4" />
            </Link>
            <a className="flex items-center justify-between rounded-md border border-border-base p-3 text-primary hover:bg-state-hover" href={`${API_BASE_URL}/api/data-deletion`} target="_blank" rel="noreferrer">
              Data deletion callback endpoint
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </article>
      </section>

      <section className="rounded-md border border-border-base bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-text-primary">Permission evidence checklist</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {reviewPermissions.map((item) => (
            <article className="rounded-md border border-border-base bg-surface-container-low p-4" key={item.permission}>
              <p className="font-mono text-xs font-semibold text-primary">{item.permission}</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{item.screen}</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{item.evidence}</p>
            </article>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-error-container bg-error-container p-3 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-md border border-border-base bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-text-primary">Privacy Policy</h2>
            </div>
            <a
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              href={`${API_BASE_URL}/privacy-policy`}
              target="_blank"
              rel="noreferrer"
            >
              Mở endpoint
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="mt-4 rounded-md bg-surface-container-low p-3 text-sm text-text-secondary">
            {privacyPolicy || 'Chưa tải dữ liệu'}
          </p>
        </article>

        <article className="rounded-md border border-border-base bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-text-primary">Data Deletion Instructions</h2>
            </div>
            <a
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              href={`${API_BASE_URL}/data-deletion`}
              target="_blank"
              rel="noreferrer"
            >
              Mở endpoint
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="mt-4 rounded-md bg-surface-container-low p-3 text-sm text-text-secondary">
            {dataDeletionInstructions || 'Chưa tải dữ liệu'}
          </p>
        </article>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2" onClick={() => void loadPublicDocs()} disabled={isLoading}>
          <RefreshCw className={isLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Tải lại policy
        </Button>
      </div>

      <section className="rounded-md border border-border-base bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-error" />
          <h2 className="font-semibold text-text-primary">Gửi data deletion request</h2>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          Form này gọi trực tiếp `POST /api/data-deletion` bằng JSON public, tương ứng flow test trong Postman.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-text-primary">
            Requester email
            <input
              className="mt-2 h-10 w-full rounded-md border border-border-base bg-surface-container-lowest px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={requesterEmail}
              onChange={(event) => setRequesterEmail(event.target.value)}
              placeholder="reviewer@example.com"
            />
          </label>
          <label className="text-sm font-medium text-text-primary">
            Facebook user id
            <input
              className="mt-2 h-10 w-full rounded-md border border-border-base bg-surface-container-lowest px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={fbUserId}
              onChange={(event) => setFbUserId(event.target.value)}
              placeholder="test-fb-user"
            />
          </label>
          <label className="text-sm font-medium text-text-primary">
            Facebook page id
            <input
              className="mt-2 h-10 w-full rounded-md border border-border-base bg-surface-container-low px-3 text-sm text-text-secondary"
              value={selectedPage?.fbPageId ?? ''}
              readOnly
              placeholder="Chưa chọn Fanpage"
            />
          </label>
          <label className="text-sm font-medium text-text-primary">
            Note
            <input
              className="mt-2 h-10 w-full rounded-md border border-border-base bg-surface-container-lowest px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <Button className="gap-2" onClick={() => void submitDataDeletion()} disabled={isSubmitting}>
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Gửi request
          </Button>
        </div>

        {result && (
          <div className="mt-5 rounded-md border border-secondary-container bg-secondary-container p-4 text-sm text-on-secondary-container">
            <p className="font-semibold">Data deletion received</p>
            <div className="mt-2 grid gap-1">
              <span>Request ID: {result.requestId}</span>
              <span>Status: {result.status}</span>
              <span>Confirmation code: {result.confirmationCode}</span>
              <span>Message: {result.message}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
