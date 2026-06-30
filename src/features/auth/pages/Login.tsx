import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../../../shared/context/ToastContext';

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const [email, setEmail] = useState('admin@ezi.vn');
  const [password, setPassword] = useState('123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/manage" replace />;
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      addToast('Đăng nhập thành công', 'success');
      navigate('/manage', { replace: true });
    } catch (loginError) {
      addToast(loginError instanceof Error ? loginError.message : 'Dang nhap that bai', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-base min-h-screen flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop antialiased">
      <main className="w-full max-w-[400px] bg-surface-muted border border-border-base rounded-xl shadow-sm p-space-5 md:p-space-6 flex flex-col items-center">
        {/* Brand / Logo */}
        <div className="mb-space-6 flex flex-col items-center">
          <div className="mb-2 flex items-center gap-3">
            <img src="/image.png" alt="ezitalent logo" className="h-10 w-10 rounded-md object-contain" />
            <span className="font-display-lg text-display-lg tracking-tight text-primary">ezitalent</span>
          </div>
          <div className="mt-2 h-1 w-8 rounded-full bg-text-accent opacity-80"></div>
        </div>

        {/* Title */}
        <h1 className="font-display-xl text-display-xl text-text-primary mb-space-5 text-center w-full">
          Facebook Review Login
        </h1>

        {/* Form */}
        <form className="w-full flex flex-col gap-space-4" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="flex flex-col gap-space-1">
            <label className="font-label-xs text-label-xs text-text-secondary" htmlFor="demo-email">Demo Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-space-3 top-1/2 -translate-y-1/2 text-text-secondary text-opacity-50" style={{ fontSize: '20px' }} data-icon="mail">mail</span>
              <input
                className="w-full h-10 pl-10 pr-space-3 border border-border-base rounded-lg bg-surface-muted font-body-md text-body-md text-text-primary placeholder-text-secondary placeholder-opacity-50 focus:outline-none focus:border-text-accent focus:ring-1 focus:ring-text-accent transition-all"
                id="demo-email"
                type="email"
                value={email}
                autoComplete="username"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="demo@example.com"
                required
                disabled={isBootstrapping || isSubmitting}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-space-1">
            <label className="font-label-xs text-label-xs text-text-secondary" htmlFor="demo-password">Demo Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-space-3 top-1/2 -translate-y-1/2 text-text-secondary text-opacity-50" style={{ fontSize: '20px' }} data-icon="lock">lock</span>
              <input
                className="w-full h-10 pl-10 pr-space-3 border border-border-base rounded-lg bg-surface-muted font-body-md text-body-md text-text-primary placeholder-text-secondary placeholder-opacity-50 focus:outline-none focus:border-text-accent focus:ring-1 focus:ring-text-accent transition-all"
                id="demo-password"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="******"
                required
                disabled={isBootstrapping || isSubmitting}
              />
            </div>
          </div>


          {/* Submit Button */}
          <button
            className="w-full h-10 mt-space-2 bg-primary text-on-primary font-body-md text-body-md font-medium rounded-lg hover:bg-on-primary-fixed-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            type="submit"
            disabled={isBootstrapping || isSubmitting}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Login to Dashboard'}
            {!isSubmitting && <span className="material-symbols-outlined" style={{ fontSize: '18px' }} data-icon="arrow_forward">arrow_forward</span>}
          </button>
        </form>

        {/* Informational Note */}
        <p className="mt-space-5 font-body-sm text-body-sm text-text-secondary text-center opacity-80">
          This is a secure demo environment for App Review purposes only.
        </p>
      </main>

      {/* Optional Footer */}
      <footer className="absolute bottom-0 w-full flex flex-col md:flex-row justify-center items-center py-space-4 px-margin-desktop text-center md:text-left gap-space-2 md:gap-space-4">
        <span className="font-label-xs text-label-xs text-text-secondary">© 2024 ezitalent. All rights reserved.</span>
      </footer>
    </div>
  );
};
