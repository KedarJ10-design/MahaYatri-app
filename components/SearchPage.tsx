import React, { useState, useMemo } from 'react';
import { Guide } from '../types';
import GuideCard from './GuideCard';
import Input from './common/Input';

interface SearchPageProps {
  onViewGuide: (guide: Guide) => void;
  guides: Guide[];
}

const SearchPage: React.FC<SearchPageProps> = ({ onViewGuide, guides }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');

  const availableLocations = useMemo(() => [...new Set(guides.map(g => g.location))], [guides]);
  const availableSpecialties = useMemo(() => [...new Set(guides.flatMap(g => g.specialties))], [guides]);

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const nameMatch = guide.name.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = location ? guide.location === location : true;
      const specialtyMatch = specialty ? guide.specialties.includes(specialty) : true;
      return nameMatch && locationMatch && specialtyMatch && guide.verificationStatus === 'verified';
    });
  }, [guides, searchTerm, location, specialty]);

  return (
    <div className="animate-fade-in">
      <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold font-heading mb-4">Find Your Perfect Guide</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="" type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <div>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full p-3 h-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition"
            >
              <option value="">All Locations</option>
              {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="w-full p-3 h-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition"
            >
              <option value="">All Specialties</option>
              {availableSpecialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} onViewDetails={onViewGuide} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Guides Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
