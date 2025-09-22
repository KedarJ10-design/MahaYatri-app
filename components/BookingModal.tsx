import React, { useState } from 'react';
import { Guide, Booking, BookingStatus, ToastMessage } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface BookingModalProps {
  guide: Guide;
  onClose: () => void;
  onBook: (bookingDetails: Omit<Booking, 'id' | 'userId'>) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ guide, onClose, onBook, addToast }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays * guide.pricePerDay * guests : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPrice = calculateTotalPrice();
    if (totalPrice <= 0) {
        addToast('End date must be after start date.', 'error');
        return;
    }

    // --- Availability Check ---
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availability = guide.availability || {};

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        if (availability[dateString] === false) {
            addToast(`The guide is unavailable on ${d.toLocaleDateString()}. Please select another date.`, 'error');
            return;
        }
    }
    
    setIsBooking(true);
    try {
      await onBook({
        guideId: guide.id,
        startDate,
        endDate,
        guests,
        totalPrice,
        status: BookingStatus.Pending,
        pointsEarned: Math.floor(totalPrice / 10),
      });
    } finally {
      setIsBooking(false); // Re-enable button on failure, modal closes on success
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
        onClick={onClose}
    >
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Book a Tour with {guide.name}</h2>
          <p className="text-gray-500">₹{guide.pricePerDay.toLocaleString()}/day per person</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} required />
            <Input label="Number of Guests" type="number" min="1" value={guests} onChange={e => setGuests(Number(e.target.value))} required />
            <div className="pt-4 text-right">
              <p className="text-lg font-bold">Total: ₹{calculateTotalPrice().toLocaleString()}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isBooking}>Cancel</Button>
            <Button type="submit" loading={isBooking}>Request to Book</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;