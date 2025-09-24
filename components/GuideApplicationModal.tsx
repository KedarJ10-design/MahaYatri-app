import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from './common/Button';
import Input from './common/Input';
import { useAuth } from '../contexts/AuthContext';
import { functions } from '../services/firebase';

interface GuideApplicationModalProps {
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

type FormData = {
    location: string;
    languages: string;
    specialties: string;
    bio: string;
    pricePerDay: number;
}

const GuideApplicationModal: React.FC<GuideApplicationModalProps> = ({ onClose, addToast }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      location: '',
      languages: '',
      specialties: '',
      bio: '',
      pricePerDay: 5000,
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!user || !functions) return;
    setIsLoading(true);

    try {
        // In a real app, this would be a Cloud Function call.
        // const apply = functions.httpsCallable('applyToBeGuide');
        // await apply(data);
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your name ({user.name}) and profile picture will be used from your current profile. Please fill out the details below to complete your application.
            </p>
            <div>
              <Input 
                label="Primary Location" 
                placeholder="e.g., Mumbai" 
                {...register('location', { required: 'Location is required.' })}
                aria-invalid={errors.location ? 'true' : 'false'}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <Input 
                label="Languages (comma-separated)" 
                placeholder="English, Marathi, Hindi" 
                {...register('languages', { required: 'Please list the languages you speak.' })}
                aria-invalid={errors.languages ? 'true' : 'false'}
              />
              {errors.languages && <p className="text-sm text-red-500 mt-1">{errors.languages.message}</p>}
            </div>
            <div>
              <Input 
                label="Specialties (comma-separated)" 
                placeholder="Street Food, History, Bollywood" 
                {...register('specialties', { required: 'Please list your specialties.' })}
                aria-invalid={errors.specialties ? 'true' : 'false'}
              />
              {errors.specialties && <p className="text-sm text-red-500 mt-1">{errors.specialties.message}</p>}
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Bio</label>
              <textarea
                id="bio"
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="Tell travelers a little about yourself and your tours."
                {...register('bio', { 
                    required: 'A bio is required.',
                    minLength: { value: 50, message: 'Bio must be at least 50 characters long.' }
                })}
                aria-invalid={errors.bio ? 'true' : 'false'}
              />
              {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>}
            </div>
            <div>
              <Input 
                label="Price per Day (INR)" 
                type="number" 
                {...register('pricePerDay', {
                    required: 'Price is required.',
                    valueAsNumber: true,
                    min: { value: 1000, message: 'Price must be at least ₹1000.' }
                })}
                aria-invalid={errors.pricePerDay ? 'true' : 'false'}
              />
              {errors.pricePerDay && <p className="text-sm text-red-500 mt-1">{errors.pricePerDay.message}</p>}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" loading={isLoading} disabled={!isValid || isLoading}>Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuideApplicationModal;