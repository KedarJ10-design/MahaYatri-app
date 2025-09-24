

import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  loading?: boolean;
}

// FIX: Wrapped Button component with React.forwardRef to allow passing refs.
// This is necessary for components like modals where we need to manage focus on elements like buttons.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', children, className, loading, ...props }, ref) => {
  const baseClasses = 'rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px hover:shadow-lg active:translate-y-0 active:shadow-sm inline-flex items-center justify-center';

  const sizeClasses = {
    md: 'px-4 py-2',
    sm: 'px-2 py-1 text-sm',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10 focus:ring-primary',
    ghost: 'bg-transparent text-primary hover:bg-primary/10',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button ref={ref} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} disabled={loading} aria-busy={loading} {...props}>
      {loading ? (
        <>
            <Spinner className="w-5 h-5 mr-2" />
            <span>Processing...</span>
            <span role="alert" aria-live="assertive" className="sr-only">Request is processing</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
