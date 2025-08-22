import React from 'react';
import { DetailedItinerary, ItineraryDayDetailed, ItinerarySlot, TravelInfo } from '../types';
import Button from './common/Button';
import Badge from './Badge';

interface ItineraryPageProps {
  itinerary: DetailedItinerary;
  onBack: () => void;
}

const TravelInfoCard: React.FC<{ travel: TravelInfo }> = ({ travel }) => (
    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2 border-t border-dashed pt-2">
        <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            <span>{travel.distance_km} km</span>
        </div>
        <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>~{travel.duration_min} min</span>
        </div>
    </div>
);

const SlotCard: React.FC<{ slot: ItinerarySlot }> = ({ slot }) => (
    <div className="bg-light dark:bg-dark rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start">
            <p className="font-bold text-primary">{slot.timeWindow}</p>
            {slot.estimated_cost > 0 && <Badge color="green">₹{slot.estimated_cost}</Badge>}
        </div>
        <h4 className="text-xl font-semibold mt-1">{slot.place.name}</h4>
        <p className="text-gray-700 dark:text-gray-300">{slot.activity}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">"{slot.notes}"</p>
        {slot.travel.duration_min > 0 && <TravelInfoCard travel={slot.travel} />}
    </div>
);


const DayTimeline: React.FC<{ day: ItineraryDayDetailed }> = ({ day }) => (
    <div>
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary text-white w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold flex-shrink-0">
                <span className="text-xs">DAY</span>
                <span className="text-2xl">{day.day}</span>
            </div>
            <div>
                <h3 className="text-2xl font-bold">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>
        </div>
        <div className="border-l-2 border-primary/30 ml-7 pl-10 space-y-4">
            {day.slots.map((slot, index) => <SlotCard key={index} slot={slot} />)}
        </div>
    </div>
);


const ItineraryPage: React.FC<ItineraryPageProps> = ({ itinerary, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark dark:text-light mb-2">Your Custom Itinerary</h1>
                    <p className="text-gray-600 dark:text-gray-400">{itinerary.summary}</p>
                </div>
                <Button variant="outline" onClick={onBack}>Back</Button>
            </div>
             <div className="mt-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                <h3 className="text-xl font-bold text-dark dark:text-light">Total Estimated Cost</h3>
                <p className="text-2xl font-extrabold text-primary">₹{itinerary.total_estimated_cost.toLocaleString('en-IN')}</p>
             </div>
        </div>
        
        <div className="space-y-8">
            {itinerary.days.map(day => <DayTimeline key={day.day} day={day} />)}
        </div>
    </div>
  );
};

export default ItineraryPage;
