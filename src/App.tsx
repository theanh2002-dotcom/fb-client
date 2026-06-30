import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ToastProvider } from './shared/context/ToastContext';
import { ManagePosts } from './features/manage/pages/ManagePosts';
import { Inbox } from './features/messages/pages/Inbox';
import { CreatePost } from './features/create-post/pages/CreatePost';
import { ConnectFanpage } from './features/connect/pages/ConnectFanpage';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { Login } from './features/auth/pages/Login';
import { PageProvider } from './features/pages/PageContext';
import { OAuthCallback } from './features/connect/pages/OAuthCallback';
import { AppReviewTools } from './features/review/pages/AppReviewTools';
import { PrivacyPolicy } from './features/review/pages/PrivacyPolicy';
import { DataDeletion } from './features/review/pages/DataDeletion';
import { AdsDashboard } from './features/ads/pages/AdsDashboard';
import { CreateCampaign } from './features/ads/pages/CreateCampaign';

const AppLayout = ({ noPadding = false }) => (
  <MainLayout noPadding={noPadding}>
    <Outlet />
  </MainLayout>
);

const ProtectedRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-background p-6 text-sm text-text-secondary">
        Dang kiem tra phien dang nhap...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <PageProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/data-deletion" element={<DataDeletion />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/oauth/callback" element={<OAuthCallback />} />
                <Route element={<AppLayout />}>
                  <Route path="/manage" element={<ManagePosts />} />
                  <Route path="/create" element={<CreatePost />} />
                  <Route path="/connect" element={<ConnectFanpage />} />
                  <Route path="/review" element={<AppReviewTools />} />
                  <Route path="/ads" element={<AdsDashboard />} />
                  <Route path="/ads/create" element={<CreateCampaign />} />
                </Route>
                <Route element={<AppLayout noPadding />}>
                  <Route path="/messages" element={<Inbox />} />
                </Route>
              </Route>
            </Routes>
          </PageProvider>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}
