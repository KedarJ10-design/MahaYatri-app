import React from 'react';
import SkeletonLoader from '../common/SkeletonLoader';

const PlaceSuggestionCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-dark-light rounded-xl shadow-md p-6 flex flex-col items-start gap-3 h-full">
            <SkeletonLoader variant="rect" className="h-6 w-24 rounded-full" />
            <SkeletonLoader variant="text" className="h-7 w-3/4 mt-1" />
            <div className="w-full flex-grow mt-1">
              <SkeletonLoader variant="text" className="h-4 w-full" />
              <SkeletonLoader variant="text" className="h-4 w-5/6 mt-2" />
            </div>
            <SkeletonLoader variant="rect" className="h-10 w-full mt-2 rounded-lg" />
        </div>
    );
};

export default PlaceSuggestionCardSkeleton;
