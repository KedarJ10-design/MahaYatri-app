import React from 'react';
import { Stay } from '../types';
import Button from './common/Button';
import StarRating from './StarRating';
import Badge from './Badge';
import LazyImage from './common/LazyImage';

interface StayCardProps {
  stay: Stay;
  onBook: (stay: Stay) => void;
}

const StayCard: React.FC<StayCardProps> = ({ stay, onBook }) => {
  return (
    <div className="bg-white dark:bg-dark-light rounded-xl shadow-md overflow-hidden flex flex-col transform hover:-translate-y-1 transition-all duration-300 group hover:shadow-xl dark:hover:shadow-primary/20">
      <div className="relative overflow-hidden">
        <LazyImage 
          src={stay.avatarUrl} 
          alt={stay.name} 
          className="h-48 w-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        <div className="absolute top-2 right-2"><Badge color="green">{stay.type}</Badge></div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">{stay.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{stay.location}</p>
        <div className="flex items-center mb-3">
          <StarRating rating={stay.rating} />
          <span className="ml-2 text-sm">({stay.reviewCount} reviews)</span>
        </div>
        <p className="text-lg font-semibold mt-auto">₹{stay.pricePerNight.toLocaleString()}/night</p>
        <Button onClick={() => onBook(stay)} className="w-full mt-2">Book Now</Button>
      </div>
    </div>
  );
};

export default StayCard;