import React from 'react';

interface EarningsChartProps {
  data: { month: string; earnings: number }[];
}

const EarningsChart: React.FC<EarningsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No recent earnings data available.
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.earnings), 1); // Avoid division by zero
  const chartHeight = 200; // Increased height for better visualization

  return (
    <div className="w-full h-full flex items-end gap-3 px-2 pt-4">
      {data.map((item) => {
        const barHeight = (item.earnings / maxValue) * chartHeight;
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-primary/20 dark:bg-primary/30 rounded-t-md hover:bg-primary/40 transition-colors group relative"
              style={{ height: `${chartHeight}px` }}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md"
                style={{ height: `${barHeight}px`, transition: 'height 0.3s ease-in-out' }}
              >
                 <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-dark dark:text-light opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{item.earnings.toLocaleString()}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.month}</span>
          </div>
        );
      })}
    </div>
  );
};

export default EarningsChart;