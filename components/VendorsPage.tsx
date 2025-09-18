import React, { useState, useMemo } from 'react';
import { Vendor } from '../types';
import VendorCard from './VendorCard';
import Input from './common/Input';
import Button from './common/Button';

interface VendorsPageProps {
  vendors: Vendor[];
  onBookVendor: (vendor: Vendor) => void;
}

const VendorsPage: React.FC<VendorsPageProps> = ({ vendors, onBookVendor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(0);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  
  const verifiedVendors = useMemo(() => vendors.filter(g => g.verificationStatus === 'verified'), [vendors]);

  const allLocations = useMemo(() => [...new Set(verifiedVendors.map(v => v.location))], [verifiedVendors]);
  const allCuisines = useMemo(() => [...new Set(verifiedVendors.flatMap(v => v.cuisine))], [verifiedVendors]);
  const allPriceRanges = ['$', '$$', '$$$'];

  const handleToggleFilter = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const filteredVendors = useMemo(() => {
    return verifiedVendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = location ? vendor.location === location : true;
      const matchesRating = rating ? vendor.rating >= rating : true;
      const matchesPrice = priceRange.length > 0 ? priceRange.includes(vendor.priceRange) : true;
      const matchesCuisines = selectedCuisines.length > 0 ? selectedCuisines.every(c => vendor.cuisine.includes(c)) : true;

      return matchesSearch && matchesLocation && matchesRating && matchesPrice && matchesCuisines;
    });
  }, [searchTerm, location, rating, priceRange, selectedCuisines, verifiedVendors]);

  const resetFilters = () => {
    setSearchTerm('');
    setLocation('');
    setRating(0);
    setPriceRange([]);
    setSelectedCuisines([]);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
      <aside className="md:w-1/4 lg:w-1/5">
        <div className="bg-white dark:bg-dark-light p-6 rounded-xl shadow-md space-y-6 sticky top-24">
          <div className="flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button variant="ghost" className="text-xs p-1" onClick={resetFilters}>Reset</Button>
          </div>
          <Input label="Search by Name" placeholder="e.g., Bademiya" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <select className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Rating</label>
            <div className="flex items-center space-x-2">
              <input type="range" min="0" max="5" step="0.5" value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" />
              <span className="font-semibold text-primary">{rating > 0 ? rating.toFixed(1) : 'Any'}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</h3>
            <div className="flex flex-wrap gap-2">
              {allPriceRanges.map(p => (
                <button key={p} onClick={() => handleToggleFilter(p, priceRange, setPriceRange)} className={`px-3 py-1 text-sm rounded-full border ${priceRange.includes(p) ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cuisine</h3>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {allCuisines.map(c => (
                <button key={c} onClick={() => handleToggleFilter(c, selectedCuisines, setSelectedCuisines)} className={`px-2 py-1 text-xs rounded-full border ${selectedCuisines.includes(c) ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-6">{filteredVendors.length} {filteredVendors.length === 1 ? 'Vendor' : 'Vendors'} Found</h1>
        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} onViewDetails={() => alert(`Viewing details for ${vendor.name}`)} onBookVendor={onBookVendor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-dark-light rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Vendors Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters to find more results.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorsPage;