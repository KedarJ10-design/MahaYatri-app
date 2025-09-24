

import React from 'react';
import { Guide, Page, User } from '../types';
import Button from './common/Button';
import GuideCard from './GuideCard';

interface HomePageProps {
  user: User;
  guides: Guide[];
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, guides, onNavigate }) => {
  const featuredGuides = guides.filter(g => g.verificationStatus === 'verified').slice(0, 3);

  return (
    <div className="animate-fade-in space-y-12">
      {/* Hero Section */}
      <section className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-8 rounded-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-dark dark:text-light">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your next adventure in the heart of Maharashtra is just a click away.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Button onClick={() => onNavigate(Page.TripPlanner)} size="md" className="text-lg">
            Plan a New Trip
          </Button>
          <Button onClick={() => onNavigate(Page.Search)} variant="outline" size="md" className="text-lg">
            Find a Local Guide
          </Button>
        </div>
      </section>

      {/* Featured Guides Section */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-center">Featured Guides</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredGuides.map(guide => (
            <li key={guide.id}>
                <GuideCard guide={guide} onViewDetails={() => onNavigate(Page.Search)} />
            </li>
          ))}
        </ul>
      </section>
      
      {/* Call to Action Section */}
      <section className="text-center">
         <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold font-heading">Explore Places with AI</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Get AI-powered suggestions for hidden gems, local eateries, and exciting activities.
            </p>
            <Button onClick={() => onNavigate(Page.Explore)} className="mt-6">Start Exploring</Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;