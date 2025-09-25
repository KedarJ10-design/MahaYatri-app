import React, { useState, useMemo } from 'react';
import { User, Booking, BookingStatus, Reward, CompletedBooking, Guide } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';
import Input from './common/Input';
import LazyImage from './common/LazyImage';
import FriendsManagement from './FriendsManagement';

interface ProfilePageProps {
  user: User;
  onApply: () => void;
  allUsers: User[];
  onReview: (booking: Booking) => void;
  // FIX: Add 'bookings' and 'guides' to props to make component data-driven.
  bookings: Booking[];
  guides: Guide[];
}

const rewards: Reward[] = [
    { id: 'reward-1', title: '10% Off Next Booking', description: 'Get a discount on your next guide booking.', pointsRequired: 1000, icon: '%' },
    { id: 'reward-2', title: 'Free Coffee', description: 'Redeem for a free coffee at a partner cafe.', pointsRequired: 500, icon: '☕' },
    { id: 'reward-3', title: 'Unlock a Guide', description: 'Get free access to one guide\'s contact info.', pointsRequired: 2500, icon: '🔑' },
];

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 font-semibold rounded-t-lg border-b-2 transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}>
        {children}
    </button>
);

// FIX: Update BookingCard to accept a 'guides' prop.
const BookingCard: React.FC<{ booking: Booking, onReview: (booking: Booking) => void, guides: Guide[] }> = ({ booking, onReview, guides }) => {
    // FIX: Use the 'guides' prop to find the guide instead of mock data.
    const guide = guides.find(g => g.id === booking.guideId);
    if (!guide) return null;

    const statusStyles: Record<BookingStatus, string> = {
        [BookingStatus.Confirmed]: 'bg-blue-100 text-blue-800',
        [BookingStatus.Completed]: 'bg-green-100 text-green-800',
        [BookingStatus.Cancelled]: 'bg-red-100 text-red-800',
        [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div className="bg-white dark:bg-dark-light p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start gap-4">
            <LazyImage src={guide.avatarUrl} alt={guide.name} className="w-full sm:w-24 h-24 rounded-md object-cover flex-shrink-0" placeholderClassName="rounded-md" />
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{guide.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[booking.status]}`}>{booking.status}</span>
                </div>
                <p className="text-sm text-gray-500">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">{booking.guests} guest(s)</p>
                <p className="font-bold mt-2">Total: ₹{booking.totalPrice.toLocaleString()}</p>
            </div>
            {booking.status === BookingStatus.Completed && !(booking as CompletedBooking).hasBeenReviewed && (
                <Button size="sm" onClick={() => onReview(booking)} className="w-full sm:w-auto mt-2 sm:mt-0">Leave Review</Button>
            )}
        </div>
    );
};


const ProfilePage: React.FC<ProfilePageProps> = ({ user, onApply, allUsers, onReview, bookings, guides }) => {
  const { updateUser, redeemReward } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      name: user.name,
      emergencyContactName: user.emergencyContact.name,
      emergencyContactPhone: user.emergencyContact.phone,
  });
  
  const handleUpdate = async () => {
    await updateUser({
      name: formData.name,
      emergencyContact: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
      }
    });
    setIsEditing(false);
  };
  
  const { upcomingBookings, pastBookings } = useMemo(() => {
      const now = new Date();
      // FIX: Use the 'bookings' prop instead of mock data.
      const userBookings = bookings.filter(b => b.userId === user.id);
      return {
          upcomingBookings: userBookings.filter(b => new Date(b.startDate) >= now && (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending)),
          pastBookings: userBookings.filter(b => new Date(b.startDate) < now || b.status === BookingStatus.Completed || b.status === BookingStatus.Cancelled),
      }
  }, [user.id, bookings]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
      <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-8">
        <LazyImage src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full border-4 border-primary shadow-md" placeholderClassName="rounded-full" />
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold font-heading">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <div className="mt-2 flex items-center justify-center md:justify-start gap-4">
            <div className="text-center">
                <p className="text-2xl font-bold text-primary">{user.points}</p>
                <p className="text-xs text-gray-500">Points</p>
            </div>
             <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{upcomingBookings.length}</p>
                <p className="text-xs text-gray-500">Upcoming Trips</p>
            </div>
          </div>
        </div>
         {user.role === 'user' && !user.hasPendingApplication && (
            <Button onClick={onApply} variant="outline" className="flex-shrink-0">Apply to be a Guide</Button>
         )}
         {user.hasPendingApplication && (
             <p className="p-2 bg-yellow-100 text-yellow-800 text-sm rounded-md text-center">Your guide application is under review.</p>
         )}
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')}>My Bookings</TabButton>
        <TabButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}>Rewards</TabButton>
        <TabButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>Friends</TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</TabButton>
      </div>

      <div>
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
              {upcomingBookings.length > 0 ? upcomingBookings.map(b => <BookingCard key={b.id} booking={b} onReview={onReview} guides={guides} />) : <p className="text-gray-500">No upcoming trips. Time to plan an adventure!</p>}
            </div>
             <div>
              <h2 className="text-xl font-bold mb-4">Past Bookings</h2>
              {pastBookings.length > 0 ? pastBookings.map(b => <BookingCard key={b.id} booking={b} onReview={onReview} guides={guides} />) : <p className="text-gray-500">No past trips found.</p>}
            </div>
          </div>
        )}
        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map(reward => {
              const isRedeemed = user.redeemedRewardIds.includes(reward.id);
              const canAfford = user.points >= reward.pointsRequired;
              return (
                  <div key={reward.id} className={`p-6 rounded-lg shadow-sm flex flex-col text-center ${isRedeemed ? 'bg-gray-100 dark:bg-dark-lighter' : 'bg-white dark:bg-dark-light'}`}>
                    <div className="text-4xl mx-auto">{reward.icon}</div>
                    <h3 className="font-bold text-lg mt-2">{reward.title}</h3>
                    <p className="text-gray-500 text-sm flex-grow">{reward.description}</p>
                    <div className="mt-4">
                        <Button className="w-full" disabled={isRedeemed || !canAfford} onClick={() => redeemReward(reward)}>
                            {isRedeemed ? 'Redeemed' : `${reward.pointsRequired} Points`}
                        </Button>
                    </div>
                  </div>
              );
            })}
          </div>
        )}
        {activeTab === 'friends' && <FriendsManagement currentUser={user} allUsers={allUsers} addToast={(msg, type) => console.log(msg, type)} />}
        {activeTab === 'settings' && (
            <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg max-w-lg mx-auto">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <div className="space-y-4">
                   <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing} />
                   <Input label="Emergency Contact Name" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} disabled={!isEditing} />
                   <Input label="Emergency Contact Phone" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} disabled={!isEditing} />
                </div>
                 <div className="mt-6 flex justify-end gap-4">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleUpdate}>Save Changes</Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
