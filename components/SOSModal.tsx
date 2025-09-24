
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface SOSModalProps {
  user: User;
  onClose: () => void;
}

const SOSModal: React.FC<SOSModalProps> = ({ user, onClose }) => {
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      (geoError) => {
        setError("Could not get your location. Please ensure location services are enabled.");
      }
    );
  }, []);

  const handleSendSOS = () => {
    setIsSending(true);
    // Simulate sending SOS
    setTimeout(() => {
      alert(`SOS sent to ${user.emergencyContact.name} with location: ${location}`);
      setIsSending(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md text-center p-8" onClick={(e) => e.stopPropagation()}>
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-red-600 mt-4">Confirm Emergency SOS</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          This will immediately send an SMS with your current location to your emergency contact:
        </p>
        <div className="my-4 p-4 bg-light dark:bg-dark rounded-lg">
            <p className="font-bold text-lg">{user.emergencyContact.name}</p>
            <p className="text-gray-500">{user.emergencyContact.phone}</p>
        </div>
        <div className="h-6">
            {location && <p className="text-sm text-gray-500">Your location: {location}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!location && !error && <Spinner className="w-4 h-4 mx-auto" />}
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Button 
            variant="danger" 
            className="w-full text-lg py-3" 
            onClick={handleSendSOS}
            loading={isSending}
            disabled={!location || isSending}
          >
            Send SOS Now
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
