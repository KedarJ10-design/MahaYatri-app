
import React, { useState, useMemo, useEffect } from 'react';
import { Guide, User, Review } from '../types';
import GuideCard from './GuideCard';
import Input from './common/Input';
import Button from './common/Button';
import PriceRangeSlider from './common/PriceRangeSlider';
import GuideDetailsModal from './GuideDetailsModal';
import MapSearchView from './MapSearchView';
import GuideCardSkeleton from './skeletons/GuideCardSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/appStore';

interface SearchPageProps {
  onBook: (guide: Guide) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onBook }) => {
  const { guides: initialGuides, allUsers } = useAppStore();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Assume user is always available here

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('all');
  const [specialty, setSpecialty] = useState('all');
  const [maxPrice, setMaxPrice] = useState(10000);

  // Load guides (simulated)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
        setGuides(initialGuides);
        setLoading(false);
    }, 500);
  }, [initialGuides]);

  const { uniqueLocations, uniqueSpecialties, maxPriceValue } = useMemo(() => {
    const locations = [...new Set(initialGuides.map(g => g.location))].sort();
    const specialties = [...new Set(initialGuides.flatMap(g => g.specialties))].sort();
    const max = Math.max(...initialGuides.map(g => g.pricePerDay), 5000);
    return {
      uniqueLocations: locations,
      uniqueSpecialties: specialties,
      maxPriceValue: Math.ceil(max / 1000) * 1000, // Round up to nearest 1000
    };
  }, [initialGuides]);

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const searchTermMatch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              guide.bio.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = location === 'all' || guide.location === location;
      const specialtyMatch = specialty === 'all' || guide.specialties.includes(specialty);
      const priceMatch = guide.pricePerDay <= maxPrice;
      return searchTermMatch && locationMatch && specialtyMatch && priceMatch;
    });
  }, [guides, searchTerm, location, specialty, maxPrice]);
  
  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    // In a real app, this would be passed down or come from a context.
    console.log(`[Toast: ${type}] ${message}`);
  }

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in h-full">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg sticky top-24">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="space-y-4">
            <Input label="" type="search" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <select value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light ...">
                <option value="all">All Locations</option>
                {/* FIX: Explicitly cast `loc` to string to resolve type errors. */}
                {uniqueLocations.map(loc => <option key={String(loc)} value={String(loc)}>{String(loc)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light ...">
                <option value="all">All Specialties</option>
                {/* FIX: Explicitly cast `spec` to string to resolve type errors. */}
                {uniqueSpecialties.map(spec => <option key={String(spec)} value={String(spec)}>{String(spec)}</option>)}
              </select>
            </div>
            <PriceRangeSlider label="Max Price per Day" min={1000} max={maxPriceValue} step={500} value={maxPrice} onChange={setMaxPrice} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-heading">
            {viewMode === 'grid' ? `Showing ${filteredGuides.length} Guides` : 'Map View'}
          </h1>
          <div className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-dark-lighter rounded-lg">
             <Button size="sm" variant={viewMode === 'grid' ? 'primary' : 'ghost'} onClick={() => setViewMode('grid')}>Grid</Button>
             <Button size="sm" variant={viewMode === 'map' ? 'primary' : 'ghost'} onClick={() => setViewMode('map')}>Map</Button>
          </div>
        </div>
        
        {viewMode === 'grid' ? (
            loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <GuideCardSkeleton key={i} />)}
                </div>
            ) : filteredGuides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGuides.map(guide => (
                        <GuideCard key={guide.id} guide={guide} onViewDetails={setSelectedGuide} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl text-gray-500">No guides found matching your criteria.</p>
                </div>
            )
        ) : (
            <div className="h-[70vh] rounded-2xl overflow-hidden shadow-lg">
                <MapSearchView guides={filteredGuides} onMarkerClick={setSelectedGuide} />
            </div>
        )}
      </main>

      {selectedGuide && (
        <GuideDetailsModal 
            guide={selectedGuide} 
            onClose={() => setSelectedGuide(null)} 
            onBook={() => {
                onBook(selectedGuide);
                setSelectedGuide(null);
            }}
            user={user}
            allUsers={allUsers}
            addToast={addToast}
        />
      )}
    </div>
  );
};

export default SearchPage;
