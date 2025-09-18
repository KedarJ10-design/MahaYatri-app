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
            style={{ backgroundImage: "url('https://picsum.photos/seed/maharashtra-landscape/1200/500')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-white mb-4 animate-slide-up">Explore Maharashtra with a Local</h1>
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
        <h2 className="text-3xl font-bold font-heading mb-6 text-center text-dark dark:text-light">Featured Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} onViewDetails={() => onViewGuide(guide)} />
          ))}
        </div>
      </section>
      
      {/* AI Trip Planner CTA */}
      <section className="bg-gradient-to-r from-accent to-teal-500 text-white p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div>
            <h2 className="text-3xl font-bold font-heading mb-2">Can't decide where to go?</h2>
            <p className="text-lg opacity-90">Let our AI Trip Planner create a personalized itinerary for you in seconds!</p>
        </div>
        <Button onClick={() => onNavigate(Page.TripPlanner)} variant="secondary" className="mt-6 md:mt-0 text-lg">
          Plan My Trip
        </Button>
      </section>
      
      {/* New Features CTA */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative rounded-xl overflow-hidden h-72 group">
            <img src="https://picsum.photos/seed/maharashtrian-food/600/400" alt="Local Food" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-4 text-center text-white">
                <h3 className="text-3xl font-bold font-heading mb-3">Taste Local Flavors</h3>
                <p className="mb-6">Discover the best authentic food from local vendors.</p>
                <Button onClick={() => onNavigate(Page.Vendors)} variant="outline" className="text-white border-white hover:bg-white hover:text-dark dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-dark">Find Eateries</Button>
            </div>
        </div>
        <div className="relative rounded-xl overflow-hidden h-72 group">
            <img src="https://picsum.photos/seed/maharashtra-homestay/600/400" alt="Homestay" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-4 text-center text-white">
                <h3 className="text-3xl font-bold font-heading mb-3">Find Comfortable Stays</h3>
                <p className="mb-6">Book hotels and homestays approved by locals.</p>
                <Button onClick={() => onNavigate(Page.Stays)} variant="outline" className="text-white border-white hover:bg-white hover:text-dark dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-dark">Find Stays</Button>
            </div>
        </div>
      </section>


      {/* Popular Destinations Section */}
      <section>
        <h2 className="text-3xl font-bold font-heading mb-6 text-center text-dark dark:text-light">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Mumbai-Gateway', 'Pune-Fort', 'Aurangabad-Caves', 'Nashik-Vineyard', 'Mahabaleshwar-Hills', 'Lonavala-Valley'].map(item => {
            const cityName = item.split('-')[0];
            return (
                <div key={item} className="relative rounded-xl shadow-lg overflow-hidden h-64 group">
                    <img src={`https://picsum.photos/seed/${item.toLowerCase()}/600/400`} alt={cityName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 group-hover:from-black/80" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                        <h3 className="text-2xl font-bold font-heading transform transition-transform duration-300 group-hover:-translate-y-1">{cityName}</h3>
                        <p className="text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">Explore destination &rarr;</p>
                    </div>
                </div>
            )
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;