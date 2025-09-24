import React, { useState } from 'react';
import { Vendor, VendorBooking, BookingStatus, ToastMessage } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface VendorBookingModalProps {
  vendor: Vendor;
  onClose: () => void;
  onBook: (bookingDetails: Omit<VendorBooking, 'id' | 'userId' | 'status'>) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const VendorBookingModal: React.FC<VendorBookingModalProps> = ({ vendor, onClose, onBook, addToast }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- Availability Check ---
    const availability = vendor.availability || {};
    if (availability[date] === false) {
        addToast(`${vendor.name} is closed on ${new Date(date + 'T00:00:00').toLocaleDateString()}. Please select another date.`, 'error');
        return;
    }

    setIsBooking(true);
    try {
        await onBook({
          vendorId: vendor.id,
          date,
          time,
          guests,
          specialRequest,
        });
    } finally {
        setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Book a table at {vendor.name}</h2>
          <p className="text-gray-500">{vendor.location}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <Input label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
            <Input label="Number of Guests" type="number" min="1" value={guests} onChange={e => setGuests(Number(e.target.value))} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Request (Optional)</label>
              <textarea value={specialRequest} onChange={e => setSpecialRequest(e.target.value)} rows={3} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-dark focus:ring-2 focus:ring-primary"></textarea>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isBooking}>Cancel</Button>
            <Button type="submit" loading={isBooking}>Confirm Booking</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorBookingModal;