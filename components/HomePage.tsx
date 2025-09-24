

import React, { useState } from 'react';
import { User, Guide, Page } from '../types';
import { mockGuides } from '../services/mockData';
import Button from './common/Button';
import GuideCard from './GuideCard';
import GuideDetailsModal from './GuideDetailsModal';

interface HomePageProps {
  user: User;
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onNavigate }) => {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const featuredGuides = mockGuides.filter(g => g.rating >= 4.9).slice(0, 4);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-2">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your next adventure in Maharashtra is just a click away.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={() => onNavigate(Page.TripPlanner)} size="md" variant="primary">
            Plan a New Trip
          </Button>
          <Button onClick={() => onNavigate(Page.Explore)} size="md" variant="secondary">
            Explore Destinations
          </Button>
        </div>
      </section>

      {/* Featured Guides Section */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-center">Top Rated Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} onViewDetails={setSelectedGuide} />
          ))}
        </div>
        <div className="text-center mt-8">
            <Button onClick={() => onNavigate(Page.Search)} variant="outline">View All Guides</Button>
        </div>
      </section>

       {/* Quick Actions Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center flex flex-col items-center">
            <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold font-heading">Find Local Stays</h3>
            <p className="text-gray-600 dark:text-gray-400 my-2 flex-grow">Discover unique hotels, homestays, and resorts.</p>
            <Button onClick={() => onNavigate(Page.Stays)} className="w-full mt-2">Browse Stays</Button>
        </div>
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center flex flex-col items-center">
            <div className="bg-secondary/10 text-secondary p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8c0 1.574-.512 3.042-1.395 4.28L21 20M12 7a2 2 0 100-4 2 2 0 000 4z" /></svg>
            </div>
            <h3 className="text-xl font-bold font-heading">Taste Local Cuisine</h3>
            <p className="text-gray-600 dark:text-gray-400 my-2 flex-grow">Book tables at top-rated restaurants and cafes.</p>
            <Button onClick={() => onNavigate(Page.Vendors)} className="w-full mt-2">Explore Food</Button>
        </div>
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center flex flex-col items-center">
            <div className="bg-accent/10 text-accent p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold font-heading">My Bookings</h3>
            <p className="text-gray-600 dark:text-gray-400 my-2 flex-grow">View and manage your upcoming and past trips.</p>
            <Button onClick={() => onNavigate(Page.Profile)} className="w-full mt-2">Go to Profile</Button>
        </div>
      </section>

      {selectedGuide && (
        <GuideDetailsModal 
            guide={selectedGuide} 
            onClose={() => setSelectedGuide(null)} 
            onBook={() => {
                // In a real app, this would open the booking modal
                console.log("Booking guide:", selectedGuide.name);
            }}
            user={user}
            allUsers={[]}
            addToast={() => {}}
        />
      )}
    </div>
  );
};

export default HomePage;
