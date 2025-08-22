import React, { useState, useMemo } from 'react';
import { Guide } from '../types';
import GuideCard from './GuideCard';
import Input from './common/Input';

interface SearchPageProps {
  onViewGuide: (guide: Guide) => void;
  guides: Guide[];
}

const SearchPage: React.FC<SearchPageProps> = ({ onViewGuide, guides }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(6000);
  
  const verifiedGuides = useMemo(() => guides.filter(g => g.verificationStatus === 'verified'), [guides]);

  const allLocations = useMemo(() => [...new Set(verifiedGuides.map(g => g.location))], [verifiedGuides]);
  const priceInfo = useMemo(() => {
    if (verifiedGuides.length === 0) return { min: 0, max: 6000 };
    const prices = verifiedGuides.map(g => g.pricePerDay);
    return {
        min: Math.min(...prices),
        max: Math.max(...prices),
    }
  }, [verifiedGuides]);

  const filteredGuides = useMemo(() => {
    return verifiedGuides.filter(guide => {
      const matchesSearch =
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = location ? guide.location === location : true;
      const matchesRating = rating ? guide.rating >= rating : true;
      const matchesPrice = guide.pricePerDay <= maxPrice;

      return matchesSearch && matchesLocation && matchesRating && matchesPrice;
    });
  }, [searchTerm, location, rating, maxPrice, verifiedGuides]);

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
      {/* Filters Sidebar */}
      <aside className="md:w-1/4 lg:w-1/5">
        <div className="bg-white dark:bg-dark-light p-6 rounded-xl shadow-md space-y-6 sticky top-24">
          <h2 className="text-xl font-bold border-b pb-2 border-gray-200 dark:border-gray-700">Filters</h2>
          <div>
            <Input 
              label="Search by Name/Specialty"
              placeholder="e.g., Rohan or Food"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <select
              id="location"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All Locations</option>
              {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price per Day</label>
            <div className="flex items-center space-x-2">
                <input
                    id="price"
                    type="range"
                    min={priceInfo.min}
                    max={priceInfo.max + 500}
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="font-semibold text-primary w-20 text-right">₹{maxPrice}</span>
            </div>
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Rating</label>
            <div className="flex items-center space-x-2">
                <input
                    id="rating"
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="font-semibold text-primary">{rating > 0 ? rating.toFixed(1) : 'Any'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Guides List */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-6">
          {filteredGuides.length} {filteredGuides.length === 1 ? 'Guide' : 'Guides'} Found
        </h1>
        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map(guide => (
              <GuideCard key={guide.id} guide={guide} onViewDetails={() => onViewGuide(guide)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Guides Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters to find more results.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;