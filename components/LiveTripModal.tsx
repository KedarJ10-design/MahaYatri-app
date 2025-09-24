
import React, { useState, useEffect } from 'react';
import { DetailedItinerary } from '../types';
import Button from './common/Button';

interface LiveTripModalProps {
  itinerary: DetailedItinerary;
  onClose: () => void;
}

const LiveTripModal: React.FC<LiveTripModalProps> = ({ itinerary, onClose }) => {
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const allSlots = itinerary.days.flatMap(day => day.slots.map(slot => ({ ...slot, day: day.day })));
  const currentSlot = allSlots[currentSlotIndex];
  
  // This is a mock progression. In a real app, this would be driven by time or GPS.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlotIndex(prev => (prev + 1) % allSlots.length);
    }, 30000); // Advance every 30 seconds for demo
    return () => clearInterval(interval);
  }, [allSlots.length]);

  if (!currentSlot) {
    return null; // Should not happen if itinerary exists
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b bg-primary/10 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Live Trip in Progress</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
          <p className="text-primary font-semibold">Day {currentSlot.day} of {itinerary.days.length}</p>
        </div>
        
        <div className="p-6">
            <div className="text-center mb-6">
                <p className="text-lg text-gray-500 dark:text-gray-400">Up Next ({currentSlot.timeWindow})</p>
                <h3 className="text-3xl font-bold font-heading mt-1">{currentSlot.place.name}</h3>
                <p className="mt-2 text-xl">{currentSlot.activity}</p>
            </div>
            
            <div className="p-4 bg-light dark:bg-dark rounded-lg">
                <h4 className="font-semibold mb-2">Travel Info</h4>
                {currentSlot.travel.duration_min > 0 ? (
                    <div className="flex justify-around text-center">
                        <div>
                            <p className="text-xs text-gray-500">From</p>
                            <p className="font-medium">{currentSlot.travel.from}</p>
                        </div>
                        <div className="flex items-center text-primary">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">To</p>
                            <p className="font-medium">{currentSlot.travel.to}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">ETA</p>
                            <p className="font-medium">~{currentSlot.travel.duration_min} min</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">You've arrived at your destination.</p>
                )}
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-center">
            <Button variant="danger" className="w-full text-lg py-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Emergency SOS
            </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveTripModal;
