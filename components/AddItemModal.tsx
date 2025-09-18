

import React, { useState } from 'react';
import { Guide, Vendor, Stay } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Spinner from './common/Spinner';

type ItemType = 'guide' | 'vendor' | 'stay';

// Omit properties that will be auto-generated or defaulted
// FIX: The original type definition for NewItemData resulted in an impossible type (`never`)
// because the 'type' property in Vendor and Stay have conflicting definitions.
// This new definition combines all properties from Guide, Vendor, and Stay, makes them optional,
// and correctly handles the conflicting 'type' property by creating a union of possible values.
type NewItemData = Partial<
  Omit<Guide, 'id' | 'verificationStatus'> &
  Omit<Vendor, 'id' | 'verificationStatus' | 'type'> &
  Omit<Stay, 'id' | 'verificationStatus' | 'type'>
> & {
  type?: Vendor['type'] | Stay['type'];
};

interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (itemData: NewItemData, itemType: ItemType) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem }) => {
  const [itemType, setItemType] = useState<ItemType>('guide');
  const [formData, setFormData] = useState<NewItemData>({
    name: '',
    location: '',
    avatarUrl: 'https://picsum.photos/seed/new-item/300/300',
    gallery: [],
    // guide defaults
    rating: 4.5,
    reviewCount: 0,
    languages: [],
    specialties: [],
    bio: '',
    pricePerDay: 4000,
    contactInfo: { phone: '', email: '' },
    contactUnlockPrice: 200,
    // vendor defaults
    type: 'Restaurant',
    cuisine: [],
    priceRange: '$$',
    // stay defaults
    pricePerNight: 5000,
    amenities: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'email') {
        setFormData(prev => ({ ...prev, contactInfo: { ...prev!.contactInfo!, [name]: value } }));
    } else if (['pricePerDay', 'pricePerNight', 'contactUnlockPrice', 'rating', 'reviewCount'].includes(name)) {
        setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleListChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'languages' | 'specialties' | 'cuisine' | 'amenities' | 'gallery') => {
    const { value } = e.target;
    // Filter out empty strings that can result from trailing commas
    setFormData(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create a clean payload with only relevant data
    const commonData = {
        name: formData.name,
        location: formData.location,
        avatarUrl: formData.avatarUrl,
        gallery: formData.gallery,
        rating: formData.rating,
        reviewCount: formData.reviewCount,
    };

    let payload: NewItemData;

    if (itemType === 'guide') {
        payload = {
            ...commonData,
            languages: formData.languages,
            specialties: formData.specialties,
            bio: formData.bio,
            pricePerDay: formData.pricePerDay,
            contactInfo: formData.contactInfo,
            contactUnlockPrice: formData.contactUnlockPrice,
        };
    } else if (itemType === 'vendor') {
        payload = {
            ...commonData,
            type: formData.type as Vendor['type'],
            cuisine: formData.cuisine,
            priceRange: formData.priceRange,
        };
    } else { // stay
        payload = {
            ...commonData,
            type: formData.type as Stay['type'],
            pricePerNight: formData.pricePerNight,
            amenities: formData.amenities,
        };
    }

    // Simulate a brief delay for UX and call the handler
    setTimeout(() => {
        onAddItem(payload, itemType);
        // Do not set isSubmitting to false here, parent will close modal
    }, 1000);
  };

  const renderGuideFields = () => (
    <>
      <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Guide's Bio" required className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Languages (comma-separated)" name="languages" value={formData.languages?.join(', ')} onChange={(e) => handleListChange(e, 'languages')} required />
        <Input label="Specialties (comma-separated)" name="specialties" value={formData.specialties?.join(', ')} onChange={(e) => handleListChange(e, 'specialties')} required />
        <Input label="Phone" name="phone" type="tel" value={formData.contactInfo?.phone} onChange={handleChange} required />
        <Input label="Email" name="email" type="email" value={formData.contactInfo?.email} onChange={handleChange} required />
        <Input label="Price per Day (INR)" name="pricePerDay" type="number" min="0" value={formData.pricePerDay} onChange={handleChange} required />
        <Input label="Contact Unlock Price (INR)" name="contactUnlockPrice" type="number" min="0" value={formData.contactUnlockPrice} onChange={handleChange} required />
      </div>
    </>
  );

  const renderVendorFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Type</label>
          <select name="type" value={formData.type as 'Restaurant' | 'Street Food' | 'Cafe'} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="Restaurant">Restaurant</option>
            <option value="Street Food">Street Food</option>
            <option value="Cafe">Cafe</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Range</label>
          <select name="priceRange" value={formData.priceRange} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </div>
      </div>
      <Input label="Cuisine (comma-separated)" name="cuisine" value={formData.cuisine?.join(', ')} onChange={(e) => handleListChange(e, 'cuisine')} required />
    </>
  );

  const renderStayFields = () => (
     <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stay Type</label>
          <select name="type" value={formData.type as 'Hotel' | 'Homestay' | 'Resort'} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="Hotel">Hotel</option>
            <option value="Homestay">Homestay</option>
            <option value="Resort">Resort</option>
          </select>
        </div>
         <Input label="Price per Night (INR)" name="pricePerNight" type="number" min="0" value={formData.pricePerNight} onChange={handleChange} required />
      </div>
      <Input label="Amenities (comma-separated)" name="amenities" value={formData.amenities?.join(', ')} onChange={(e) => handleListChange(e, 'amenities')} required />
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold font-heading text-dark dark:text-light">Add New Entry</h2>
          <p className="text-gray-500 dark:text-gray-400">Manually add a new Guide, Vendor, or Stay to the platform.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                <div className="flex items-center gap-2 p-1 bg-light dark:bg-dark rounded-lg self-start">
                    {(['guide', 'vendor', 'stay'] as ItemType[]).map(type => (
                        <button key={type} type="button" onClick={() => setItemType(type)} className={`px-4 py-2 font-semibold rounded-md transition-colors text-sm capitalize ${itemType === type ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-lighter'}`}>
                            {type}
                        </button>
                    ))}
                </div>
                
                <h3 className="text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">Common Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
                    <Input label="Location" name="location" value={formData.location} onChange={handleChange} required />
                </div>
                <Input label="Avatar URL" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} required />
                <Input label="Gallery URLs (comma-separated)" name="gallery" value={formData.gallery?.join(', ')} onChange={(e) => handleListChange(e, 'gallery')} />
                <Input label="Rating" name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={handleChange} required />
                <Input label="Review Count" name="reviewCount" type="number" min="0" value={formData.reviewCount} onChange={handleChange} required />


                <h3 className="text-lg font-bold pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Specific Details
                </h3>
                {itemType === 'guide' && renderGuideFields()}
                {itemType === 'vendor' && renderVendorFields()}
                {itemType === 'stay' && renderStayFields()}
            </div>
            <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end items-center gap-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <span className="flex items-center"><Spinner className="mr-2" /> Adding...</span> : `Add ${itemType}`}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;