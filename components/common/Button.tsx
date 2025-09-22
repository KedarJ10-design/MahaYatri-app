
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className, loading, ...props }) => {
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
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} disabled={loading} {...props}>
      {loading ? (
        <>
            <Spinner className="w-5 h-5 mr-2" />
            <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
