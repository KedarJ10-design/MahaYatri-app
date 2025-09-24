import React, { useState, useCallback } from 'react';
import { PlaceSuggestion, PlaceDetails } from '../types';
import { generatePlaceSuggestions } from '../services/geminiService';
import Button from './common/Button';
import PlaceDetailsModal from './PlaceDetailsModal';
import PlaceSuggestionCardSkeleton from './skeletons/PlaceSuggestionCardSkeleton';

const destinations = ['Mumbai', 'Pune', 'Aurangabad', 'Nashik', 'Nagpur'];

const PlaceSuggestionCard: React.FC<{
  suggestion: PlaceSuggestion;
  onViewDetails: (suggestion: PlaceSuggestion) => void;
}> = ({ suggestion, onViewDetails }) => (
  <div className="bg-white dark:bg-dark-light rounded-xl shadow-md p-6 flex flex-col items-start gap-3 h-full transform hover:-translate-y-1 transition-transform hover:shadow-xl">
    <span className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full">{suggestion.type}</span>
    <h3 className="text-xl font-bold font-heading">{suggestion.name}</h3>
    <p className="text-gray-600 dark:text-gray-400 flex-grow">{suggestion.description}</p>
    <Button onClick={() => onViewDetails(suggestion)} className="w-full mt-2">Learn More</Button>
  </div>
);

const ExplorePage: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState(destinations[0]);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeToView, setPlaceToView] = useState<PlaceSuggestion | null>(null);

  const fetchSuggestions = useCallback(async (destination: string) => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const results = await generatePlaceSuggestions(destination);
      setSuggestions(results);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch suggestions.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDestinationClick = (destination: string) => {
    setSelectedDestination(destination);
    fetchSuggestions(destination);
  };

  // Fetch initial suggestions on mount
  useState(() => {
    fetchSuggestions(selectedDestination);
  });

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-2">Explore Maharashtra</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Discover hidden gems and local favorites with our AI guide.</p>
      </div>

      <div className="my-8 flex justify-center flex-wrap gap-2">
        {destinations.map(dest => (
          <button
            key={dest}
            onClick={() => handleDestinationClick(dest)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedDestination === dest ? 'bg-primary text-white' : 'bg-white dark:bg-dark-light hover:bg-primary/20'}`}
          >
            {dest}
          </button>
        ))}
      </div>

      <div>
        {error && <p className="text-center text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <PlaceSuggestionCardSkeleton key={i} />)
            : suggestions.map((suggestion, index) => (
              <PlaceSuggestionCard key={index} suggestion={suggestion} onViewDetails={setPlaceToView} />
            ))}
        </div>
      </div>
      
      {placeToView && <PlaceDetailsModal place={placeToView} onClose={() => setPlaceToView(null)} />}
    </div>
  );
};

export default ExplorePage;