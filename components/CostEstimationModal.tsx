import React, { useState, useEffect } from 'react';
import { Itinerary, CostEstimate } from '../types';
import { estimateTripCost } from '../services/geminiService';
import Button from './common/Button';
import SkeletonLoader from './common/SkeletonLoader';

interface CostEstimationModalProps {
  itinerary: Itinerary;
  onClose: () => void;
}

const CostEstimationModal: React.FC<CostEstimationModalProps> = ({ itinerary, onClose }) => {
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await estimateTripCost(itinerary);
        setEstimate(result);
      } catch (err: any) {
        setError(err.message || "Could not fetch cost estimate.");
      } finally {
        setLoading(false);
      }
    };
    fetchEstimate();
  }, [itinerary]);

  const totalCost = estimate 
    ? Object.values(estimate).reduce((sum, item) => sum + item.amount, 0)
    : 0;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <SkeletonLoader count={4} className="h-16" />
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
             <SkeletonLoader className="h-8 w-1/2 ml-auto" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
          <p className="font-bold">Error loading estimate:</p>
          <p>{error}</p>
        </div>
      );
    }

    if (estimate) {
      return (
        <div className="space-y-4">
          {Object.entries(estimate).map(([category, details]) => (
            <div key={category} className="p-4 bg-light dark:bg-dark rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold capitalize">{category.replace(/([A-Z])/g, ' $1')}</h4>
                <p className="font-bold text-lg text-primary">₹{details.amount.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{details.description}</p>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Grand Total</h3>
              <p className="text-2xl font-extrabold text-primary">₹{totalCost.toLocaleString('en-IN')}</p>
          </div>
          <p className="text-xs text-gray-400 text-center pt-2">*This is an AI-generated estimate for a solo traveler and may vary based on your travel style and preferences.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cost-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 id="cost-title" className="text-2xl font-bold text-dark dark:text-light">Trip Cost Estimate</h2>
            <p className="text-gray-500 dark:text-gray-400">{itinerary.destination} - {itinerary.duration} Days</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
            {renderContent()}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl text-right">
          <Button variant="primary" onClick={onClose}>Got it!</Button>
        </div>
      </div>
    </div>
  );
};

export default CostEstimationModal;