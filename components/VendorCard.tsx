import React from 'react';
import { Vendor } from '../types';
import Button from './common/Button';
import StarRating from './StarRating';
import Badge from './Badge';
import { priceRangeMap } from './VendorsPage';

interface VendorCardProps {
  vendor: Vendor;
  onBook: (vendor: Vendor) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onBook }) => {
  const priceInfo = priceRangeMap[vendor.priceRange];

  return (
    <div className="bg-white dark:bg-dark-light rounded-xl shadow-md overflow-hidden flex flex-col transform hover:-translate-y-1 transition-all duration-300 group hover:shadow-xl dark:hover:shadow-primary/20">
      <div className="relative overflow-hidden">
        <img className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" src={vendor.avatarUrl} alt={vendor.name} />
        <div className="absolute top-2 right-2"><Badge color={vendor.type === 'Restaurant' ? 'blue' : 'yellow'}>{vendor.type}</Badge></div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">{vendor.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{vendor.location}</p>
        {priceInfo && (
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <span className="font-semibold">{priceInfo.label}</span> / <span className="text-gray-500">{priceInfo.range}</span>
            </div>
        )}
        <div className="flex items-center mb-3">
          <StarRating rating={vendor.rating} />
          <span className="ml-2 text-sm">({vendor.reviewCount} reviews)</span>
        </div>
        <div className="mt-auto">
          <Button onClick={() => onBook(vendor)} className="w-full">Book a Table</Button>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;