import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className, variant = 'rect' }) => {
  const baseClasses = 'relative overflow-hidden bg-gray-200 dark:bg-dark-light rounded-md';

  // Base styles for the shimmer pseudo-element
  const shimmerClasses = `
    after:absolute 
    after:inset-0 
    after:transform 
    after:translate-x-[-100%] 
    after:bg-gradient-to-r 
    after:from-transparent 
    after:via-white/20 
    dark:after:via-white/5 
    after:to-transparent 
    after:animate-shimmer
  `;

  const variantClasses = {
    text: 'h-4', // Standard height for text lines
    rect: '',     // No specific style, relies on className
    circle: 'rounded-full',
  };

  return (
    <div className={`${baseClasses} ${shimmerClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export default SkeletonLoader;
