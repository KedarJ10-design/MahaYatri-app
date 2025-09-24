
import React, { useState, useEffect, useRef } from 'react';
import { Guide, Booking, BookingStatus, ToastMessage } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import GuideAvailabilityViewer from './common/GuideAvailabilityViewer';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface BookingModalProps {
  guide: Guide;
  onClose: () => void;
  onBook: (bookingDetails: Omit<Booking, 'id' | 'userId' | 'status' | 'pointsEarned'>) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ guide, onClose, onBook, addToast }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const modalRef = useFocusTrap(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);


  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0; // End date must be after start date
    // Inclusive of the start day
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays * guide.pricePerDay : 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPrice = calculateTotalPrice();
    if (totalPrice <= 0) {
        addToast('End date must be on or after start date.', 'error');
        return;
    }

    // --- Availability Check ---
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availability = guide.availability || {};

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        // Any entry in the availability map means the guide is not fully available.
        if (availability[dateString]) {
            addToast(`Guide is not fully available on ${d.toLocaleDateString()}. Please select another date range.`, 'error');
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
      });
    } finally {
      setIsBooking(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-3xl grid md:grid-cols-2 gap-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <div className="p-6 flex flex-col">
            <h2 id="booking-modal-title" className="text-2xl font-bold">Book a Tour with {guide.name}</h2>
            <p className="text-gray-500">₹{guide.pricePerDay.toLocaleString()}/day</p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col flex-grow">
              <div className="space-y-4">
                <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} required />
                <Input label="Number of Guests" type="number" min="1" value={guests} onChange={e => setGuests(Number(e.target.value))} required />
                <div className="pt-4 text-right">
                  <p className="text-lg font-bold">Total: ₹{calculateTotalPrice().toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 mt-auto bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4 -m-6 pt-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isBooking}>Cancel</Button>
                <Button type="submit" loading={isBooking}>Request to Book</Button>
              </div>
            </form>
        </div>
        <div className="p-6 bg-light dark:bg-dark rounded-r-2xl hidden md:block">
            <GuideAvailabilityViewer availability={guide.availability} />
        </div>
      </div>
    </div>
  );
};

export default BookingModal;