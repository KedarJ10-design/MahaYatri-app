import React from 'react';
import { Stay } from '../types';
import StarRating from './StarRating';
import Badge from './Badge';
import Button from './common/Button';

interface StayCardProps {
  stay: Stay;
  onViewDetails: () => void;
}

const StayCard: React.FC<StayCardProps> = ({ stay, onViewDetails }) => {
  return (
    <div className="bg-white dark:bg-dark-light rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
      <div className="relative">
        <img className="w-full h-56 object-cover" src={stay.avatarUrl} alt={stay.name} />
        {stay.verificationStatus === 'verified' && (
          <div className="absolute top-2 right-2">
            <Badge color="green">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </Badge>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div>
            <Badge color='blue'>{stay.type}</Badge>
            <h3 className="text-xl font-bold text-dark dark:text-light mt-2">{stay.name}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{stay.location}</p>
        <div className="flex items-center mb-4">
          <StarRating rating={stay.rating} />
          <span className="text-gray-500 dark:text-gray-400 ml-2">({stay.reviewCount} reviews)</span>
        </div>
        <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap gap-1">
                {stay.amenities.slice(0, 3).map(a => (
                    <span key={a} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark px-2 py-1 rounded">{a}</span>
                ))}
            </div>
            <p className="font-bold text-lg text-primary">₹{stay.pricePerNight}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/night</span></p>
        </div>
        <div className="mt-auto">
            <Button onClick={onViewDetails} className="w-full" variant="outline">
                View Details
            </Button>
        </div>
      </div>
    </div>
  );
};

export default StayCard;
