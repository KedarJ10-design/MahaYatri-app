import React, { useState } from 'react';
import { PlaceSuggestion, DetailedItinerary, User } from '../types';
import { generateCustomItinerary } from '../services/geminiService';
import { saveItinerary } from '../services/db';
import Input from './common/Input';
import Button from './common/Button';
import CountdownLoader from './common/CountdownLoader';

interface TripPlannerPageProps {
  onItineraryGenerated: (itinerary: DetailedItinerary) => void;
  user: User;
}

interface CustomizationParams {
  days: number;
  mustVisit: { name: string; destination: string }[];
  interests: string[];
  adults: number;
  children: number;
  seniors: number;
  budgetStyle: 'budget' | 'mid-range' | 'luxury';
}

const TripPlannerPage: React.FC<TripPlannerPageProps> = ({ onItineraryGenerated, user }) => {
  const [params, setParams] = useState<CustomizationParams>({
    days: 3,
    mustVisit: [{ name: '', destination: '' }],
    interests: user.preferences.length > 0 ? user.preferences : ['Historical Sites', 'Local Cuisine'],
    adults: 2,
    children: 0,
    seniors: 0,
    budgetStyle: 'mid-range',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (field: keyof CustomizationParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleMustVisitChange = (index: number, field: 'name' | 'destination', value: string) => {
    const newMustVisit = [...params.mustVisit];
    newMustVisit[index] = { ...newMustVisit[index], [field]: value };
    handleParamChange('mustVisit', newMustVisit);
  };
  
  const handleInterestToggle = (interest: string) => {
    const newInterests = params.interests.includes(interest)
      ? params.interests.filter(i => i !== interest)
      : [...params.interests, interest];
    handleParamChange('interests', newInterests);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.mustVisit[0]?.destination) {
        setError("Please enter at least one primary destination.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      let itinerary = await generateCustomItinerary(params);
      // Add a mock map image URL for offline caching
      const destinationSlug = params.mustVisit[0].destination.toLowerCase().replace(/\s+/g, '-');
      itinerary.mapImageUrl = `https://picsum.photos/seed/${destinationSlug}-map/800/600`;
      
      await saveItinerary(itinerary); // Save to IndexedDB for offline access
      onItineraryGenerated(itinerary);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred while planning your trip.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const interestOptions = ['Historical Sites', 'Local Cuisine', 'Nature Walks', 'Trekking', 'Spiritual Sites', 'Shopping', 'Adventure Sports'];

  if (loading) {
    return <CountdownLoader />;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-2">AI Trip Planner</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Let's craft your perfect Maharashtra adventure in seconds.</p>
      </div>
      
      <form onSubmit={handleGenerate} className="mt-8 bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg space-y-8">
        
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4 border-b pb-2">Your Destination</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Primary Destination" placeholder="e.g., Pune" value={params.mustVisit[0].destination} onChange={(e) => handleMustVisitChange(0, 'destination', e.target.value)} required />
            <Input label="Must-Visit Place (Optional)" placeholder="e.g., Shaniwar Wada" value={params.mustVisit[0].name} onChange={(e) => handleMustVisitChange(0, 'name', e.target.value)} />
          </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold font-heading mb-4 border-b pb-2">Trip Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input label="Duration (days)" type="number" min="1" max="14" value={params.days} onChange={e => handleParamChange('days', Number(e.target.value))} />
                <Input label="Adults" type="number" min="1" value={params.adults} onChange={e => handleParamChange('adults', Number(e.target.value))} />
                <Input label="Children" type="number" min="0" value={params.children} onChange={e => handleParamChange('children', Number(e.target.value))} />
                <Input label="Seniors" type="number" min="0" value={params.seniors} onChange={e => handleParamChange('seniors', Number(e.target.value))} />
            </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold font-heading mb-4 border-b pb-2">Your Style</h2>
            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Travel Interests</label>
                 <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                        <button type="button" key={interest} onClick={() => handleInterestToggle(interest)} className={`px-3 py-2 text-sm rounded-full border-2 transition-all transform hover:-translate-y-px ${params.interests.includes(interest) ? 'bg-primary text-white border-primary hover:bg-primary/90' : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white dark:text-orange-400 dark:border-orange-400 dark:hover:bg-primary dark:hover:text-white'}`}>
                            {interest}
                        </button>
                    ))}
                 </div>
            </div>
             <div className="mt-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget Style</label>
                 <div className="flex justify-center bg-light dark:bg-dark p-1 rounded-full">
                    {(['budget', 'mid-range', 'luxury'] as const).map(style => (
                        <button type="button" key={style} onClick={() => handleParamChange('budgetStyle', style)} className={`w-1/3 px-3 py-2 text-sm rounded-full font-semibold transition-colors capitalize ${params.budgetStyle === style ? 'bg-primary text-white shadow hover:bg-primary/90' : 'text-gray-600 dark:text-gray-300 hover:bg-primary/20'}`}>
                            {style}
                        </button>
                    ))}
                 </div>
            </div>
        </section>

        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg dark:bg-red-900/30 dark:text-red-300" role="alert">
                <p className="font-bold">Oops!</p>
                <p>{error}</p>
            </div>
        )}

        <div className="text-center pt-4">
            <Button type="submit" className="text-lg w-full md:w-auto" disabled={loading}>
                Generate My Itinerary
            </Button>
        </div>
      </form>
    </div>
  );
};

export default TripPlannerPage;