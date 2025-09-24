

import React, { useState, useMemo } from 'react';
import { Vendor, ToastMessage, VendorBooking } from '../types';
import VendorCard from './VendorCard';
import Input from './common/Input';
import VendorBookingModal from './VendorBookingModal';

export const priceRangeMap: Record<Vendor['priceRange'], { label: string; range: string }> = {
  '$': { label: 'Budget', range: 'Under ₹500' },
  '$$': { label: 'Mid-Range', range: '₹500 - ₹1500' },
  '$$$': { label: 'Fine Dining', range: 'Over ₹1500' },
};

interface VendorsPageProps {
  vendors: Vendor[];
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const VendorsPage: React.FC<VendorsPageProps> = ({ vendors, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingVendor, setBookingVendor] = useState<Vendor | null>(null);

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor =>
      vendor.verificationStatus === 'verified' &&
      (vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vendor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vendor.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [vendors, searchTerm]);
  
  const handleBookingSubmit = async (bookingDetails: Omit<VendorBooking, 'id' | 'userId' | 'status'>) => {
    console.log("Vendor booking submitted", bookingDetails);
    addToast("Table booked successfully!", "success");
    setBookingVendor(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-2">Explore Local Flavors</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Discover the best food experiences Maharashtra has to offer.</p>
      </div>
      <div className="mt-8 max-w-2xl mx-auto">
        <Input
          label=""
          id="vendor-search-input"
          placeholder="Search by name, location, or cuisine..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredVendors.map(vendor => (
          <li key={vendor.id}>
            <VendorCard vendor={vendor} onBook={setBookingVendor} />
          </li>
        ))}
      </ul>
      
      {bookingVendor && (
        <VendorBookingModal
            vendor={bookingVendor}
            onClose={() => setBookingVendor(null)}
            onBook={handleBookingSubmit}
            addToast={addToast}
        />
      )}
    </div>
  );
};

export default VendorsPage;