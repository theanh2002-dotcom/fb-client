import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { API_BASE_URL } from '../../../shared/api/httpClient';
import { facebookApi } from '../../../shared/api/facebookApi';
import type { FacebookDataDeletionResponse } from '../../../shared/api/types';
import { ArrowLeft } from 'lucide-react';

export const DataDeletion = () => {
  const [requesterEmail, setRequesterEmail] = useState('');
  const [fbUserId, setFbUserId] = useState('');
  const [fbPageId, setFbPageId] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FacebookDataDeletionResponse | null>(null);

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await facebookApi.submitDataDeletion({
        requesterEmail: requesterEmail.trim(),
        fbUserId: fbUserId.trim(),
        fbPageId: fbPageId.trim(),
        note: note.trim(),
      });
      setResult(response);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Cannot submit data deletion request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-base px-6 py-10 text-text-primary">
      <div className="mx-auto mb-6 max-w-3xl">
        <Link
          to="/review"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App Review
        </Link>
      </div>
      <section className="mx-auto max-w-3xl space-y-6 rounded-xl border border-border-base bg-surface-muted p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <img src="/image.png" alt="ezitalent logo" className="h-8 w-8 rounded-md object-contain" />
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">ezitalent Facebook Service</p>
          </div>
          <h1 className="mt-2 text-3xl font-bold">Data Deletion Instructions</h1>
          <p className="mt-2 text-sm text-text-secondary">Use this page to request deletion of Facebook Page data processed by this service.</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">How to request deletion</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-text-secondary">
            <li>Disconnect the Facebook Page in the app if you still have access.</li>
            <li>Submit the form below with your email and Facebook user or Page identifier.</li>
            <li>The system returns a request ID and confirmation code for tracking.</li>
          </ol>
        </section>

        <section className="rounded-lg border border-border-base bg-surface-container-low p-4 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">Callback endpoint</p>
          <p className="mt-1 break-all">{API_BASE_URL}/api/data-deletion</p>
          <p className="mt-2">The endpoint accepts JSON requests from this page and form-encoded callback requests for Meta review.</p>
        </section>

        <form className="grid gap-4" onSubmit={submitRequest}>
          <label className="text-sm font-medium">
            Requester email
            <input
              className="mt-2 h-10 w-full rounded-md border border-border-base bg-surface-container-lowest px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={requesterEmail}
              onChange={(event) => setRequesterEmail(event.target.value)}
              placeholder="reviewer@example.com"
              type="email"
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Facebook user ID
              <input
                className="mt-2 h-10 w-full rounded-md border border-border-base bg-surface-container-lowest px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={fbUserId}
                onChange={(event) => setFbUserId(event.target.value)}
                placeholder="Facebook user ID"
              />
            </label>
            <label className="text-sm font-medium">
              Facebook Page ID
              <input
                className="mt-2 h-10 w-full rounded-md border border-border-base bg-surface-container-lowest px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={fbPageId}
                onChange={(event) => setFbPageId(event.target.value)}
                placeholder="Facebook Page ID"
              />
            </label>
          </div>

          <label className="text-sm font-medium">
            Note
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-border-base bg-surface-container-lowest px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add context for the deletion request"
            />
          </label>

          {error && <div className="rounded-md border border-error-container bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link className="text-sm font-semibold text-primary hover:underline" to="/privacy-policy">
              Privacy Policy
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit deletion request'}
            </Button>
          </div>
        </form>

        {result && (
          <section className="rounded-md border border-secondary-container bg-secondary-container p-4 text-sm text-on-secondary-container">
            <p className="font-semibold">Deletion request received</p>
            <div className="mt-2 grid gap-1">
              <span>Request ID: {result.requestId}</span>
              <span>Status: {result.status}</span>
              <span>Confirmation code: {result.confirmationCode}</span>
              <span>Message: {result.message}</span>
            </div>
          </section>
        )}
      </section>
    </main>
  );
};
