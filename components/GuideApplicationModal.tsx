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
    contactEmail: string;
    contactPhone: string;
    contactUnlockPrice: number;
}

const GuideApplicationModal: React.FC<GuideApplicationModalProps> = ({ onClose, addToast }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: 'onChange', // Validate on every change for instant feedback
    defaultValues: {
      location: '',
      languages: '',
      specialties: '',
      bio: '',
      pricePerDay: 5000,
      contactEmail: user?.email || '',
      contactPhone: '',
      contactUnlockPrice: 150,
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!user || !functions) {
        addToast("Application service is currently unavailable.", "error");
        return;
    }
    setIsLoading(true);

    try {
        // Prepare data for the cloud function
        const applicationData = {
          location: data.location,
          languages: data.languages.split(',').map(s => s.trim()).filter(Boolean),
          specialties: data.specialties.split(',').map(s => s.trim()).filter(Boolean),
          bio: data.bio,
          pricePerDay: Number(data.pricePerDay),
          contactInfo: {
            email: data.contactEmail,
            phone: data.contactPhone,
          },
          contactUnlockPrice: Number(data.contactUnlockPrice),
          gallery: [], // Add a gallery upload feature in the future
        };

        const apply = functions.httpsCallable('applyToBeGuide');
        await apply(applicationData);
        
        // Optimistically update the user's status on the client
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
            {/* --- LOCATION --- */}
            <div>
              <Input 
                label="Primary Location" 
                placeholder="e.g., Mumbai" 
                {...register('location', { required: 'Location is required.' })}
                aria-invalid={errors.location ? 'true' : 'false'}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
            </div>
            {/* --- BIO --- */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* --- LANGUAGES --- */}
              <div>
                <Input 
                  label="Languages (comma-separated)" 
                  placeholder="English, Marathi" 
                  {...register('languages', { required: 'Please list the languages you speak.'})}
                  aria-invalid={errors.languages ? 'true' : 'false'}
                />
                {errors.languages && <p className="text-sm text-red-500 mt-1">{errors.languages.message}</p>}
              </div>
              {/* --- SPECIALTIES --- */}
              <div>
                <Input 
                  label="Specialties (comma-separated)" 
                  placeholder="Street Food, History" 
                  {...register('specialties', { required: 'Please list your specialties.'})}
                  aria-invalid={errors.specialties ? 'true' : 'false'}
                />
                {errors.specialties && <p className="text-sm text-red-500 mt-1">{errors.specialties.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* --- CONTACT EMAIL --- */}
                 <div>
                    <Input 
                        label="Contact Email"
                        type="email"
                        readOnly // Email should be tied to the account
                        {...register('contactEmail', { 
                            required: 'Contact email is required.',
                            pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address.' }
                        })}
                        aria-invalid={errors.contactEmail ? 'true' : 'false'}
                    />
                    {errors.contactEmail && <p className="text-sm text-red-500 mt-1">{errors.contactEmail.message}</p>}
                </div>
                {/* --- CONTACT PHONE --- */}
                <div>
                    <Input 
                        label="Contact Phone"
                        type="tel"
                        placeholder="9876543210"
                        {...register('contactPhone', { 
                            required: 'Contact phone is required.',
                            pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit Indian mobile number.' }
                        })}
                        aria-invalid={errors.contactPhone ? 'true' : 'false'}
                    />
                    {errors.contactPhone && <p className="text-sm text-red-500 mt-1">{errors.contactPhone.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* --- PRICE PER DAY --- */}
                <div>
                  <Input 
                    label="Price per Day (INR)" 
                    type="number" 
                    {...register('pricePerDay', {
                        required: 'Price is required.',
                        valueAsNumber: true,
                        min: { value: 1, message: 'Price must be a positive number.' }
                    })}
                    aria-invalid={errors.pricePerDay ? 'true' : 'false'}
                  />
                  {errors.pricePerDay && <p className="text-sm text-red-500 mt-1">{errors.pricePerDay.message}</p>}
                </div>
                {/* --- CONTACT UNLOCK PRICE --- */}
                <div>
                  <Input 
                    label="Contact Unlock Price (INR)" 
                    type="number" 
                    {...register('contactUnlockPrice', {
                        required: 'Unlock price is required.',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Price cannot be negative.' }
                    })}
                    aria-invalid={errors.contactUnlockPrice ? 'true' : 'false'}
                  />
                  {errors.contactUnlockPrice && <p className="text-sm text-red-500 mt-1">{errors.contactUnlockPrice.message}</p>}
                </div>
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