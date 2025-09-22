import React from 'react';
import { DetailedItinerary, ItineraryDayDetailed, ItinerarySlot, TravelInfo, User } from '../types';
import Button from './common/Button';
import Badge from './Badge';

interface ItineraryPageProps {
  itinerary: DetailedItinerary;
  onBack: () => void;
  user: User;
  onEstimateCost: () => void;
  onUpgrade: () => void;
  onStartTrip: () => void;
}

const TravelInfoCard: React.FC<{ travel: TravelInfo }> = ({ travel }) => (
    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3 border-t border-dashed pt-3">
        <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            <span>{travel.distance_km} km</span>
        </div>
        <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>~{travel.duration_min} min</span>
        </div>
    </div>
);

const SlotCard: React.FC<{ slot: ItinerarySlot }> = ({ slot }) => (
    <div className="bg-light dark:bg-dark rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <p className="font-bold text-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                {slot.timeWindow}
            </p>
            {slot.estimated_cost > 0 && <Badge color="green">₹{slot.estimated_cost}</Badge>}
        </div>
        <h4 className="text-xl font-semibold mt-2 font-heading">{slot.place.name}</h4>
        <p className="text-gray-700 dark:text-gray-300 mt-1">{slot.activity}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2 p-3 bg-gray-100 dark:bg-dark-light rounded-md">"{slot.notes}"</p>
        {slot.travel.duration_min > 0 && <TravelInfoCard travel={slot.travel} />}
    </div>
);


const DayTimeline: React.FC<{ day: ItineraryDayDetailed }> = ({ day }) => (
    <div>
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary text-white w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold flex-shrink-0 shadow-md">
                <span className="text-xs tracking-wider">DAY</span>
                <span className="text-2xl font-heading">{day.day}</span>
            </div>
            <div>
                <h3 className="text-2xl font-bold font-heading">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>
        </div>
        <div className="border-l-2 border-primary/30 ml-7 pl-10 space-y-6 relative">
             {day.slots.map((slot, index) => (
                <div key={index} className="relative">
                    <div className="absolute -left-[49px] top-5 h-4 w-4 rounded-full bg-primary border-4 border-white dark:border-dark-light ring-4 ring-primary/30"></div>
                    <SlotCard slot={slot} />
                </div>
            ))}
        </div>
    </div>
);


const ItineraryPage: React.FC<ItineraryPageProps> = ({ itinerary, onBack, user, onEstimateCost, onUpgrade, onStartTrip }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg mb-8">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                    <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-2">Your Custom Itinerary</h1>
                    <p className="text-gray-600 dark:text-gray-400">{itinerary.summary}</p>
                </div>
                 <div className="flex-shrink-0 flex flex-col gap-2">
                    <Button variant="outline" onClick={onBack}>Back</Button>
                    <Button variant="primary" onClick={onStartTrip}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Start Live Trip
                    </Button>
                </div>
            </div>
             <div className="mt-6 p-4 bg-primary/10 rounded-lg flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h3 className="text-xl font-bold font-heading text-dark dark:text-light">Total Estimated Cost</h3>
                    <p className="text-2xl font-extrabold text-primary">₹{itinerary.total_estimated_cost.toLocaleString('en-IN')}</p>
                </div>
                {user.isPro ? (
                    <Button onClick={onEstimateCost} variant="secondary">Get Cost Breakdown</Button>
                ) : (
                    <Button onClick={onUpgrade} variant="secondary" className="animate-pulse-subtle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                        Upgrade for Cost Breakdown
                    </Button>
                )}
             </div>
        </div>
        
        <div className="space-y-12">
            {itinerary.days.map(day => <DayTimeline key={day.day} day={day} />)}
        </div>
    </div>
  );
};

export default ItineraryPage;