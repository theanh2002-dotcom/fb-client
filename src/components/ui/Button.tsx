import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-primary text-on-primary hover:opacity-90 shadow-sm',
      secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim',
      outline: 'border border-outline-variant text-text-secondary hover:bg-state-hover hover:text-text-primary',
      ghost: 'text-text-secondary hover:bg-state-hover hover:text-text-primary',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseClasses, variants[variant], sizes[size], className))}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
