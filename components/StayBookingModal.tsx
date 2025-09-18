import React, { useState, useMemo } from 'react';
import { Stay, BookingStatus, StayBooking } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface StayBookingModalProps {
  stay: Stay;
  onClose: () => void;
  onBook: (bookingDetails: Omit<StayBooking, 'id' | 'userId'>) => void;
}

const StayBookingModal: React.FC<StayBookingModalProps> = ({ stay, onClose, onBook }) => {
  const today = new Date().toISOString().split('T')[0];
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [step, setStep] = useState(1);

  const durationInNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (end <= start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [checkInDate, checkOutDate]);

  const totalPrice = useMemo(() => {
    return durationInNights * stay.pricePerNight * rooms;
  }, [durationInNights, stay.pricePerNight, rooms]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (durationInNights > 0) {
      setStep(2);
    }
  };
  
  const handleConfirmBooking = () => {
    onBook({
        stayId: stay.id,
        checkInDate,
        checkOutDate,
        guests,
        rooms,
        totalPrice,
        status: BookingStatus.Upcoming,
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
    >
      <div 
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 id="booking-title" className="text-2xl font-bold font-heading text-dark dark:text-light">Book a stay at {stay.name}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {step === 1 && (
            <form onSubmit={handleNextStep}>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Check-in Date" type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} min={today} required />
                        <Input label="Check-out Date" type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} min={checkInDate || today} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Number of Guests" type="number" value={guests} onChange={e => setGuests(Math.max(1, Number(e.target.value)))} min="1" required />
                        <Input label="Number of Rooms" type="number" value={rooms} onChange={e => setRooms(Math.max(1, Number(e.target.value)))} min="1" required />
                    </div>
                    
                    {durationInNights > 0 && (
                        <div className="bg-light dark:bg-dark p-4 rounded-lg text-center">
                            <p className="text-gray-600 dark:text-gray-300">Total Duration: <span className="font-bold text-dark dark:text-light">{durationInNights} {durationInNights === 1 ? 'night' : 'nights'}</span></p>
                            <p className="text-2xl font-bold text-primary mt-2">Estimated Total: ₹{totalPrice.toLocaleString('en-IN')}</p>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl text-right">
                    <Button type="submit" disabled={totalPrice <= 0}>
                        Proceed to Confirmation
                    </Button>
                </div>
            </form>
        )}

        {step === 2 && (
            <div>
                <div className="p-8 space-y-4">
                    <h3 className="text-xl font-semibold font-heading">Booking Summary</h3>
                    <div className="bg-light dark:bg-dark p-4 rounded-lg space-y-2">
                        <p><strong>Stay:</strong> {stay.name}</p>
                        <p><strong>Location:</strong> {stay.location}</p>
                        <p><strong>Dates:</strong> {new Date(checkInDate).toLocaleDateString()} to {new Date(checkOutDate).toLocaleDateString()}</p>
                        <p><strong>Guests:</strong> {guests}</p>
                        <p><strong>Rooms:</strong> {rooms}</p>
                        <p className="text-2xl font-bold text-primary mt-4">Final Price: ₹{totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">A confirmation will be sent to your email. Payment will be handled at the property.</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-between items-center">
                    <Button variant="outline" onClick={() => setStep(1)}>Go Back</Button>
                    <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default StayBookingModal;