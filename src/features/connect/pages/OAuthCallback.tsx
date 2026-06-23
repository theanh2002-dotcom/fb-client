import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { facebookApi } from '../../../shared/api/facebookApi';
import { usePages } from '../../pages/PageContext';

const usedOAuthCodes = new Set<string>();

export function OAuthCallback() {
  const navigate = useNavigate();
  const { refreshPages } = usePages();
  const [message, setMessage] = useState('Dang hoan tat ket noi Facebook...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth() {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code && usedOAuthCodes.has(code)) {
        setMessage('Ket noi Facebook da duoc xu ly. Dang chuyen ve danh sach Fanpage...');
        setTimeout(() => navigate('/connect', { replace: true }), 900);
        return;
      }
      if (code) {
        usedOAuthCodes.add(code);
      }

      try {
        const response = await facebookApi.handleOAuthCallback(window.location.search);
        await refreshPages();
        if (!cancelled) {
          if (response.connected && response.pages.length > 0) {
            setMessage('Ket noi Facebook thanh cong. Dang chuyen ve danh sach Fanpage...');
            setTimeout(() => navigate('/connect', { replace: true }), 900);
          } else if (response.connected) {
            setMessage(
              'OAuth thanh cong nhung Facebook khong tra ve Fanpage nao. Kiem tra tai khoan Facebook co quyen quan tri Page va da cap cac quyen pages_show_list/pages_manage_metadata/pages_manage_posts/pages_read_engagement.',
            );
            setIsError(true);
          } else {
            setMessage('OAuth da hoan tat nhung backend chua tu connect duoc Fanpage. Kiem tra state hoac dung ket noi thu cong.');
            setIsError(true);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'Khong the hoan tat OAuth callback');
          setIsError(true);
        }
      }
    }

    void completeOAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshPages]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md border border-border-base bg-surface-container-lowest p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-text-primary">Facebook OAuth</h1>
        <p className={isError ? 'mt-3 text-sm text-error' : 'mt-3 text-sm text-text-secondary'}>{message}</p>
        {isError && (
          <Button className="mt-6 w-full" onClick={() => navigate('/connect')}>
            Ve man ket noi
          </Button>
        )}
        <Link className="mt-4 block text-center text-sm text-primary hover:underline" to="/connect">
          Xem danh sach Fanpage
        </Link>
      </div>
    </div>
  );
}
