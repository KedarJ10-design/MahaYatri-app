import React, { useState, useEffect, useCallback } from 'react';
import { PlaceSuggestion } from '../types';
import { generatePlaceSuggestions } from '../services/geminiService';
import Input from './common/Input';
import Button from './common/Button';
import Badge from './Badge';
import SkeletonLoader from './common/SkeletonLoader';

interface ExplorePageProps {
  onViewPlace: (place: PlaceSuggestion) => void;
  wishlist: PlaceSuggestion[];
  onToggleWishlist: (place: PlaceSuggestion) => void;
  initialDestination: string;
  onInitialDestinationConsumed: () => void;
}

const PlaceSuggestionCard: React.FC<{ place: PlaceSuggestion; onView: () => void; onToggleWishlist: () => void; isFavorite: boolean; }> = ({ place, onView, onToggleWishlist, isFavorite }) => {
    const typeColorMap = {
        'Attraction': 'blue',
        'Hidden Gem': 'green',
        'Restaurant': 'yellow',
        'Activity': 'red',
    } as const;
    
    return (
        <div className="bg-white dark:bg-dark-light rounded-xl shadow-md p-6 flex flex-col items-start gap-3 transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group dark:hover:shadow-primary/20">
            <div className="w-full flex justify-between items-start">
              <Badge color={typeColorMap[place.type] || 'gray'}>{place.type}</Badge>
              <button onClick={onToggleWishlist} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Save to wishlist">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
              </button>
            </div>
            <h3 className="text-xl font-bold font-heading text-dark dark:text-light group-hover:text-primary transition-colors">{place.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 flex-grow">{place.description}</p>
            <Button onClick={onView} variant="outline" className="w-full mt-2 py-2">View Details</Button>
        </div>
    );
}

const topDestinations = [
  { name: 'Mumbai', imageSeed: 'mumbai-city' },
  { name: 'Pune', imageSeed: 'pune-fort' },
  { name: 'Aurangabad', imageSeed: 'aurangabad-caves' },
  { name: 'Nashik', imageSeed: 'nashik-vineyard' },
  { name: 'Mahabaleshwar', imageSeed: 'mahabaleshwar-hills' },
  { name: 'Lonavala', imageSeed: 'lonavala-valley' },
];

const ExplorePage: React.FC<ExplorePageProps> = ({ onViewPlace, wishlist, onToggleWishlist, initialDestination, onInitialDestinationConsumed }) => {
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (dest: string) => {
    if (!dest) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const results = await generatePlaceSuggestions(dest);
      setSuggestions(results);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
      fetchSuggestions(initialDestination);
      onInitialDestinationConsumed();
    }
  }, [initialDestination, fetchSuggestions, onInitialDestinationConsumed]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuggestions(destination);
  };

  const handleDestinationClick = (destName: string) => {
    setDestination(destName);
    fetchSuggestions(destName);
  };
  
  const renderContent = () => {
      if (loading) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-light rounded-xl shadow-lg p-6 space-y-4">
                  <SkeletonLoader className="w-1/3 h-6" />
                  <SkeletonLoader type="title" className="w-2/3" />
                  <SkeletonLoader count={2} />
                  <SkeletonLoader className="h-10 mt-2" />
                </div>
              ))}
            </div>
          )
      }

      if (error) {
           return (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
                <p className="font-bold font-heading">Failed to get suggestions.</p>
                <p>{error}</p>
            </div>
           );
      }
      
      if (suggestions.length > 0) {
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                  {suggestions.map((place, i) => {
                    const isFavorite = wishlist.some(item => item.name === place.name && item.destination === place.destination);
                    return (
                      <PlaceSuggestionCard 
                        key={i} 
                        place={place} 
                        onView={() => onViewPlace(place)}
                        onToggleWishlist={() => onToggleWishlist(place)}
                        isFavorite={isFavorite}
                      />
                    )
                  })}
              </div>
          )
      }
      
      return (
         <div className="animate-fade-in">
            <h2 className="text-3xl font-bold font-heading mb-6 text-center text-dark dark:text-light">Top Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topDestinations.map(dest => (
                <button 
                    key={dest.name} 
                    onClick={() => handleDestinationClick(dest.name)} 
                    className="relative rounded-xl overflow-hidden h-64 group text-white font-bold text-2xl shadow-md transform hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50"
                >
                    <img src={`https://picsum.photos/seed/${dest.imageSeed}/600/400`} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 group-hover:from-black/80 transition-colors">
                    <h3 className='font-heading transition-colors group-hover:text-primary'>{dest.name}</h3>
                    </div>
                </button>
                ))}
            </div>
        </div>
      )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg mb-8">
        <h1 className="text-4xl font-extrabold font-heading text-center text-dark dark:text-light mb-2">Explore Maharashtra</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Get smart travel suggestions powered by AI. Select a top destination or enter your own.</p>
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <Input 
            label="Enter a Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Nashik, Aurangabad..."
          />
          <Button type="submit" disabled={loading || !destination} className="w-full sm:w-auto flex-shrink-0 text-md py-3">
             {loading ? 'Discovering...' : 'Get Suggestions'}
          </Button>
        </form>
      </div>
      
      {renderContent()}

    </div>
  );
};

export default ExplorePage;