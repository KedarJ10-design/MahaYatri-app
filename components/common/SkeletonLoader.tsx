import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  type?: 'text' | 'title' | 'avatar' | 'card';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = '', count = 1, type = 'text' }) => {
  const getSkeletonClass = (type: string) => {
    switch(type) {
      case 'title': return 'h-8 w-3/4 rounded-lg';
      case 'avatar': return 'h-16 w-16 rounded-full';
      case 'card': return 'h-48 w-full rounded-xl';
      case 'text':
      default:
        return 'h-4 w-full rounded-md';
    }
  }

  const skeletons = Array.from({ length: count }, (_, i) => {
    const isLast = i === count - 1;
    const widthClass = type === 'text' && !isLast ? '' : (type === 'text' ? 'w-5/6' : '');
    return (
       <div key={i} className={`bg-gray-200 dark:bg-dark-lighter animate-pulse-subtle ${getSkeletonClass(type)} ${widthClass} ${className}`} />
    );
  });
  
  if (type === 'text') {
    return <div className="space-y-3">{skeletons}</div>;
  }
  
  return <>{skeletons}</>;
};

export default SkeletonLoader;