import React, { useState, useMemo } from 'react';
import { User, Guide, Booking, BookingStatus, Page, Achievement, PlaceSuggestion, Reward, Review } from '../types';
import Button from './common/Button';
import Badge from './Badge';
import StarRating from './StarRating';
import Input from './common/Input';
import Spinner from './common/Spinner';

interface ProfilePageProps {
  user: User;
  guide: Guide | null;
  guides: Guide[];
  bookings: Booking[];
  reviews: Review[];
  allUsers: User[];
  wishlist: PlaceSuggestion[];
  onBookGuide: (guide: Guide) => void;
  onNavigate: (page: Page) => void;
  onToggleWishlist: (place: PlaceSuggestion) => void;
  onViewPlace: (place: PlaceSuggestion) => void;
  onOpenItineraryBuilder: (places: PlaceSuggestion[]) => void;
  onUpdateUser: (user: User) => void;
  onUpgrade: () => void;
  onUnlockGuide: (guide: Guide) => Promise<void>;
  onStartChat: (guideId: string) => void;
  onOpenReviewModal: (booking: Booking) => void;
}

const mockRewards: Reward[] = [
    {
        id: 'reward-1',
        title: '10% Off Next Guide Booking',
        description: 'Get a discount on your next adventure with any verified guide.',
        pointsRequired: 5000,
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
    },
    {
        id: 'reward-2',
        title: 'Free Entry to a Heritage Site',
        description: 'Redeem for a free entry ticket to a selected Maharashtra heritage fort or monument.',
        pointsRequired: 2500,
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    },
    {
        id: 'reward-3',
        title: 'Complimentary Local Thali',
        description: 'Enjoy a delicious, authentic Maharashtrian thali at a partner restaurant.',
        pointsRequired: 1500,
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454V8.454c.523 0 1.046-.151 1.5-.454a2.704 2.704 0 013 0 2.704 2.704 0 003 0 2.704 2.704 0 013 0 2.704 2.704 0 003 0c.454.303.977.454 1.5.454v7.092zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }
];

const WishlistCard: React.FC<{ place: PlaceSuggestion; onView: () => void; onRemove: () => void; onSelect: (checked: boolean) => void; isSelected: boolean; }> = ({ place, onView, onRemove, onSelect, isSelected }) => (
    <div className="bg-light dark:bg-dark p-4 rounded-lg shadow-md flex items-start gap-4">
        <input type="checkbox" checked={isSelected} onChange={(e) => onSelect(e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
        <div className="flex-grow">
            <Badge color="blue">{place.type}</Badge>
            <h4 className="text-xl font-bold mt-2">{place.name}</h4>
            <p className="text-gray-600 dark:text-gray-400">{place.destination}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Button onClick={onView} variant="outline" className="py-2 px-4 text-sm w-full">View</Button>
            <Button onClick={onRemove} variant="ghost" className="text-red-500 py-2 px-4 text-sm w-full">Remove</Button>
        </div>
    </div>
);

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-4 rounded-lg flex items-center gap-4 border-2 ${achievement.isUnlocked ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-gray-100 border-gray-200 dark:bg-dark dark:border-gray-700 opacity-60'}`}>
        <div className={`p-3 rounded-full ${achievement.isUnlocked ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-100' : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
            {achievement.icon}
        </div>
        <div>
            <h4 className="font-bold text-lg text-dark dark:text-light">{achievement.title}</h4>
            <p className="text-gray-600 dark:text-gray-400">{achievement.description}</p>
        </div>
    </div>
);

const RewardCard: React.FC<{ reward: Reward; userPoints: number }> = ({ reward, userPoints }) => {
    const canRedeem = userPoints >= reward.pointsRequired;
    return (
        <div className={`p-5 rounded-lg flex items-center gap-5 border-2 ${canRedeem ? 'bg-light dark:bg-dark' : 'bg-gray-100 dark:bg-dark-light opacity-70'}`}>
            <div className={`p-4 rounded-full ${canRedeem ? 'bg-secondary/20 text-secondary-dark' : 'bg-gray-200 text-gray-500 dark:bg-gray-600'}`}>
                {reward.icon}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-dark dark:text-light">{reward.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{reward.description}</p>
                <p className="font-bold text-primary mt-1">{reward.pointsRequired.toLocaleString()} PTS</p>
            </div>
            <Button disabled={!canRedeem} className="py-2 px-4 text-sm">Redeem</Button>
        </div>
    );
};

const BookingCard: React.FC<{ booking: Booking; guides: Guide[]; onOpenReviewModal: (booking: Booking) => void; }> = ({ booking, guides, onOpenReviewModal }) => {
    const guide = guides.find(g => g.id === booking.guideId);
    if (!guide) return null;

    return (
        <div className="bg-light dark:bg-dark p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img src={guide.avatarUrl} alt={guide.name} className="w-full sm:w-24 h-32 sm:h-24 rounded-md object-cover"/>
            <div className="flex-grow">
                <h4 className="text-xl font-bold">{guide.name}</h4>
                <p className="text-gray-600 dark:text-gray-400">{guide.location}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
            </div>
            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                 <p className="font-semibold text-lg mb-2">₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                 {booking.status === BookingStatus.Completed ? (
                    <div className="text-right">
                        <Button variant="secondary" className="py-2 px-4 text-sm" onClick={() => onOpenReviewModal(booking)} disabled={booking.hasBeenReviewed}>
                            {booking.hasBeenReviewed ? 'Reviewed' : 'Rate Guide'}
                        </Button>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">+ {booking.pointsEarned} PTS</p>
                    </div>
                 ) : (
                    <Button variant="outline" className="py-2 px-4 text-sm">View Details</Button>
                 )}
            </div>
        </div>
    )
}

const Dashboard: React.FC<Omit<ProfilePageProps, 'guide' | 'reviews' | 'allUsers' | 'onBookGuide' | 'onUnlockGuide' | 'onStartChat'>> = ({ user, bookings, guides, wishlist, onNavigate, onToggleWishlist, onViewPlace, onOpenItineraryBuilder, onUpdateUser, onUpgrade, onOpenReviewModal }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [selectedPlaces, setSelectedPlaces] = useState<PlaceSuggestion[]>([]);


  const upcomingBookings = bookings.filter(b => b.status === BookingStatus.Upcoming);
  const pastBookings = bookings.filter(b => b.status === BookingStatus.Completed);

  const achievements: Achievement[] = useMemo(() => [
        {
            id: 'explorer',
            title: 'Maharashtra Explorer',
            description: 'Begin your journey by creating an account.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10V7m0 0L5 5m4 2l6-3m-6 3l6 10" /></svg>,
            isUnlocked: true,
        },
        {
            id: 'first_trip',
            title: 'First Trip',
            description: 'Complete your first trip with a guide.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
            isUnlocked: pastBookings.length >= 1,
        },
        {
            id: 'seasoned_traveler',
            title: 'Seasoned Traveler',
            description: 'Complete three trips with local guides.',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
            isUnlocked: pastBookings.length >= 3,
        }
    ], [pastBookings.length]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({...prev, [name]: value }));
  }
  
  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({...prev, emergencyContact: { ...prev.emergencyContact, [name]: value }}));
  }

  const handleSaveChanges = () => {
    onUpdateUser(editedUser);
    setIsEditingProfile(false);
  }
  
  const handleSelectPlace = (place: PlaceSuggestion, isSelected: boolean) => {
    if (isSelected) {
        setSelectedPlaces(prev => [...prev, place]);
    } else {
        setSelectedPlaces(prev => prev.filter(p => !(p.name === place.name && p.destination === place.destination)));
    }
  };

  const TabButton: React.FC<{tab: string; children: React.ReactNode}> = ({tab, children}) => (
    <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 md:px-6 py-3 font-semibold rounded-t-lg transition-colors border-b-2 text-sm md:text-base ${activeTab === tab ? 'text-primary border-primary' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-orange-400'}`}
    >
        {children}
    </button>
  );

  return (
    <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
            <img src={user.avatarUrl} alt={user.name} className="w-28 h-28 rounded-full border-4 border-primary object-cover" />
            <div className="text-center sm:text-left">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <h1 className="text-4xl font-bold">{user.name}</h1>
                  {user.isPro && <Badge color="yellow">PRO</Badge>}
                </div>
                <p className="text-lg text-gray-500 dark:text-gray-400">{user.email}</p>
                 <div className="mt-2 flex items-center gap-4 justify-center sm:justify-start">
                    <div className="flex items-center font-semibold text-secondary">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1V3a1 1 0 112 0v1h2a1 1 0 110 2h-2v1a1 1 0 11-2 0V6H6a1 1 0 01-1-1V3a1 1 0 011-1zm10 4a1 1 0 011 1v6a1 1 0 11-2 0V7a1 1 0 011-1zM5 10a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                       {user.points.toLocaleString()} PTS
                    </div>
                    {!user.isPro && <Button onClick={onUpgrade} variant="secondary" className="py-1 px-3 text-sm">Upgrade to PRO</Button>}
                </div>
            </div>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700">
             <div className="flex flex-wrap space-x-0 md:space-x-4">
                <TabButton tab="upcoming">Upcoming Trips ({upcomingBookings.length})</TabButton>
                <TabButton tab="past">Past Bookings ({pastBookings.length})</TabButton>
                <TabButton tab="wishlist">My Wishlist ({wishlist.length})</TabButton>
                <TabButton tab="achievements">Achievements</TabButton>
                <TabButton tab="rewards">Rewards</TabButton>
                <TabButton tab="profile">My Profile</TabButton>
             </div>
        </div>

        <div className="bg-white dark:bg-dark-light p-6 md:p-8 rounded-b-2xl shadow-lg mt-[-1px]">
            {activeTab === 'upcoming' && (
                <div className="space-y-4 animate-fade-in">
                    {upcomingBookings.length > 0 ? (
                        upcomingBookings.map(b => <BookingCard key={b.id} booking={b} guides={guides} onOpenReviewModal={onOpenReviewModal} />)
                    ) : (
                        <div className="text-center py-8">
                            <h3 className="text-xl font-semibold">No upcoming trips</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Time to plan your next adventure!</p>
                            <Button onClick={() => onNavigate(Page.Search)} className="mt-4">Find a Guide</Button>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'past' && (
                <div className="space-y-4 animate-fade-in">
                   {pastBookings.length > 0 ? (
                        pastBookings.map(b => <BookingCard key={b.id} booking={b} guides={guides} onOpenReviewModal={onOpenReviewModal} />)
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400 py-8">Your past adventures will appear here.</p>
                    )}
                </div>
            )}
            {activeTab === 'wishlist' && (
                <div className="animate-fade-in">
                    {wishlist.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {wishlist.map(place => (
                                    <WishlistCard 
                                        key={place.name + place.destination} 
                                        place={place} 
                                        onView={() => onViewPlace(place)} 
                                        onRemove={() => onToggleWishlist(place)}
                                        isSelected={selectedPlaces.some(p => p.name === place.name && p.destination === place.destination)}
                                        onSelect={(isChecked) => handleSelectPlace(place, isChecked)}
                                    />
                                ))}
                            </div>
                            {selectedPlaces.length > 0 && (
                                <div className="mt-6 text-center p-4 bg-primary/10 rounded-lg">
                                    <Button onClick={() => onOpenItineraryBuilder(selectedPlaces)}>
                                        Plan a Trip with {selectedPlaces.length} Selected Places
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                         <div className="text-center py-8">
                            <h3 className="text-xl font-semibold">Your wishlist is empty</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Explore places and save your favorites!</p>
                            <Button onClick={() => onNavigate(Page.Explore)} className="mt-4">Explore Places</Button>
                        </div>
                    )}
                </div>
            )}
             {activeTab === 'achievements' && (
                 <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map(ach => <AchievementCard key={ach.id} achievement={ach}/>)}
                 </div>
            )}
            {activeTab === 'rewards' && (
                 <div className="animate-fade-in space-y-4">
                    {mockRewards.map(reward => <RewardCard key={reward.id} reward={reward} userPoints={user.points} />)}
                 </div>
            )}
            {activeTab === 'profile' && (
                 <div className="animate-fade-in">
                    <div className="space-y-6">
                        <Input label="Full Name" name="name" value={editedUser.name} onChange={handleProfileChange} disabled={!isEditingProfile} />
                        <Input label="Email Address" name="email" type="email" value={editedUser.email} onChange={handleProfileChange} disabled={!isEditingProfile} />
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-light dark:bg-dark border dark:border-gray-700">
                                <Input label="Contact Name" name="name" value={editedUser.emergencyContact.name} onChange={handleEmergencyContactChange} disabled={!isEditingProfile} />
                                <Input label="Contact Phone" name="phone" type="tel" value={editedUser.emergencyContact.phone} onChange={handleEmergencyContactChange} disabled={!isEditingProfile} />
                             </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center flex justify-center gap-4">
                        {isEditingProfile ? (
                            <>
                                <Button variant='outline' onClick={() => { setIsEditingProfile(false); setEditedUser(user); }}>Cancel</Button>
                                <Button onClick={handleSaveChanges}>Save Changes</Button>
                            </>
                        ) : (
                            <Button variant='outline' onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
                        )}
                    </div>
                 </div>
            )}
        </div>
    </div>
  );
};


const ReviewCard: React.FC<{ review: Review; allUsers: User[] }> = ({ review, allUsers }) => {
    const reviewer = allUsers.find(u => u.id === review.userId) || { name: 'Anonymous', avatarUrl: 'https://picsum.photos/seed/anon/200/200'};

    return (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
                <img src={reviewer.avatarUrl} alt={reviewer.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <div className="flex items-center gap-4">
                        <h4 className="font-bold">{reviewer.name}</h4>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{review.comment}</p>
                </div>
            </div>
        </div>
    );
};

const GuideProfile: React.FC<{ guide: Guide; reviews: Review[]; allUsers: User[]; onBook: () => void; onUnlock: (guide: Guide) => Promise<void>; isUnlocked: boolean; onStartChat: (guideId: string) => void; }> = ({ guide, reviews, allUsers, onBook, onUnlock, isUnlocked, onStartChat }) => {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [activeTab, setActiveTab] = useState('about');
    
    const guideReviews = useMemo(() => reviews.filter(r => r.guideId === guide.id), [reviews, guide.id]);
    const averageRating = useMemo(() => {
        if (guideReviews.length === 0) return guide.rating;
        const total = guideReviews.reduce((sum, review) => sum + review.rating, 0);
        return parseFloat((total / guideReviews.length).toFixed(1));
    }, [guideReviews, guide.rating]);


    const handleUnlockClick = async () => {
        setIsUnlocking(true);
        try {
            await onUnlock(guide);
        } catch (error) {
            console.error("Unlock failed in component", error);
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-lg overflow-hidden animate-fade-in">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img className="h-full w-full object-cover md:w-64" src={guide.avatarUrl} alt={guide.name} />
          </div>
          <div className="p-8 flex-1">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-dark dark:text-light">{guide.name}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">{guide.location}</p>
                </div>
                {guide.verificationStatus === 'verified' && <Badge color="green">Verified Guide</Badge>}
            </div>
            <div className="flex items-center mb-4">
              <StarRating rating={averageRating} />
              <span className="text-gray-600 dark:text-gray-400 ml-2">{averageRating} ({guideReviews.length} reviews)</span>
            </div>
            
            <div className="mt-6 flex items-center justify-between bg-light dark:bg-dark p-4 rounded-lg">
                <p className="text-2xl font-bold text-primary">₹{guide.pricePerDay.toLocaleString('en-IN')}<span className="text-base font-normal text-gray-600 dark:text-gray-400">/day</span></p>
                <Button onClick={onBook}>Book a Tour</Button>
            </div>
          </div>
        </div>
        
        <div className="border-b border-t border-gray-200 dark:border-gray-700">
            <div className="flex px-4">
                <button onClick={() => setActiveTab('about')} className={`px-6 py-3 font-semibold border-b-2 ${activeTab === 'about' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-primary'}`}>About</button>
                <button onClick={() => setActiveTab('gallery')} className={`px-6 py-3 font-semibold border-b-2 ${activeTab === 'gallery' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-primary'}`}>Gallery</button>
                <button onClick={() => setActiveTab('reviews')} className={`px-6 py-3 font-semibold border-b-2 ${activeTab === 'reviews' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-primary'}`}>Reviews ({guideReviews.length})</button>
            </div>
        </div>
        
        <div className="p-8">
            {activeTab === 'about' && (
                <div className="animate-fade-in">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{guide.bio}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Specialties</h3>
                            <div className="flex flex-wrap gap-2">{guide.specialties.map(s => <Badge key={s}>{s}</Badge>)}</div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Languages</h3>
                            <div className="flex flex-wrap gap-2">{guide.languages.map(l => <Badge key={l} color='blue'>{l}</Badge>)}</div>
                        </div>
                    </div>
                     {isUnlocked ? (
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                            <h3 className="font-semibold text-lg text-green-800 dark:text-green-200 mb-2">Contact Information</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-700 dark:text-green-300"><strong>Phone:</strong> {guide.contactInfo.phone}</p>
                                        <p className="text-green-700 dark:text-green-300"><strong>Email:</strong> {guide.contactInfo.email}</p>
                                    </div>
                                    <Button variant="outline" onClick={() => onStartChat(guide.id)}>Chat with {guide.name.split(' ')[0]}</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-light dark:bg-dark border dark:border-gray-200 dark:border-gray-700 text-center">
                            <h3 className="font-semibold text-lg">Unlock Contact Info</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Get direct access to this guide to plan your trip.</p>
                            <Button onClick={handleUnlockClick} disabled={isUnlocking}>
                                {isUnlocking ? (
                                    <span className="flex items-center justify-center">
                                        <Spinner /> <span className="ml-2">Processing...</span>
                                    </span>
                                ) : (
                                    `Unlock for ₹${guide.contactUnlockPrice}`
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'gallery' && (
                 <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {guide.gallery.map((img, i) => <img key={i} src={img} alt={`${guide.name} gallery ${i+1}`} className="rounded-lg object-cover h-48 w-full"/>)}
                </div>
            )}
             {activeTab === 'reviews' && (
                 <div className="animate-fade-in">
                    {guideReviews.length > 0 ? (
                        guideReviews.map(review => <ReviewCard key={review.id} review={review} allUsers={allUsers} />)
                    ) : (
                        <p className="text-center text-gray-500 py-8">This guide has no reviews yet.</p>
                    )}
                 </div>
            )}
        </div>
      </div>
    );
};

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
  const { user, guide, onBookGuide, onUnlockGuide, onStartChat, reviews, allUsers } = props;
  
  if (guide) {
    const isUnlocked = user.unlockedGuideIds.includes(guide.id);
    return <GuideProfile guide={guide} reviews={reviews} allUsers={allUsers} onBook={() => onBookGuide(guide)} onUnlock={onUnlockGuide} isUnlocked={isUnlocked} onStartChat={onStartChat} />;
  }
  
  return <Dashboard {...props} />;
};

export default ProfilePage;