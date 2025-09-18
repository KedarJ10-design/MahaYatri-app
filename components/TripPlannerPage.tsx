import React, { useState } from 'react';
import { generateItinerary } from '../services/geminiService';
import { Itinerary, User } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Spinner from './common/Spinner';
import Badge from './Badge';

interface TripPlannerPageProps {
  user: User;
  onEstimateCost: (itinerary: Itinerary) => void;
}

const TripPlannerPage: React.FC<TripPlannerPageProps> = ({ user, onEstimateCost }) => {
  const [destination, setDestination] = useState('Mumbai');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState('history, food, and culture');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const result = await generateItinerary(destination, days, interests);
      setItinerary(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg mb-8">
        <h1 className="text-4xl font-extrabold font-heading text-center text-dark dark:text-light mb-2">AI Trip Planner</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Let's craft your perfect Maharashtra adventure!</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <Input 
            label="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Pune"
            required
          />
          <Input
            label="Number of Days"
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            min="1"
            max="14"
            required
          />
           <Input 
            label="Interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., Trekking, Temples"
            required
          />
          <div className="md:col-span-3">
             <Button type="submit" disabled={loading} className="w-full text-lg">
                {loading ? 'Generating...' : 'Generate Itinerary'}
             </Button>
          </div>
        </form>
      </div>

      {loading && <Spinner />}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
          <p className="font-bold font-heading">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}

      {itinerary && (
        <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold font-heading text-primary">{`Your ${itinerary.duration}-Day Trip to ${itinerary.destination}`}</h2>
            </div>
            <div className="flex items-center gap-2">
              {!user.isPro && <Badge color="yellow">PRO</Badge>}
              <Button variant='secondary' onClick={() => onEstimateCost(itinerary)}>
                Estimate Trip Cost
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {itinerary.itinerary.map((dayPlan) => (
              <div key={dayPlan.day} className="border-l-4 border-accent pl-6 py-4 bg-light dark:bg-dark rounded-r-lg">
                <h3 className="text-2xl font-semibold font-heading text-dark dark:text-light">{`Day ${dayPlan.day}: ${dayPlan.title}`}</h3>
                <ul className="mt-2 list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  {dayPlan.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlannerPage;