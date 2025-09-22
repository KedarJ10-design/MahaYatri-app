import React, { useState, useMemo } from 'react';
import { Vendor } from '../types';
import VendorCard from './VendorCard';

interface VendorsPageProps {
  vendors: Vendor[];
  onBookVendor: (vendor: Vendor) => void;
}

export const priceRangeMap = {
  '$': { label: 'Affordable', range: 'Avg. ₹100-300' },
  '$$': { label: 'Moderate', range: 'Avg. ₹300-700' },
  '$$$': { label: 'Expensive', range: 'Avg. ₹700+' },
};

const VendorsPage: React.FC<VendorsPageProps> = ({ vendors, onBookVendor }) => {
  const [priceFilter, setPriceFilter] = useState<string>('');

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const priceMatch = priceFilter ? vendor.priceRange === priceFilter : true;
      return vendor.verificationStatus === 'verified' && priceMatch;
    });
  }, [vendors, priceFilter]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-4">Eateries & Restaurants</h1>
      <div className="flex justify-center gap-2 mb-8">
        <button onClick={() => setPriceFilter('')} className={`px-4 py-2 text-sm rounded-full border-2 transition-colors ${priceFilter === '' ? 'bg-primary text-white border-primary' : 'bg-transparent text-primary border-primary'}`}>
            All
        </button>
        {Object.entries(priceRangeMap).map(([key, value]) => (
            <button key={key} onClick={() => setPriceFilter(key)} className={`px-4 py-2 text-sm rounded-full border-2 transition-colors ${priceFilter === key ? 'bg-primary text-white border-primary' : 'bg-transparent text-primary border-primary'}`}>
                {value.label}
            </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredVendors.map(vendor => (
          <VendorCard key={vendor.id} vendor={vendor} onBook={onBookVendor} />
        ))}
      </div>
    </div>
  );
};

export default VendorsPage;