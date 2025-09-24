
import React from 'react';
import { CostEstimate } from '../types';
import Button from './common/Button';

interface CostEstimationModalProps {
  estimate: CostEstimate;
  onClose: () => void;
}

const CategoryRow: React.FC<{ label: string; amount: number; description: string }> = ({ label, amount, description }) => (
    <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
        <div>
            <p className="font-semibold text-dark dark:text-light">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <p className="font-bold text-lg text-primary">₹{amount.toLocaleString()}</p>
    </div>
);

const CostEstimationModal: React.FC<CostEstimationModalProps> = ({ estimate, onClose }) => {
  const total = Object.values(estimate).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Trip Cost Breakdown</h2>
          <p className="text-gray-500">Estimates are for a solo traveler with a mid-range budget.</p>
        </div>
        <div className="p-6 space-y-2">
            <CategoryRow label="Accommodation" amount={estimate.accommodation.amount} description={estimate.accommodation.description} />
            <CategoryRow label="Food" amount={estimate.food.amount} description={estimate.food.description} />
            <CategoryRow label="Local Transport" amount={estimate.localTransport.amount} description={estimate.localTransport.description} />
            <CategoryRow label="Activities" amount={estimate.activities.amount} description={estimate.activities.description} />
             <div className="flex justify-between items-center pt-4">
                <p className="font-bold text-xl">Total Estimate</p>
                <p className="font-extrabold text-2xl text-primary">₹{total.toLocaleString()}</p>
            </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default CostEstimationModal;
