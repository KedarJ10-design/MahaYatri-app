
import React, { useState, useEffect } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { priceRangeMap } from './VendorsPage';
import { Guide, Vendor, Stay } from '../types';

interface AddItemModalProps {
  type: 'guide' | 'vendor' | 'stay';
  onClose: () => void;
  onAdd: (item: any, type: 'guide' | 'vendor' | 'stay') => void;
}

const getInitialFormData = (type: 'guide' | 'vendor' | 'stay') => ({
    name: '',
    location: '',
    // Guide specific
    languages: '',
    specialties: '',
    bio: '',
    pricePerDay: 3000,
    phone: '',
    email: '',
    contactUnlockPrice: 150,
    // Vendor specific
    vendorType: 'Restaurant' as Vendor['type'],
    cuisine: '',
    priceRange: '$$' as Vendor['priceRange'],
    // Stay specific
    stayType: 'Hotel' as Stay['type'],
    pricePerNight: 5000,
    amenities: '',
});

const AddItemModal: React.FC<AddItemModalProps> = ({ type, onClose, onAdd }) => {
  const [formData, setFormData] = useState(getInitialFormData(type));

  useEffect(() => {
    setFormData(getInitialFormData(type));
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commonData = {
        id: `${type}-${Date.now()}`,
        name: formData.name,
        location: formData.location,
        verificationStatus: 'verified' as const,
        rating: 0,
        reviewCount: 0,
        avatarUrl: `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '-')}/300/300`,
        gallery: [],
    };

    let newItem: Guide | Vendor | Stay;

    if (type === 'guide') {
        // FIX: Added missing required properties for the Guide type.
        newItem = {
            ...commonData,
            languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
            specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
            bio: formData.bio,
            pricePerDay: Number(formData.pricePerDay),
            contactInfo: { phone: formData.phone, email: formData.email },
            contactUnlockPrice: Number(formData.contactUnlockPrice),
            coordinates: { lat: 19.0760, lng: 72.8777 }, // Default to Mumbai coordinates
            followersCount: 0,
            // FIX: Added missing 'availability' property to satisfy the Guide type.
            availability: {},
        };
    } else if (type === 'vendor') {
        newItem = {
            ...commonData,
            type: formData.vendorType,
            cuisine: formData.cuisine.split(',').map(s => s.trim()).filter(Boolean),
            priceRange: formData.priceRange,
            // FIX: Added missing 'availability' property to satisfy the Vendor type.
            availability: {},
        };
    } else { // stay
        newItem = {
            ...commonData,
            type: formData.stayType,
            pricePerNight: Number(formData.pricePerNight),
            amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
            // FIX: Added missing 'availability' property to satisfy the Stay type.
            availability: {},
        };
    }
    onAdd(newItem, type);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const renderFormFields = () => {
      switch(type) {
          case 'guide':
              return (
                  <>
                      <Input label="Bio" name="bio" value={formData.bio} onChange={handleChange} required />
                      <Input label="Languages (comma-separated)" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Marathi" required />
                      <Input label="Specialties (comma-separated)" name="specialties" value={formData.specialties} onChange={handleChange} placeholder="History, Food Tours" required />
                      <Input label="Contact Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                      <Input label="Contact Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                      <Input label="Price Per Day (INR)" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleChange} required />
                      <Input label="Contact Unlock Price (INR)" name="contactUnlockPrice" type="number" value={formData.contactUnlockPrice} onChange={handleChange} required />
                  </>
              );
          case 'vendor':
              return (
                  <>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Type</label>
                          <select name="vendorType" value={formData.vendorType} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light ...">
                              <option value="Restaurant">Restaurant</option>
                              <option value="Street Food">Street Food</option>
                              <option value="Cafe">Cafe</option>
                          </select>
                      </div>
                      <Input label="Cuisine (comma-separated)" name="cuisine" value={formData.cuisine} onChange={handleChange} placeholder="Indian, Chinese" required />
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Range</label>
                          <select name="priceRange" value={formData.priceRange} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light ...">
                            {Object.entries(priceRangeMap).map(([key, value]) => <option key={key} value={key}>{value.label} ({key})</option>)}
                          </select>
                      </div>
                  </>
              );
          case 'stay':
              return (
                  <>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stay Type</label>
                          <select name="stayType" value={formData.stayType} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light ...">
                              <option value="Hotel">Hotel</option>
                              <option value="Homestay">Homestay</option>
                              <option value="Resort">Resort</option>
                          </select>
                      </div>
                      <Input label="Price Per Night (INR)" name="pricePerNight" type="number" value={formData.pricePerNight} onChange={handleChange} required />
                      <Input label="Amenities (comma-separated)" name="amenities" value={formData.amenities} onChange={handleChange} placeholder="WiFi, Pool, AC" required />
                  </>
              );
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold capitalize">Add New {type}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Location" name="location" value={formData.location} onChange={handleChange} required />
            {renderFormFields()}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add {type}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
