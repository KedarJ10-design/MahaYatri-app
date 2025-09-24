
import React, { useState, useEffect, useRef } from 'react';
import { Guide, User } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useRazorpay } from '../hooks/useRazorpay';
import { useAuth } from '../contexts/AuthContext';

import Button from './common/Button';
import Badge from './Badge';
import StarRating from './StarRating';
import LazyImage from './common/LazyImage';
import GuideAvailabilityViewer from './common/GuideAvailabilityViewer';
import QandASection from './QandASection';

interface GuideDetailsModalProps {
  guide: Guide;
  onClose: () => void;
  onBook: () => void;
  user: User;
  allUsers: User[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const GuideDetailsModal: React.FC<GuideDetailsModalProps> = ({ guide, onClose, onBook, user, allUsers, addToast }) => {
  const modalRef = useFocusTrap(true);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { openCheckout } = useRazorpay();
  const { updateUser } = useAuth();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const isContactUnlocked = user.unlockedGuideIds.includes(guide.id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const handleUnlockContact = async () => {
    setIsUnlocking(true);
    try {
        await openCheckout({
            amount: guide.contactUnlockPrice * 100, // in paise
            currency: 'INR',
            receipt: `unlock-${guide.id}-${Date.now()}`,
            notes: {
                guideId: guide.id,
                userId: user.id,
                feature: 'contact_unlock',
            },
            prefill: {
                name: user.name,
                email: user.email,
            },
            userId: user.id,
            guideId: guide.id,
        });
        // The verification function will update the user doc. For mock mode, update manually.
        if (!user.unlockedGuideIds.includes(guide.id)) {
            await updateUser({ unlockedGuideIds: [...user.unlockedGuideIds, guide.id] });
        }
        addToast('Contact unlocked successfully!', 'success');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Payment failed.';
        // Don't show "Payment was cancelled" toast
        if (message !== 'Payment was cancelled.') {
            addToast(message, 'error');
        }
    } finally {
        setIsUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-details-title"
      >
        <header className="p-4 sm:p-6 border-b dark:border-gray-700 flex justify-between items-start">
            <div className="flex items-start gap-4">
                <LazyImage src={guide.avatarUrl} alt={guide.name} className="w-24 h-24 rounded-lg flex-shrink-0" placeholderClassName="rounded-lg" />
                <div>
                    <h2 id="guide-details-title" className="text-2xl sm:text-3xl font-bold font-heading">{guide.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{guide.location}</p>
                    <div className="flex items-center mt-2">
                        <StarRating rating={guide.rating} />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({guide.reviewCount} reviews)</span>
                    </div>
                </div>
            </div>
            <Button ref={closeButtonRef} variant="ghost" size="sm" onClick={onClose} aria-label="Close modal" className="!p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </Button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Details & Contact */}
            <div className="space-y-6">
                <section>
                    <h3 className="font-bold text-lg mb-2">About {guide.name.split(' ')[0]}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{guide.bio}</p>
                </section>
                <section>
                    <h3 className="font-bold text-lg mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="font-semibold mr-2">Languages:</span>
                        {guide.languages.map(lang => <Badge key={lang} color="blue">{lang}</Badge>)}
                    </div>
                     <div className="flex flex-wrap gap-2 mt-2">
                        <span className="font-semibold mr-2">Specialties:</span>
                        {guide.specialties.map(spec => <Badge key={spec}>{spec}</Badge>)}
                    </div>
                </section>
                <section className="p-4 bg-light dark:bg-dark rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Contact Information</h3>
                    {isContactUnlocked ? (
                        <div className="space-y-2 animate-fade-in">
                            <p><span className="font-semibold">Email:</span> {guide.contactInfo.email}</p>
                            <p><span className="font-semibold">Phone:</span> {guide.contactInfo.phone}</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="mb-3">Unlock contact details to connect directly with {guide.name}.</p>
                            <Button onClick={handleUnlockContact} loading={isUnlocking}>
                                Unlock for ₹{guide.contactUnlockPrice}
                            </Button>
                        </div>
                    )}
                </section>
                 <section className="block lg:hidden">
                    <GuideAvailabilityViewer availability={guide.availability} />
                </section>
            </div>
            {/* Right Column: Availability & Q&A */}
            <div className="space-y-6">
                 <section className="hidden lg:block">
                    <GuideAvailabilityViewer availability={guide.availability} />
                </section>
                 <section>
                    <QandASection guide={guide} currentUser={user} allUsers={allUsers} addToast={addToast} />
                </section>
            </div>
        </main>

        <footer className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-between items-center flex-wrap gap-4">
            <div>
                <span className="text-xl font-bold">₹{guide.pricePerDay.toLocaleString()}</span>
                <span className="text-gray-500">/day</span>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" onClick={onClose}>Maybe Later</Button>
                <Button onClick={onBook}>Book Tour</Button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default GuideDetailsModal;
