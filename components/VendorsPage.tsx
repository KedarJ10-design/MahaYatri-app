
import React, { useState, useMemo } from 'react';
import { Vendor } from '../types';
import VendorCard from './VendorCard';
import VendorBookingModal from './VendorBookingModal';
import Input from './common/Input';
import Button from './common/Button';
import { useAppStore } from '../store/appStore';

export const priceRangeMap: Record<Vendor['priceRange'], { label: string; range: string }> = {
  '$': { label: 'Budget', range: 'Under ₹500' },
  '$$': { label: 'Mid-Range', range: '₹500 - ₹1500' },
  '$$$': { label: 'Premium', range: 'Over ₹1500' },
};

interface VendorsPageProps {
  onBook: (vendor: Vendor) => void;
}

const VendorsPage: React.FC<VendorsPageProps> = ({ onBook }) => {
  const vendors = useAppStore(state => state.vendors);
  const [filters, setFilters] = useState({
    location: '',
    type: 'all',
    cuisine: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const locationMatch = filters.location === 'all' || vendor.location.toLowerCase().includes(filters.location.toLowerCase());
      const typeMatch = filters.type === 'all' || vendor.type === filters.type;
      const cuisineMatch = !filters.cuisine || vendor.cuisine.join(' ').toLowerCase().includes(filters.cuisine.toLowerCase());
      return locationMatch && typeMatch && cuisineMatch;
    });
  }, [vendors, filters]);

  // FIX: Explicitly type Set to resolve 'unknown' type inference issue.
  const uniqueLocations = useMemo(() => ['all', ...new Set<string>(vendors.map(v => v.location))].sort(), [vendors]);

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold font-heading mb-4">Find a Place to Eat</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="Restaurant">Restaurant</option>
              <option value="Street Food">Street Food</option>
              <option value="Cafe">Cafe</option>
            </select>
          </div>
          <Input label="Cuisine" name="cuisine" placeholder="e.g. Maharashtrian" value={filters.cuisine} onChange={handleFilterChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVendors.map(vendor => (
          <VendorCard key={vendor.id} vendor={vendor} onBook={onBook} />
        ))}
      </div>
      {filteredVendors.length === 0 && (
        <div className="text-center py-16 col-span-full">
          <p className="text-xl text-gray-500">No vendors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
