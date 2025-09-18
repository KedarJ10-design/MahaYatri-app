import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface SOSModalProps {
  onClose: () => void;
  emergencyContact: { name: string; phone: string };
}

const SOSModal: React.FC<SOSModalProps> = ({ onClose, emergencyContact }) => {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        setLoading(false);
      },
      (err) => {
        setError(`Location Error: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);
  
  const locationString = location ? `${location.latitude}, ${location.longitude}` : '';
  const googleMapsUrl = location ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` : '';
  const smsBody = `Emergency! I need help. My current location is: ${locationString}. Map: ${googleMapsUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const renderContent = () => {
    if (loading) {
      return <div className="text-center"><Spinner /> <p className="mt-4">Getting your location...</p></div>;
    }
    if (error) {
      return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>;
    }
    if (location) {
      return (
        <div className="space-y-4 text-center">
            <p className="text-lg">Your current location is:</p>
            <div className="bg-light dark:bg-dark p-4 rounded-lg font-mono text-lg">
                <p>Lat: {location.latitude.toFixed(6)}</p>
                <p>Lon: {location.longitude.toFixed(6)}</p>
            </div>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View on Google Maps</a>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <a href={`sms:${emergencyContact.phone}?&body=${encodeURIComponent(smsBody)}`}>
                    <Button className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500">
                        Share via SMS
                    </Button>
                </a>
                <Button variant="outline" onClick={handleCopy} className="w-full">
                    {copied ? 'Copied!' : 'Copy Location'}
                </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">Sharing will send your location to your emergency contact: {emergencyContact.name} ({emergencyContact.phone}).</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 id="sos-title" className="text-2xl font-bold font-heading text-red-600">Emergency SOS</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SOSModal;