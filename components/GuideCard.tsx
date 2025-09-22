import React from 'react';
import { Guide } from '../types';
import Button from './common/Button';
import StarRating from './StarRating';
import Badge from './Badge';

interface GuideCardProps {
  guide: Guide;
  onViewDetails: (guide: Guide) => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, onViewDetails }) => {
  return (
    <div className="bg-white dark:bg-dark-light rounded-xl shadow-md overflow-hidden flex flex-col transform hover:-translate-y-1 transition-all duration-300 group hover:shadow-xl dark:hover:shadow-primary/20">
      <div className="relative overflow-hidden">
        <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" src={guide.avatarUrl} alt={guide.name} />
        {guide.verificationStatus === 'verified' && (
          <div className="absolute top-2 right-2">
             <Badge color="green">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
             </Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold font-heading text-dark dark:text-light group-hover:text-primary transition-colors">{guide.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{guide.location}</p>
        <div className="flex items-center mb-3">
          <StarRating rating={guide.rating} />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({guide.reviewCount} reviews)</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {guide.specialties.slice(0, 3).map(specialty => (
            <Badge key={specialty}>{specialty}</Badge>
          ))}
        </div>
        <div className="mt-auto">
          <Button onClick={() => onViewDetails(guide)} className="w-full">View Details</Button>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;