import React, { useState } from 'react';
import { Vendor, BookingStatus, VendorBooking } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface VendorBookingModalProps {
  vendor: Vendor;
  onClose: () => void;
  onBook: (bookingDetails: Omit<VendorBooking, 'id' | 'userId'>) => void;
}

const VendorBookingModal: React.FC<VendorBookingModalProps> = ({ vendor, onClose, onBook }) => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [step, setStep] = useState(1);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time && guests > 0) {
      setStep(2);
    }
  };
  
  const handleConfirmBooking = () => {
    onBook({
        vendorId: vendor.id,
        date,
        time,
        guests,
        specialRequest,
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
            <h2 id="booking-title" className="text-2xl font-bold font-heading text-dark dark:text-light">Reserve at {vendor.name}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {step === 1 && (
            <form onSubmit={handleNextStep}>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} min={today} required />
                        <Input label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
                    </div>
                    <Input label="Number of Guests" type="number" value={guests} onChange={e => setGuests(Math.max(1, Number(e.target.value)))} min="1" required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Requests (optional)</label>
                        <textarea
                            value={specialRequest}
                            onChange={e => setSpecialRequest(e.target.value)}
                            rows={3}
                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="e.g., anniversary, window seat"
                        />
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl text-right">
                    <Button type="submit">
                        Check Availability
                    </Button>
                </div>
            </form>
        )}

        {step === 2 && (
            <div>
                <div className="p-8 space-y-4">
                    <h3 className="text-xl font-semibold font-heading">Reservation Summary</h3>
                    <div className="bg-light dark:bg-dark p-4 rounded-lg space-y-2">
                        <p><strong>Vendor:</strong> {vendor.name}</p>
                        <p><strong>Location:</strong> {vendor.location}</p>
                        <p><strong>Date & Time:</strong> {new Date(date).toLocaleDateString()} at {time}</p>
                        <p><strong>Guests:</strong> {guests}</p>
                        {specialRequest && <p><strong>Special Request:</strong> {specialRequest}</p>}
                    </div>
                     <p className="text-sm text-gray-500 dark:text-gray-400">A confirmation will be sent to your email. No payment is required for this reservation.</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-between items-center">
                    <Button variant="outline" onClick={() => setStep(1)}>Go Back</Button>
                    <Button onClick={handleConfirmBooking}>Confirm Reservation</Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default VendorBookingModal;