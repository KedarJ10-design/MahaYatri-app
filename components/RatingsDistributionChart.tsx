
import React from 'react';

interface RatingsDistributionChartProps {
  ratings: { star: number; count: number }[];
}

const RatingsDistributionChart: React.FC<RatingsDistributionChartProps> = ({ ratings }) => {
  const totalRatings = ratings.reduce((sum, item) => sum + item.count, 0);
  if (totalRatings === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">No ratings yet.</div>;
  }

  return (
    <div className="space-y-2">
      {ratings.map(({ star, count }) => {
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 w-12">{star} star</span>
            <div className="flex-1 bg-gray-200 dark:bg-dark-lighter rounded-full h-4 overflow-hidden">
              <div
                className="bg-secondary h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${count} ${star}-star reviews`}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-500 w-8 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingsDistributionChart;
