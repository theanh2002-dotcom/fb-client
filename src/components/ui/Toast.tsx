import { useEffect, useState } from 'react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  const colors = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-error-container text-on-error-container border-error-container',
    info: 'bg-surface-container-highest text-text-primary border-border-base',
  };

  const iconColors = {
    success: 'text-emerald-600',
    error: 'text-error',
    info: 'text-text-accent',
  };

  return (
    <div
      className={clsx(
        'pointer-events-auto flex w-[350px] items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 ease-in-out',
        colors[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      )}
      role="alert"
    >
      <span className={clsx("material-symbols-outlined flex-shrink-0", iconColors[type])} data-icon={icons[type]}>
        {icons[type]}
      </span>
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded-md p-1 opacity-60 hover:bg-black/5 hover:opacity-100 transition-all"
        aria-label="Close"
      >
        <span className="material-symbols-outlined text-[18px]" data-icon="close">close</span>
      </button>
    </div>
  );
};
