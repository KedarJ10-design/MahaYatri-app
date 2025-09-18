import React from 'react';

// In a real app, this data would come from props/API
const mockEarningsData = [
  { month: 'Mar', earnings: 35000 },
  { month: 'Apr', earnings: 42000 },
  { month: 'May', earnings: 58000 },
  { month: 'Jun', earnings: 45000 },
  { month: 'Jul', earnings: 62000 },
  { month: 'Aug', earnings: 75000 },
];

const EarningsChart: React.FC = () => {
  const maxValue = Math.max(...mockEarningsData.map(d => d.earnings), 1); // Avoid division by zero
  const chartHeight = 100;

  return (
    <div className="w-full h-full flex items-end gap-3 px-2 pt-4">
      {mockEarningsData.map((data) => {
        const barHeight = (data.earnings / maxValue) * chartHeight;
        return (
          <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-primary/20 dark:bg-primary/30 rounded-t-md hover:bg-primary/40 transition-colors group relative"
              style={{ height: `${chartHeight}px` }}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md"
                style={{ height: `${barHeight}px` }}
              >
                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-dark dark:text-light opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{data.earnings.toLocaleString()}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{data.month}</span>
          </div>
        );
      })}
    </div>
  );
};

export default EarningsChart;
