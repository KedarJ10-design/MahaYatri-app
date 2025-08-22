import React from 'react';
import { Page, Guide } from '../types';
import Button from './common/Button';
import GuideCard from './GuideCard';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onViewGuide: (guide: Guide) => void;
  guides: Guide[];
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onViewGuide, guides }) => {
  const featuredGuides = guides.filter(g => g.verificationStatus === 'verified').slice(0, 4);
  
  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-96 rounded-2xl overflow-hidden">
         <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed" 
            style={{ backgroundImage: "url('https://picsum.photos/seed/hero-maharashtra/1200/500')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 animate-slide-up">Explore Maharashtra with a Local</h1>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>Discover hidden gems, authentic culture, and unforgettable experiences with our verified local guides.</p>
          <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Button onClick={() => onNavigate(Page.Search)} variant="primary" className="text-lg">
                Find Your Perfect Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Guides Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center text-dark dark:text-light">Featured Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} onViewDetails={() => onViewGuide(guide)} />
          ))}
        </div>
      </section>
      
      {/* AI Trip Planner CTA */}
      <section className="bg-gradient-to-r from-accent to-teal-500 text-white p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div>
            <h2 className="text-3xl font-bold mb-2">Can't decide where to go?</h2>
            <p className="text-lg opacity-90">Let our AI Trip Planner create a personalized itinerary for you in seconds!</p>
        </div>
        <Button onClick={() => onNavigate(Page.TripPlanner)} variant="secondary" className="mt-6 md:mt-0 text-lg">
          Plan My Trip
        </Button>
      </section>

      {/* Popular Destinations Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center text-dark dark:text-light">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Mumbai', 'Pune', 'Aurangabad', 'Nashik', 'Mahabaleshwar', 'Lonavala'].map(city => (
            <div key={city} className="relative rounded-xl overflow-hidden h-64 group">
              <img src={`https://picsum.photos/seed/${city.toLowerCase()}/600/400`} alt={city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-4">
                <h3 className="text-2xl font-bold text-white">{city}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;