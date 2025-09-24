import React from 'react';
import SkeletonLoader from '../common/SkeletonLoader';

const GuideCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-dark-light rounded-xl shadow-md overflow-hidden flex flex-col">
      <div className="relative">
        <SkeletonLoader variant="rect" className="h-48 w-full" />
        <div className="absolute top-2 right-2">
            <SkeletonLoader variant="rect" className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <SkeletonLoader variant="text" className="h-6 w-3/4 mb-2" />
        <SkeletonLoader variant="text" className="h-4 w-1/2 mb-3" />
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-1">
            <SkeletonLoader variant="rect" className="h-5 w-5" />
            <SkeletonLoader variant="rect" className="h-5 w-5" />
            <SkeletonLoader variant="rect" className="h-5 w-5" />
            <SkeletonLoader variant="rect" className="h-5 w-5" />
            <SkeletonLoader variant="rect" className="h-5 w-5" />
          </div>
          <SkeletonLoader variant="text" className="h-4 w-20 ml-2" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <SkeletonLoader variant="rect" className="h-6 w-20 rounded-full" />
          <SkeletonLoader variant="rect" className="h-6 w-24 rounded-full" />
          <SkeletonLoader variant="rect" className="h-6 w-16 rounded-full" />
        </div>
        <div className="mt-auto">
          <SkeletonLoader variant="rect" className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default GuideCardSkeleton;
