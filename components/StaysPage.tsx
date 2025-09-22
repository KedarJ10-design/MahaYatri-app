import React, { useState, useMemo } from 'react';
import { Stay } from '../types';
import StayCard from './StayCard';

interface StaysPageProps {
  stays: Stay[];
  onBookStay: (stay: Stay) => void;
}

export const stayPriceRangeMap: Record<string, { label: string; min: number; max: number }> = {
  'affordable': { label: 'Affordable', min: 0, max: 5000 },
  'moderate': { label: 'Moderate', min: 5001, max: 10000 },
  'expensive': { label: 'Expensive', min: 10001, max: Infinity },
};

const StaysPage: React.FC<StaysPageProps> = ({ stays, onBookStay }) => {
  const [priceFilter, setPriceFilter] = useState<string>('');

  const filteredStays = useMemo(() => {
    return stays.filter(stay => {
      const priceMatch = priceFilter 
        ? stay.pricePerNight >= stayPriceRangeMap[priceFilter].min && stay.pricePerNight <= stayPriceRangeMap[priceFilter].max
        : true;
      return stay.verificationStatus === 'verified' && priceMatch;
    });
  }, [stays, priceFilter]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-4">Hotels & Homestays</h1>
      <div className="flex justify-center flex-wrap gap-2 mb-8">
        <button onClick={() => setPriceFilter('')} className={`px-4 py-2 text-sm rounded-full border-2 transition-colors ${priceFilter === '' ? 'bg-primary text-white border-primary' : 'bg-transparent text-primary border-primary dark:text-orange-400 dark:border-orange-400'}`}>
            All
        </button>
        {Object.entries(stayPriceRangeMap).map(([key, value]) => (
            <button key={key} onClick={() => setPriceFilter(key)} className={`px-4 py-2 text-sm rounded-full border-2 transition-colors capitalize ${priceFilter === key ? 'bg-primary text-white border-primary' : 'bg-transparent text-primary border-primary dark:text-orange-400 dark:border-orange-400'}`}>
                {value.label}
            </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredStays.map(stay => (
          <StayCard key={stay.id} stay={stay} onBook={onBookStay} />
        ))}
      </div>
       {filteredStays.length === 0 && (
        <div className="text-center py-16 col-span-full">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Stays Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your price filter.</p>
        </div>
      )}
    </div>
  );
};

export default StaysPage;
