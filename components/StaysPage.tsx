import React, { useState, useMemo } from 'react';
import { Stay } from '../types';
import StayCard from './StayCard';
import Input from './common/Input';
import Button from './common/Button';

interface StaysPageProps {
  stays: Stay[];
  onBookStay: (stay: Stay) => void;
}

const StaysPage: React.FC<StaysPageProps> = ({ stays, onBookStay }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const verifiedStays = useMemo(() => stays.filter(s => s.verificationStatus === 'verified'), [stays]);

  const allLocations = useMemo(() => [...new Set(verifiedStays.map(s => s.location))], [verifiedStays]);
  const allTypes = useMemo(() => [...new Set(verifiedStays.map(s => s.type))], [verifiedStays]);
  const allAmenities = useMemo(() => [...new Set(verifiedStays.flatMap(s => s.amenities))], [verifiedStays]);

  const priceInfo = useMemo(() => {
    if (verifiedStays.length === 0) return { min: 0, max: 30000 };
    const prices = verifiedStays.map(g => g.pricePerNight);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [verifiedStays]);

  const handleToggleFilter = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const filteredStays = useMemo(() => {
    return verifiedStays.filter(stay => {
      const matchesSearch = stay.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = location ? stay.location === location : true;
      const matchesRating = rating ? stay.rating >= rating : true;
      const matchesPrice = stay.pricePerNight <= maxPrice;
      const matchesTypes = selectedTypes.length > 0 ? selectedTypes.includes(stay.type) : true;
      const matchesAmenities = selectedAmenities.length > 0 ? selectedAmenities.every(a => stay.amenities.includes(a)) : true;

      return matchesSearch && matchesLocation && matchesRating && matchesPrice && matchesTypes && matchesAmenities;
    });
  }, [searchTerm, location, rating, maxPrice, selectedTypes, selectedAmenities, verifiedStays]);

  const resetFilters = () => {
    setSearchTerm('');
    setLocation('');
    setRating(0);
    setMaxPrice(priceInfo.max + 1000);
    setSelectedTypes([]);
    setSelectedAmenities([]);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
      <aside className="md:w-1/4 lg:w-1/5">
        <div className="bg-white dark:bg-dark-light p-6 rounded-xl shadow-md space-y-6 sticky top-24">
          <div className="flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button variant="ghost" className="text-xs p-1" onClick={resetFilters}>Reset</Button>
          </div>
          <Input label="Search by Name" placeholder="e.g., The Taj" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <select className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price per Night</label>
            <div className="flex items-center space-x-2">
                <input type="range" min={priceInfo.min} max={priceInfo.max + 1000} step="500" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                <span className="font-semibold text-primary w-24 text-right">₹{maxPrice}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stay Type</h3>
            <div className="flex flex-wrap gap-2">
              {allTypes.map(t => (
                <button key={t} onClick={() => handleToggleFilter(t, selectedTypes, setSelectedTypes)} className={`px-2 py-1 text-xs rounded-full border ${selectedTypes.includes(t) ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {allAmenities.map(a => (
                <button key={a} onClick={() => handleToggleFilter(a, selectedAmenities, setSelectedAmenities)} className={`px-2 py-1 text-xs rounded-full border ${selectedAmenities.includes(a) ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-6">{filteredStays.length} {filteredStays.length === 1 ? 'Stay' : 'Stays'} Found</h1>
        {filteredStays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStays.map(stay => (
              <StayCard key={stay.id} stay={stay} onViewDetails={() => alert(`Viewing details for ${stay.name}`)} onBookStay={() => onBookStay(stay)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Stays Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters to find more results.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaysPage;
