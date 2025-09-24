import React, { useState, useEffect, useRef } from 'react';
import { PlaceSuggestion, PlaceDetails } from '../types';
import { generatePlaceDetails } from '../services/geminiService';
import Button from './common/Button';
import Badge from './Badge';
import PlaceDetailsSkeleton from './skeletons/PlaceDetailsSkeleton';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface PlaceDetailsModalProps {
  place: PlaceSuggestion;
  onClose: () => void;
}

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <div className="flex items-center gap-3 mb-2">
            <div className="text-primary bg-primary/10 p-2 rounded-full">{icon}</div>
            <h3 className="text-xl font-bold font-heading">{title}</h3>
        </div>
        <div className="pl-12 text-gray-600 dark:text-gray-300">{children}</div>
    </div>
);

const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({ place, onClose }) => {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useFocusTrap(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generatePlaceDetails(place.name, place.destination);
        setDetails(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load details.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [place]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-details-title"
      >
        <div className="p-6 border-b">
          <h2 id="place-details-title" className="text-2xl font-bold">{place.name}</h2>
          <p className="text-gray-500">{place.destination}</p>
        </div>
        <div className="p-6 space-y-6 min-h-[200px]">
          {isLoading && <PlaceDetailsSkeleton />}
          {error && <p className="text-red-500">{error}</p>}
          {details && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              <DetailSection title="Best Time to Visit" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                <p>{details.bestTimeToVisit}</p>
              </DetailSection>
              <DetailSection title="Local Specialties" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}>
                <div className="flex flex-wrap gap-2">
                    {details.specialties.map(s => <Badge key={s}>{s}</Badge>)}
                </div>
              </DetailSection>
              <DetailSection title="Traveler Tips" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                <ul className="list-disc list-inside space-y-1">
                    {details.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </DetailSection>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end">
          <Button ref={closeButtonRef} onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailsModal;