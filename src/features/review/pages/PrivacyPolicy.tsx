import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = () => (
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
        <h1 className="mt-2 text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text-secondary">Last updated: June 23, 2026</p>
      </div>

      <p className="text-sm leading-6 text-text-secondary">
        This service helps authorized business users connect Facebook Pages, publish Page posts, and respond to Page
        messages. We only request Facebook data that is required to provide these features.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Data we process</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-text-secondary">
          <li>Facebook Page identifiers, Page names, categories, granted permissions, and connection status.</li>
          <li>Page posts created through this service, including text content, public image URLs, publish status, and errors.</li>
          <li>Page conversations and messages needed for support inbox workflows.</li>
          <li>Basic demo account information used to let Meta reviewers access the review environment.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">How we use data</h2>
        <p className="text-sm leading-6 text-text-secondary">
          Data is used to show connected Pages, publish content requested by the user, display inbox conversations, send
          replies, maintain audit history, and support data deletion requests. We do not sell Facebook data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Retention and deletion</h2>
        <p className="text-sm leading-6 text-text-secondary">
          Page connection records, posts, conversations, and messages are retained only while needed for the business
          workflow or legal/audit requirements. Users can disconnect a Page in the app or request data deletion through
          the public deletion page.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-sm leading-6 text-text-secondary">
          For privacy or deletion requests, contact the app owner or submit a deletion request from the data deletion
          page.
        </p>
      </section>

      <div className="flex flex-wrap gap-4 border-t border-border-base pt-4">
        <Link className="text-sm font-semibold text-primary hover:underline" to="/data-deletion">
          Data deletion instructions
        </Link>
        <Link className="text-sm font-semibold text-primary hover:underline" to="/login">
          Reviewer login
        </Link>
      </div>
    </section>
  </main>
);
