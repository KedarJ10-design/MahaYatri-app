import React, { useState, useMemo, useEffect } from 'react';
import { Page, User, Guide, Booking, PlaceSuggestion, Review, VendorBooking, Vendor, Reward, BookingStatus, ToastMessage, StayBooking, Conversation } from '../types';
import Button from './common/Button';
import GuideApplicationModal from './GuideApplicationModal';
import StarRating from './StarRating';
import Input from './common/Input';
import Badge from './Badge';
import GuideAvailabilityViewer from './common/GuideAvailabilityViewer';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './common/Spinner';

const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Pending: return 'yellow';
        case BookingStatus.Confirmed: return 'blue';
        case BookingStatus.Completed: return 'green';
        case BookingStatus.Cancelled: return 'red';
        default: return 'gray';
    }
};


const EmptyState: React.FC<{
    icon: React.ReactNode;
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
}> = ({ icon, title, message, action }) => (
    <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-xl text-dark dark:text-light">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{message}</p>
        {action && <Button onClick={action.onClick} className="mt-6">{action.label}</Button>}
    </div>
);


const WishlistTab: React.FC<{ 
    wishlist: PlaceSuggestion[], 
    onViewPlace: (p: PlaceSuggestion) => void,
    onGenerateFromWishlist: () => void,
    onNavigateToExplore: () => void,
}> = ({ wishlist, onViewPlace, onGenerateFromWishlist, onNavigateToExplore }) => {
    const [sortBy, setSortBy] = useState<'default' | 'destination' | 'type'>('default');

    const sortedWishlist = useMemo(() => {
        const sorted = [...wishlist];
        if (sortBy === 'destination') {
            sorted.sort((a, b) => a.destination.localeCompare(b.destination));
        } else if (sortBy === 'type') {
            sorted.sort((a, b) => a.type.localeCompare(b.type));
        }
        return sorted;
    }, [wishlist, sortBy]);

    const SortButton: React.FC<{ sortKey: 'default' | 'destination' | 'type', children: React.ReactNode }> = ({ sortKey, children }) => (
        <Button
            size="sm"
            variant={sortBy === sortKey ? 'primary' : 'ghost'}
            onClick={() => setSortBy(sortKey)}
            className="capitalize"
        >
            {children}
        </Button>
    );
    
    if (wishlist.length === 0) {
        return (
            <EmptyState
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>}
                title="Your Wishlist is Empty"
                message="Save places you'd love to visit from the Explore page."
                action={{ label: 'Start Exploring', onClick: onNavigateToExplore }}
            />
        );
    }

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-bold">My Wishlist</h3>
                <Button onClick={onGenerateFromWishlist} variant="secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4zM5 12a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2zM11 18a1 1 0 10-2 0v-2a1 1 0 102 0v2z" />
                    </svg>
                    Generate Itinerary
                </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sort by:</span>
                <SortButton sortKey="default">Default</SortButton>
                <SortButton sortKey="destination">Destination</SortButton>
                <SortButton sortKey="type">Type</SortButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedWishlist.map(place => (
                    <div key={`${place.name}-${place.destination}`} className="p-4 bg-light dark:bg-dark rounded-lg shadow flex flex-col hover:shadow-lg transform hover:-translate-y-px transition-all duration-300">
                        <h4 className="font-bold text-dark dark:text-light">{place.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{place.destination}</p>
                        <div className="mt-2 mb-3">
                          <Badge>{place.type}</Badge>
                        </div>
                        <Button variant="outline" className="mt-auto w-full text-sm py-1" onClick={() => onViewPlace(place)}>View Details</Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
const BookingsTab: React.FC<{ user: User, onOpenReviewModal: (b: Booking) => void }> = ({ user, onOpenReviewModal }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [vendorBookings, setVendorBookings] = useState<VendorBooking[]>([]);
    const [stayBookings, setStayBookings] = useState<StayBooking[]>([]);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !user?.id) return;
        setLoading(true);
        const unsubscribes: (()=>void)[] = [];

        unsubscribes.push(db.collection('bookings').where('userId', '==', user.id).onSnapshot(snap => 
            setBookings(snap.docs.map(d => ({id: d.id, ...d.data()} as Booking)))
        ));
        unsubscribes.push(db.collection('vendorBookings').where('userId', '==', user.id).onSnapshot(snap => 
            setVendorBookings(snap.docs.map(d => ({id: d.id, ...d.data()} as VendorBooking)))
        ));
        unsubscribes.push(db.collection('stayBookings').where('userId', '==', user.id).onSnapshot(snap => 
            setStayBookings(snap.docs.map(d => ({id: d.id, ...d.data()} as StayBooking)))
        ));
        // Also fetch guides and vendors for name lookups
        unsubscribes.push(db.collection('guides').onSnapshot(snap => 
            setGuides(snap.docs.map(d => ({id: d.id, ...d.data()} as Guide)))
        ));
        unsubscribes.push(db.collection('vendors').onSnapshot(snap => {
            setVendors(snap.docs.map(d => ({id: d.id, ...d.data()} as Vendor)));
            setLoading(false); // Assume this is the last one
        }));

        return () => unsubscribes.forEach(unsub => unsub());
    }, [user.id]);

    const allBookings = useMemo(() => [
        ...bookings.map(b => ({...b, type: 'guide', date: b.startDate})),
        ...vendorBookings.map(b => ({...b, type: 'vendor', date: b.date}))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [bookings, vendorBookings]);

    if (loading) {
        return <div className="flex justify-center py-12"><Spinner /></div>;
    }

    if (allBookings.length === 0) {
        return (
             <EmptyState
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                title="No Bookings Yet"
                message="Your upcoming and past trips will appear here."
            />
        )
    }

    return (
    <div>
        <h3 className="text-xl font-bold mb-4">My Bookings</h3>
        <div className="space-y-4">
            {allBookings.map(booking => {
                 if ('guideId' in booking && booking.type === 'guide') {
                    const guide = guides.find(g => g.id === booking.guideId);
                    return (
                        <div key={booking.id} className="p-4 bg-light dark:bg-dark rounded-lg shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all transform hover:-translate-y-px hover:shadow-md">
                            <div>
                                <h4 className="font-bold">Tour with {guide?.name || 'a guide'}</h4>
                                <p className="text-sm text-gray-500">{new Date(booking.startDate).toDateString()} - {new Date(booking.endDate).toDateString()}</p>
                                <div className="mt-2">
                                    <Badge color={getStatusBadgeColor(booking.status)}>{booking.status}</Badge>
                                </div>
                            </div>
                            {booking.status === BookingStatus.Completed && !booking.hasBeenReviewed && <Button onClick={() => onOpenReviewModal(booking)}>Leave a Review</Button>}
                        </div>
                    );
                 }
                 if ('vendorId' in booking && booking.type === 'vendor') {
                    const vendor = vendors.find(v => v.id === booking.vendorId);
                    return (
                         <div key={booking.id} className="p-4 bg-light dark:bg-dark rounded-lg shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all transform hover:-translate-y-px hover:shadow-md">
                            <div>
                                <h4 className="font-bold">Reservation at {vendor?.name || 'a vendor'}</h4>
                                <p className="text-sm text-gray-500">{new Date(booking.date).toDateString()} at {booking.time}</p>
                            </div>
                        </div>
                    );
                 }
                return null;
            })}
        </div>
    </div>
)};
const RewardsTab: React.FC<{ user: User, onRedeemReward: (r: Reward) => Promise<void>, addToast: (m: string, t: ToastMessage['type']) => void }> = ({ user, onRedeemReward, addToast }) => {
    const [loadingRewardId, setLoadingRewardId] = useState<string | null>(null);
    // Mock rewards for demonstration
    const allRewards: Reward[] = [
        { id: 'reward-1', title: '10% Off Next Tour', description: 'Get 10% off your next booking with any guide.', pointsRequired: 1000, icon: '🎁' },
        { id: 'reward-2', title: 'Free Coffee', description: 'Enjoy a free coffee at a partner cafe.', pointsRequired: 500, icon: '☕' },
        { id: 'reward-3', title: 'Souvenir Discount', description: 'Get 20% off at select souvenir shops.', pointsRequired: 1500, icon: '🛍️' },
    ];
    
    const handleRedeemClick = async (reward: Reward) => {
        setLoadingRewardId(reward.id);
        try {
            await onRedeemReward(reward);
            addToast(`Redeemed "${reward.title}"!`, 'success');
        } catch (error) {
            console.error(error);
            addToast("Failed to redeem reward.", 'error');
        } finally {
            setLoadingRewardId(null);
        }
    }

    return (
        <div>
            <div className="p-4 bg-primary/10 rounded-lg mb-6 text-center">
                <p className="text-lg">Your Points</p>
                <p className="text-4xl font-bold text-primary">{user.points}</p>
            </div>
            <h3 className="text-xl font-bold mb-4">Available Rewards</h3>
            <div className="space-y-4">
            {allRewards.map(reward => {
                const isRedeemed = user.redeemedRewardIds.includes(reward.id);
                const canAfford = user.points >= reward.pointsRequired;
                return (
                    <div key={reward.id} className="p-4 bg-light dark:bg-dark rounded-lg shadow flex justify-between items-center transition-all transform hover:-translate-y-px hover:shadow-md">
                        <div>
                            <h4 className="font-bold">{reward.title}</h4>
                            <p className="text-sm text-gray-500">{reward.description}</p>
                            <p className="text-sm font-semibold">{reward.pointsRequired} Points</p>
                        </div>
                        <Button onClick={() => handleRedeemClick(reward)} disabled={isRedeemed || !canAfford} loading={loadingRewardId === reward.id}>
                            {isRedeemed ? 'Redeemed' : 'Redeem'}
                        </Button>
                    </div>
                );
            })}
            </div>
        </div>
    );
}

const ProfileSettingsTab: React.FC<{ user: User, onUpdateUser: (data: Partial<User>) => Promise<void> }> = ({ user, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        preferences: user.preferences.join(', '),
        emergencyContactName: user.emergencyContact.name,
        emergencyContactPhone: user.emergencyContact.phone,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSaved(false);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const updatedUserData: Partial<User> = {
            name: formData.name,
            preferences: formData.preferences.split(',').map(p => p.trim()).filter(Boolean),
            emergencyContact: {
                name: formData.emergencyContactName,
                phone: formData.emergencyContactPhone,
            },
        };
        
        try {
            await onUpdateUser(updatedUserData);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save profile settings", error);
            // Error toast is shown from the AuthContext
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-6">Profile Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Travel Preferences (comma-separated)" name="preferences" value={formData.preferences} onChange={handleChange} placeholder="e.g. History, Food, Nature" />
                <fieldset className="border p-4 rounded-lg">
                    <legend className="font-semibold px-2">Emergency Contact</legend>
                    <div className="space-y-4">
                       <Input label="Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required />
                       <Input label="Contact Phone" name="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone} onChange={handleChange} required />
                    </div>
                </fieldset>
                <div className="flex justify-end items-center gap-4">
                    {isSaved && <p className="text-green-600 text-sm animate-fade-in">Changes saved!</p>}
                    <Button type="submit" loading={isSaving}>Save Changes</Button>
                </div>
            </form>
        </div>
    );
};


interface ProfilePageProps {
  user: User;
  guideId: string | null; 
  onBookGuide: (guide: Guide) => void;
  onNavigate: (page: Page) => void;
  onToggleWishlist: (place: PlaceSuggestion) => void;
  onViewPlace: (place: PlaceSuggestion) => void;
  onOpenItineraryBuilder: (places: PlaceSuggestion[]) => void;
  onUpgrade: () => void;
  onUnlockGuide: (guide: Guide) => Promise<void>;
  onStartChat: (guideId: string, conversations: Conversation[]) => void;
  onOpenReviewModal: (booking: Booking) => void;
  onApplyToBeGuide: (applicationData: any) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
  const { user, guideId, addToast } = props;
  const { updateUser: onUpdateUser, redeemReward: onRedeemReward } = useAuth();

  const [activeTab, setActiveTab] = useState('bookings');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // States for guide profile view
  const [guide, setGuide] = useState<Guide | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingGuide, setIsLoadingGuide] = useState(true);


  useEffect(() => {
    if (!guideId || !db) {
        setIsLoadingGuide(false);
        return;
    }
    setIsLoadingGuide(true);
    const unsubscribes: (() => void)[] = [];

    unsubscribes.push(db.collection('guides').doc(guideId).onSnapshot(doc => {
        if(doc.exists) setGuide({ id: doc.id, ...doc.data() } as Guide);
        else setGuide(null);
    }));

    unsubscribes.push(db.collection('reviews').where('guideId', '==', guideId).onSnapshot(snap => {
        setReviews(snap.docs.map(d => ({id: d.id, ...d.data()}) as Review));
    }));

    // Fetch all users for review author lookups
    unsubscribes.push(db.collection('users').onSnapshot(snap => {
        setAllUsers(snap.docs.map(d => ({id: d.id, ...d.data()}) as User));
        setIsLoadingGuide(false);
    }));

    return () => unsubscribes.forEach(unsub => unsub());
  }, [guideId]);

  const handleApplyClick = async (applicationData: any) => {
      setIsApplying(true);
      try {
          await props.onApplyToBeGuide(applicationData);
          setShowApplyModal(false);
      } finally {
          setIsApplying(false);
      }
  };

  // If a guide is selected, we show their profile instead of the user's dashboard.
  if (guideId) {
    if (isLoadingGuide) {
        return <div className="flex justify-center items-center h-96"><Spinner className="w-12 h-12" /></div>;
    }
    if (!guide) {
        return <div>Guide not found.</div>;
    }

    const isUnlocked = props.user.unlockedGuideIds.includes(guide.id);
    
    const handleUnlockClick = async () => {
        setIsUnlocking(true);
        try {
            await props.onUnlockGuide(guide);
        } catch (e) {
            // Error is handled by the toast in App.tsx
        } finally {
            setIsUnlocking(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
                <div className="flex flex-col md:flex-row gap-8">
                    <img src={guide.avatarUrl} alt={guide.name} className="w-32 h-32 rounded-full border-4 border-primary object-cover mx-auto md:mx-0"/>
                    <div className="flex-grow">
                        <h1 className="text-3xl font-bold font-heading">{guide.name}</h1>
                        <p className="text-lg text-gray-500">{guide.location}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <StarRating rating={guide.rating} />
                           <span>{guide.rating}/5 ({guide.reviewCount} reviews)</span>
                        </div>
                         <div className="mt-4 flex flex-wrap gap-2">
                             <Button onClick={() => props.onBookGuide(guide)}>Book Tour</Button>
                             {isUnlocked ? (
                                <Button variant="outline" onClick={() => props.onStartChat(guide.id, [])}>Message Guide</Button>
                             ) : (
                                <Button variant="secondary" onClick={handleUnlockClick} loading={isUnlocking}>
                                    {`Unlock Contact for ₹${guide.contactUnlockPrice}`}
                                </Button>
                             )}
                         </div>
                    </div>
                </div>
                 <div className="mt-8 border-t pt-6">
                    <h2 className="text-2xl font-bold font-heading mb-4">About Me</h2>
                    <p>{guide.bio}</p>
                </div>
                {isUnlocked && (
                     <div className="mt-8 border-t pt-6">
                        <h2 className="text-2xl font-bold font-heading mb-4">Contact Information</h2>
                        <div className="p-4 bg-primary/10 rounded-lg flex flex-col sm:flex-row gap-4 sm:gap-8">
                            <p><strong>Email:</strong> {guide.contactInfo.email}</p>
                            <p><strong>Phone:</strong> {guide.contactInfo.phone}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
                <GuideAvailabilityViewer availability={guide.availability} />
            </div>

             <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold font-heading mb-4">Reviews</h2>
                <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map(review => {
                        const reviewUser = allUsers.find(u => u.id === review.userId);
                        return (
                             <div key={review.id} className="border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <img src={reviewUser?.avatarUrl} alt={reviewUser?.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{reviewUser?.name}</p>
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">{review.comment}</p>
                            </div>
                        )
                    }) : <p className="text-gray-500">No reviews yet for this guide.</p>}
                </div>
            </div>
        </div>
    );
  }
  
  // User Dashboard View
  
  const TabButton: React.FC<{tab: string, children: React.ReactNode}> = ({tab, children}) => (
      <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold rounded-t-lg transition-all duration-200 transform hover:-translate-y-px ${activeTab === tab ? 'bg-white dark:bg-dark-light border-b-2 border-primary text-primary' : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-dark/50'}`}>
          {children}
      </button>
  );

  return (
    <div className="animate-fade-in">
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg mb-8 text-center">
            <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto border-4 border-primary mb-4" />
            <h1 className="text-3xl font-bold font-heading">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            {!user.isPro && <Button variant="secondary" className="mt-4" onClick={props.onUpgrade}>Upgrade to Pro</Button>}
        </div>
      
        <div className="border-b border-gray-200 dark:border-gray-700">
            <TabButton tab="bookings">Bookings</TabButton>
            <TabButton tab="wishlist">Wishlist</TabButton>
            <TabButton tab="rewards">Rewards</TabButton>
            <TabButton tab="settings">Settings</TabButton>
        </div>
        
        <div className="mt-8 bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg min-h-[300px]">
            {activeTab === 'bookings' && <BookingsTab user={user} onOpenReviewModal={props.onOpenReviewModal} />}
            {activeTab === 'wishlist' && <WishlistTab 
                wishlist={user.wishlist || []} 
                onViewPlace={props.onViewPlace}
                onGenerateFromWishlist={() => props.onOpenItineraryBuilder(user.wishlist || [])}
                onNavigateToExplore={() => props.onNavigate(Page.Explore)}
             />}
            {activeTab === 'rewards' && <RewardsTab user={user} onRedeemReward={onRedeemReward} addToast={addToast} />}
            {activeTab === 'settings' && <ProfileSettingsTab user={user} onUpdateUser={onUpdateUser} />}
        </div>

        {user.role === 'user' && !user.hasPendingApplication && (
             <div className="mt-12 p-6 bg-primary/10 rounded-lg text-center">
                <h2 className="text-2xl font-bold font-heading">Want to become a guide?</h2>
                <p className="mt-2 mb-4 text-gray-600 dark:text-gray-300">Share your local expertise and earn money by guiding travelers.</p>
                <Button onClick={() => setShowApplyModal(true)} loading={isApplying}>Apply Now</Button>
            </div>
        )}
        {showApplyModal && <GuideApplicationModal onClose={() => setShowApplyModal(false)} onApply={handleApplyClick} />}
    </div>
  );
};

export default ProfilePage;