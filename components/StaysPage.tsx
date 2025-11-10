
import React, { useState, useMemo } from 'react';
import { Stay } from '../types';
import StayCard from './StayCard';
import Input from './common/Input';
import PriceRangeSlider from './common/PriceRangeSlider';
import { useAppStore } from '../store/appStore';

interface StaysPageProps {
  onBook: (stay: Stay) => void;
}

const StaysPage: React.FC<StaysPageProps> = ({ onBook }) => {
  const stays = useAppStore(state => state.stays);
  const [filters, setFilters] = useState({
    location: '',
    type: 'all',
    maxPrice: 25000,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePriceChange = (value: number) => {
    setFilters(prev => ({ ...prev, maxPrice: value }));
  };
  
  const { uniqueLocations, maxPriceValue } = useMemo(() => {
    // FIX: Explicitly type Set to resolve 'unknown' type inference issue.
    const locations = ['all', ...new Set<string>(stays.map(s => s.location))].sort();
    const max = Math.max(...stays.map(s => s.pricePerNight), 10000);
    return {
      uniqueLocations: locations,
      maxPriceValue: Math.ceil(max / 1000) * 1000
    };
  }, [stays]);

  const filteredStays = useMemo(() => {
    return stays.filter(stay => {
      const locationMatch = filters.location === 'all' || stay.location.toLowerCase().includes(filters.location.toLowerCase());
      const typeMatch = filters.type === 'all' || stay.type === filters.type;
      const priceMatch = stay.pricePerNight <= filters.maxPrice;
      return locationMatch && typeMatch && priceMatch;
    });
  }, [stays, filters]);

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold font-heading mb-4">Find Your Perfect Stay</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <select name="location" value={filters.location} onChange={handleFilterChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition">
              {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition">
              <option value="all">All Types</option>
              <option value="Hotel">Hotel</option>
              <option value="Homestay">Homestay</option>
              <option value="Resort">Resort</option>
            </select>
          </div>
          <PriceRangeSlider label="Max Price per Night" min={1000} max={maxPriceValue} step={500} value={filters.maxPrice} onChange={handlePriceChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStays.map(stay => (
          <StayCard key={stay.id} stay={stay} onBook={onBook} />
        ))}
      </div>
       {filteredStays.length === 0 && (
        <div className="text-center py-16 col-span-full">
          <p className="text-xl text-gray-500">No stays found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default StaysPage;
