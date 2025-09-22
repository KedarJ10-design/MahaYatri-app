import React, { useState, useEffect } from 'react';
import { DetailedItinerary } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface LiveTripModalProps {
  itinerary: DetailedItinerary;
  onClose: () => void;
}

const LiveTripModal: React.FC<LiveTripModalProps> = ({ itinerary, onClose }) => {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const geoId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position.coords);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(`Location Error: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(geoId);
  }, []);

  // Find the next upcoming activity
  const nextStop = itinerary.days.flatMap(d => d.slots).find(s => s.place.name); // Simplified for demo

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-heading">Live Trip Tracking</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4 md:p-8">
            <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-dark rounded-lg overflow-hidden">
                <img src="https://picsum.photos/seed/map-view/800/600" alt="Map View" className="w-full h-full object-cover" />
                {/* Mock location markers */}
                <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-white/50 animate-pulse"></div>
                    <span className="text-xs font-bold bg-white/80 dark:bg-dark/80 px-2 py-1 rounded-md mt-2 block">You are here</span>
                </div>
                 {nextStop && (
                    <div className="absolute top-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2 text-center">
                         <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-white/50"></div>
                        <span className="text-xs font-bold bg-white/80 dark:bg-dark/80 px-2 py-1 rounded-md mt-2 block">Next: {nextStop.place.name}</span>
                    </div>
                )}
            </div>
            
            <div className="mt-6 p-4 bg-light dark:bg-dark rounded-lg">
                {loading && <div className="flex items-center gap-2"><Spinner className="w-5 h-5" /><span>Acquiring GPS signal...</span></div>}
                {error && <p className="text-red-500 font-semibold">{error}</p>}
                {location && (
                    <div className="text-center font-mono text-sm">
                        Lat: {location.latitude.toFixed(6)} | Lon: {location.longitude.toFixed(6)} | Accuracy: {location.accuracy.toFixed(0)}m
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default LiveTripModal;