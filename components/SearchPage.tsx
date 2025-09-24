import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Guide, User, Booking, ToastMessage } from '../types';
import GuideCard from './GuideCard';
import Input from './common/Input';
import GuideCardSkeleton from './skeletons/GuideCardSkeleton';
import BookingModal from './BookingModal';
import Button from './common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { functions } from '../services/firebase';
import PriceRangeSlider from './common/PriceRangeSlider';
import MapSearchView from './MapSearchView';
import QandASection from './QandASection';

interface GuideDetailsModalProps {
  guide: Guide;
  onClose: () => void;
  onBook: (guide: Guide) => void;
  onFollowToggle: (guideId: string) => void;
  user: User;
  allUsers: User[];
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const GuideDetailsModal: React.FC<GuideDetailsModalProps> = ({ guide, onClose, onBook, onFollowToggle, user, allUsers, addToast }) => {
    const { updateUser } = useAuth();
    const { openCheckout } = useRazorpay();
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    
    const isUnlocked = user.unlockedGuideIds.includes(guide.id);
    const isAlreadyFollowing = user.followingGuideIds.includes(guide.id);

    const modalRef = useFocusTrap(true);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

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
                receipt: `receipt_guide_${guide.id}_${Date.now()}`,
                notes: { userId: user.id, guideId: guide.id, type: 'guide_unlock' },
                prefill: { name: user.name, email: user.email },
                userId: user.id,
                guideId: guide.id,
            });
            // The Razorpay handler function will call our backend to verify and update the user doc.
            // For mock, we update it directly.
            if (!user.unlockedGuideIds.includes(guide.id)) {
                 await updateUser({ unlockedGuideIds: [...user.unlockedGuideIds, guide.id] });
            }
            addToast(`Successfully unlocked contact for ${guide.name}!`, 'success');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Payment failed or was cancelled.';
            addToast(message, 'error');
        } finally {
            setIsUnlocking(false);
        }
    };
    
    const handleFollow = async () => {
        if (!functions) {
            addToast("Feature not available in offline/mock mode.", "error");
            // Call mock handler for UI update in mock mode
            onFollowToggle(guide.id);
            return;
        }
        setIsFollowing(true);
        try {
            const toggleFollow = functions.httpsCallable('toggleFollowGuide');
            await toggleFollow({ guideId: guide.id });
            
            // For immediate UI feedback in mock mode, we still call this.
            // In a fully live app, Firestore listeners would handle this.
            onFollowToggle(guide.id);
            
            addToast(isAlreadyFollowing ? `Unfollowed ${guide.name}` : `Now following ${guide.name}!`, 'success');
        } catch (error: unknown) {
            console.error("Error following guide:", error);
            const message = error instanceof Error ? error.message : "Could not update follow status.";
            addToast(message, "error");
        } finally {
            setIsFollowing(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div
              ref={modalRef}
              className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="guide-details-title"
            >
                <div className="p-4 border-b flex justify-between items-start gap-4">
                    <div>
                        <h2 id="guide-details-title" className="text-2xl font-bold font-heading">{guide.name}</h2>
                        <p className="text-sm text-gray-500">{guide.followersCount.toLocaleString()} followers</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                         <Button
                            variant={isAlreadyFollowing ? 'outline' : 'primary'}
                            onClick={handleFollow}
                            loading={isFollowing}
                            size="sm"
                        >
                            {isAlreadyFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <button ref={closeButtonRef} onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close guide details">&times;</button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-6">
                            <p className="mb-4">{guide.bio}</p>
                            <div className="bg-white dark:bg-dark-light p-4 rounded-lg shadow">
                                <h3 className="text-xl font-bold text-center mb-4">Contact Information</h3>
                                {isUnlocked ? (
                                    <div className="space-y-2 text-center animate-fade-in">
                                        <p><strong>Email:</strong> {guide.contactInfo.email}</p>
                                        <p><strong>Phone:</strong> {guide.contactInfo.phone}</p>
                                    </div>
                                ) : (
                                    <Button className="w-full" onClick={handleUnlockContact} loading={isUnlocking}>
                                        Unlock for ₹{guide.contactUnlockPrice}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="p-6 bg-light dark:bg-dark">
                             <QandASection guide={guide} currentUser={user} allUsers={allUsers} addToast={addToast} />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end">
                    <Button onClick={() => onBook(guide)}>Book a Tour</Button>
                </div>
            </div>
        </div>
    );
};


const SearchPage: React.FC<{
    guides: Guide[],
    user: User,
    allUsers: User[],
    addToast: (message: string, type: ToastMessage['type']) => void,
    onFollowToggle: (guideId: string) => void,
}> = ({ guides, user, allUsers, addToast, onFollowToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxPrice, setMaxPrice] = useState(0);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const priceRange = useMemo(() => {
    if (guides.length === 0) return { min: 0, max: 10000 };
    const prices = guides.map(g => g.pricePerDay);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [guides]);

  useEffect(() => {
    if (maxPrice === 0 && priceRange.max > 0) {
      setMaxPrice(priceRange.max);
    }
  }, [priceRange.max, maxPrice]);

  const filteredGuides = useMemo(() => {
    const textFiltered = guides.filter(guide =>
      guide.verificationStatus === 'verified' &&
      (guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       guide.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
       guide.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const dateFiltered = (() => {
        if (!startDate || !endDate) return textFiltered;
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return textFiltered;

            return textFiltered.filter(guide => {
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateString = d.toISOString().split('T')[0];
                    if (guide.availability[dateString]) {
                        return false;
                    }
                }
                return true;
            });
        } catch (e) {
            console.error("Invalid date for filtering", e);
            return textFiltered;
        }
    })();

    return dateFiltered.filter(guide => guide.pricePerDay <= maxPrice);
  }, [guides, searchTerm, startDate, endDate, maxPrice]);

  const handleBookNow = (guide: Guide) => {
    setSelectedGuide(null);
    setBookingGuide(guide);
  };

  const handleBookingSubmit = async (bookingDetails: Omit<Booking, 'id' | 'userId' | 'status' | 'pointsEarned'>) => {
    console.log("Booking submitted", bookingDetails);
    addToast("Booking request sent successfully!", "success");
    setBookingGuide(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-2">Find Your Perfect Guide</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Search by name, location, or availability.</p>
      </div>
      
      <div className="mt-8 max-w-4xl mx-auto bg-white dark:bg-dark-light p-6 rounded-2xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <Input
                  label="Search Term"
                  id="guide-search-input"
                  placeholder="e.g., 'Mumbai', 'Food'"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div>
                <Input
                    label="Start Date"
                    id="start-date-input"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                />
            </div>
            <div>
                <Input
                    label="End Date"
                    id="end-date-input"
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={e => setEndDate(e.target.value)}
                    disabled={!startDate}
                />
            </div>
            <div className="md:col-span-2">
                <PriceRangeSlider
                    label="Max Price Per Day"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={100}
                    value={maxPrice}
                    onChange={setMaxPrice}
                />
            </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center my-6">
        <div className="p-1 rounded-full bg-gray-200 dark:bg-dark flex">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('list')}
            className={`transition-all ${viewMode === 'list' ? 'shadow-md' : ''}`}
          >
            List View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'map' ? 'primary' : 'ghost'}
            onClick={() => setViewMode('map')}
            className={`transition-all ${viewMode === 'map' ? 'shadow-md' : ''}`}
          >
            Map View
          </Button>
        </div>
      </div>

      {filteredGuides.length === 0 && !loading && (
          <div className="text-center mt-12 p-8 bg-gray-50 dark:bg-dark-light rounded-lg">
              <h3 className="text-xl font-semibold">No Guides Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search term or select a different date range.</p>
          </div>
      )}

      {viewMode === 'list' && (
        <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <li key={i}><GuideCardSkeleton /></li>)
            : filteredGuides.map(guide => (
                <li key={guide.id}>
                  <GuideCard guide={guide} onViewDetails={setSelectedGuide} />
                </li>
              ))}
        </ul>
      )}

      {viewMode === 'map' && (
        <div className="mt-4 h-[70vh] rounded-2xl overflow-hidden shadow-lg">
          <MapSearchView guides={filteredGuides} onMarkerClick={setSelectedGuide} />
        </div>
      )}
      
      {selectedGuide && <GuideDetailsModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} onBook={handleBookNow} user={user} allUsers={allUsers} addToast={addToast} onFollowToggle={onFollowToggle} />}
      {bookingGuide && <BookingModal guide={bookingGuide} onClose={() => setBookingGuide(null)} onBook={handleBookingSubmit} addToast={addToast} />}
    </div>
  );
};

export default SearchPage;