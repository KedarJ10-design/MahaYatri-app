import React from 'react';
import SkeletonLoader from '../common/SkeletonLoader';

const SkeletonSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div>
        <div className="flex items-center gap-3 mb-3">
            <SkeletonLoader variant="circle" className="h-10 w-10 flex-shrink-0" />
            <SkeletonLoader variant="text" className="h-6 w-1/3" />
        </div>
        <div className="space-y-2 pl-12">{children}</div>
    </div>
);

const PlaceDetailsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            <SkeletonSection>
                <SkeletonLoader variant="text" className="h-4 w-full" />
            </SkeletonSection>
             <SkeletonSection>
                <div className="flex flex-wrap gap-2">
                    <SkeletonLoader variant="rect" className="h-7 w-24 rounded-full" />
                    <SkeletonLoader variant="rect" className="h-7 w-20 rounded-full" />
                    <SkeletonLoader variant="rect" className="h-7 w-28 rounded-full" />
                </div>
            </SkeletonSection>
            <SkeletonSection>
                <SkeletonLoader variant="text" className="h-4 w-full" />
                <SkeletonLoader variant="text" className="h-4 w-full" />
                <SkeletonLoader variant="text" className="h-4 w-2/3" />
            </SkeletonSection>
        </div>
    );
};

export default PlaceDetailsSkeleton;
