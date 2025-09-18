import React, { useState } from 'react';
import { Guide } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Spinner from './common/Spinner';

type ApplicationData = Omit<Guide, 'id' | 'name' | 'avatarUrl' | 'verificationStatus' | 'rating' | 'reviewCount'>;

interface GuideApplicationModalProps {
  onClose: () => void;
  onApply: (applicationData: ApplicationData) => void;
}

const GuideApplicationModal: React.FC<GuideApplicationModalProps> = ({ onClose, onApply }) => {
  const [formData, setFormData] = useState<ApplicationData>({
    location: '',
    languages: [],
    specialties: [],
    bio: '',
    pricePerDay: 3000,
    gallery: ['', '', ''],
    contactInfo: { phone: '', email: '' },
    contactUnlockPrice: 150,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'email') {
        setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, [name]: value } }));
    } else if (name.startsWith('gallery-')) {
        const index = parseInt(name.split('-')[1]);
        const newGallery = [...formData.gallery];
        newGallery[index] = value;
        setFormData(prev => ({ ...prev, gallery: newGallery }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleListChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'languages' | 'specialties') => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate a brief delay for UX
    setTimeout(() => {
        onApply(formData);
        // Parent component will close the modal
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-guide-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="apply-guide-title" className="text-2xl font-bold font-heading text-dark dark:text-light">Become a Guide</h2>
          <p className="text-gray-500 dark:text-gray-400">Fill out your profile to start your journey with MahaYatri.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                <Input label="Your Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Pune" required />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tell us about yourself (Bio)</label>
                    <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition" placeholder="Share your passion for your city..." required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Languages (comma-separated)" name="languages" value={formData.languages.join(', ')} onChange={(e) => handleListChange(e, 'languages')} placeholder="e.g., Marathi, English, Hindi" required />
                    <Input label="Specialties (comma-separated)" name="specialties" value={formData.specialties.join(', ')} onChange={(e) => handleListChange(e, 'specialties')} placeholder="e.g., Street Food, History, Trekking" required />
                    <Input label="Public Phone" name="phone" type="tel" value={formData.contactInfo.phone} onChange={handleChange} placeholder="+91..." required />
                    <Input label="Public Email" name="email" type="email" value={formData.contactInfo.email} onChange={handleChange} placeholder="you@example.com" required />
                    <Input label="Price per Day (INR)" name="pricePerDay" type="number" min="500" step="100" value={formData.pricePerDay} onChange={handleChange} required />
                    <Input label="Contact Unlock Price (INR)" name="contactUnlockPrice" type="number" min="50" step="10" value={formData.contactUnlockPrice} onChange={handleChange} required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gallery Image URLs</label>
                    <div className="space-y-2">
                        <Input label="" name="gallery-0" value={formData.gallery[0]} onChange={handleChange} placeholder="https://example.com/image1.jpg" />
                        <Input label="" name="gallery-1" value={formData.gallery[1]} onChange={handleChange} placeholder="https://example.com/image2.jpg" />
                        <Input label="" name="gallery-2" value={formData.gallery[2]} onChange={handleChange} placeholder="https://example.com/image3.jpg" />
                    </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">You will be asked to upload verification documents after submitting this initial application.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end items-center gap-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <span className="flex items-center"><Spinner className="mr-2" /> Submitting...</span> : 'Submit Application'}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default GuideApplicationModal;