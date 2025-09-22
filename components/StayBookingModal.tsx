import React, { useState } from 'react';
import { Stay, StayBooking, BookingStatus, ToastMessage } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface StayBookingModalProps {
  stay: Stay;
  onClose: () => void;
  onBook: (bookingDetails: Omit<StayBooking, 'id' | 'userId'>) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const StayBookingModal: React.FC<StayBookingModalProps> = ({ stay, onClose, onBook, addToast }) => {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (start >= end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * stay.pricePerNight * rooms : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPrice = calculateTotalPrice();
    if (totalPrice <= 0) {
        addToast('Check-out date must be after check-in date.', 'error');
        return;
    }

    // --- Availability Check ---
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const availability = stay.availability || {};

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        if (availability[dateString] === false) {
            addToast(`This stay is unavailable on ${d.toLocaleDateString()}. Please select another date.`, 'error');
            return;
        }
    }

    setIsBooking(true);
    try {
      await onBook({
        stayId: stay.id,
        checkInDate,
        checkOutDate,
        guests,
        rooms,
        totalPrice,
        status: BookingStatus.Confirmed, // Stays are auto-confirmed
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Book {stay.name}</h2>
          <p className="text-gray-500">₹{stay.pricePerNight.toLocaleString()}/night</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <Input label="Check-in Date" type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} required />
            <Input label="Check-out Date" type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} min={checkInDate} required />
            <Input label="Number of Guests" type="number" min="1" value={guests} onChange={e => setGuests(Number(e.target.value))} required />
            <Input label="Number of Rooms" type="number" min="1" value={rooms} onChange={e => setRooms(Number(e.target.value))} required />
            <div className="pt-4 text-right">
              <p className="text-lg font-bold">Total: ₹{calculateTotalPrice().toLocaleString()}</p>
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

export default StayBookingModal;