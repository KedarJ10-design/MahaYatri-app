import React, { useState, useEffect } from 'react';
import { PlaceSuggestion, PlaceDetails } from '../types';
import { generatePlaceDetails } from '../services/geminiService';
import Button from './common/Button';
import Badge from './Badge';
import SkeletonLoader from './common/SkeletonLoader';

interface PlaceDetailsModalProps {
  place: PlaceSuggestion;
  onClose: () => void;
  onToggleWishlist: (place: PlaceSuggestion) => void;
}

const DetailSection: React.FC<{title: string; icon: React.ReactNode, children: React.ReactNode}> = ({ title, icon, children }) => (
    <div>
        <h4 className="flex items-center text-lg font-semibold font-heading text-dark dark:text-light mb-2">
            {icon}
            <span className="ml-2">{title}</span>
        </h4>
        <div className="text-gray-600 dark:text-gray-300 space-y-1">{children}</div>
    </div>
);


const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({ place, onClose, onToggleWishlist }) => {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await generatePlaceDetails(place.name, place.destination);
        setDetails(result);
      } catch (err: any) {
        setError(err.message || "Could not fetch details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [place.name, place.destination]);
  
  const renderContent = () => {
      if (loading) {
          return (
            <div className="space-y-6">
                <div>
                    <SkeletonLoader className="h-6 w-1/3 mb-2" />
                    <SkeletonLoader count={2} />
                </div>
                 <div>
                    <SkeletonLoader className="h-6 w-1/3 mb-2" />
                    <SkeletonLoader count={1} />
                </div>
                 <div>
                    <SkeletonLoader className="h-6 w-1/3 mb-2" />
                    <SkeletonLoader count={3} />
                </div>
            </div>
          )
      }
      
      if (error) {
          return (
             <div className="bg-red-100 text-red-700 p-4 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
                <p className="font-bold font-heading">Error loading details:</p>
                <p>{error}</p>
            </div>
          )
      }
      
      if (details) {
          return (
            <div className="space-y-6">
                <DetailSection title="Best Time to Visit" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                    <p>{details.bestTimeToVisit}</p>
                </DetailSection>
                <DetailSection title="Typical Weather" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>}>
                    <p>{details.weather}</p>
                </DetailSection>
                <DetailSection title="Local Specialties" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V8.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v7.092zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
                    <div className="flex flex-wrap gap-2">{details.specialties.map(s => <Badge key={s} color="blue">{s}</Badge>)}</div>
                </DetailSection>
                <DetailSection title="Traveler's Tips" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                    <ul className="list-disc list-inside">
                        {details.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </DetailSection>
            </div>
          )
      }
      return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-details-title"
    >
      <div 
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
            <div>
                <h2 id="place-details-title" className="text-2xl font-bold font-heading text-dark dark:text-light">{place.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{place.destination}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto">
            {renderContent()}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-between items-center">
            <Button variant="ghost" onClick={() => onToggleWishlist(place)} className="flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${place.isFavorite ? 'text-red-500' : 'text-gray-500'}`} fill={place.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
                {place.isFavorite ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </Button>
            <Button variant="primary" onClick={onClose}>Done</Button>
        </div>

      </div>
    </div>
  );
};

export default PlaceDetailsModal;