import React, { useState } from 'react';
import { User } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import { useAuth } from '../contexts/AuthContext';
import { functions } from '../services/firebase';

interface GuideApplicationModalProps {
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const GuideApplicationModal: React.FC<GuideApplicationModalProps> = ({ onClose, addToast }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    location: '',
    languages: '',
    specialties: '',
    bio: '',
    pricePerDay: 5000,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !functions) return;
    setIsLoading(true);

    try {
        // In a real app, this would be a Cloud Function call.
        // We simulate the update here.
        // const apply = functions.httpsCallable('applyToBeGuide');
        // await apply({ ... });
        await updateUser({ hasPendingApplication: true });
        addToast('Application submitted successfully! Our team will review it shortly.', 'success');
        onClose();
    } catch (error: unknown) {
        console.error("Failed to submit application:", error);
        const message = error instanceof Error ? error.message : 'Failed to submit application.';
        addToast(message, 'error');
    } finally {
        setIsLoading(false);
    }
  };


  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Apply to be a MahaYatri Guide</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your name ({user.name}) and profile picture will be used from your current profile. Please fill out the details below to complete your application.
            </p>
            <Input label="Primary Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Mumbai" required />
            <Input label="Languages (comma-separated)" name="languages" value={formData.languages} onChange={handleChange} placeholder="English, Marathi, Hindi" required />
            <Input label="Specialties (comma-separated)" name="specialties" value={formData.specialties} onChange={handleChange} placeholder="Street Food, History, Bollywood" required />
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="Tell travelers a little about yourself and your tours."
                value={formData.bio}
                onChange={handleChange}
                required
              />
            </div>
            <Input label="Price per Day (INR)" name="pricePerDay" type="number" min="1000" value={formData.pricePerDay} onChange={handleChange} required />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" loading={isLoading}>Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuideApplicationModal;