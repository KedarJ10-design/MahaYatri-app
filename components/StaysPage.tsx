

import React, { useState, useMemo, useEffect } from 'react';
import { Stay, ToastMessage, StayBooking } from '../types';
import StayCard from './StayCard';
import Input from './common/Input';
import StayBookingModal from './StayBookingModal';
import PriceRangeSlider from './common/PriceRangeSlider';

interface StaysPageProps {
  stays: Stay[];
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const StaysPage: React.FC<StaysPageProps> = ({ stays, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(0);
  const [bookingStay, setBookingStay] = useState<Stay | null>(null);

  const priceRange = useMemo(() => {
    if (stays.length === 0) return { min: 0, max: 30000 };
    const prices = stays.map(s => s.pricePerNight);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [stays]);

  useEffect(() => {
    if (maxPrice === 0 && priceRange.max > 0) {
      setMaxPrice(priceRange.max);
    }
  }, [priceRange.max, maxPrice]);

  const filteredStays = useMemo(() => {
    const textFiltered = stays.filter(stay =>
      stay.verificationStatus === 'verified' &&
      (stay.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       stay.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
       stay.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return textFiltered.filter(stay => stay.pricePerNight <= maxPrice);
  }, [stays, searchTerm, maxPrice]);
  
  const handleBookingSubmit = async (bookingDetails: Omit<StayBooking, 'id' | 'userId' | 'status'>) => {
    console.log("Stay booking submitted", bookingDetails);
    addToast("Stay booked successfully!", "success");
    setBookingStay(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-2">Find a Place to Stay</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">From luxury hotels to cozy homestays.</p>
      </div>
      <div className="mt-8 max-w-4xl mx-auto bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg space-y-6">
        <Input
          label=""
          id="stay-search-input"
          placeholder="Search by name, location, or type (Hotel, Homestay)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <PriceRangeSlider
          label="Max Price Per Night"
          min={priceRange.min}
          max={priceRange.max}
          step={500}
          value={maxPrice}
          onChange={setMaxPrice}
        />
      </div>
      <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredStays.map(stay => (
          <li key={stay.id}>
            <StayCard stay={stay} onBook={setBookingStay} />
          </li>
        ))}
      </ul>
      
      {bookingStay && (
        <StayBookingModal 
          stay={bookingStay} 
          onClose={() => setBookingStay(null)}
          onBook={handleBookingSubmit}
          addToast={addToast}
        />
      )}
    </div>
  );
};

export default StaysPage;