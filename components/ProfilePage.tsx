import React, { useState } from 'react';
import { User, Booking, Guide, BookingStatus, Reward } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import Badge from './Badge';
import { useAuth } from '../contexts/AuthContext';
import GuideApplicationModal from './GuideApplicationModal';
import ReviewModal from './ReviewModal';
import FriendsManagement from './FriendsManagement';

const rewards: Reward[] = [
    { id: 'reward-1', title: 'Coffee on Us', description: 'Get a voucher for a free coffee at a local cafe.', pointsRequired: 500, icon: '☕' },
    { id: 'reward-2', title: 'Museum Ticket', description: 'Free entry to a state museum of your choice.', pointsRequired: 1500, icon: '🏛️' },
    { id: 'reward-3', title: '10% Off Next Tour', description: 'Get a 10% discount on your next guide booking.', pointsRequired: 2500, icon: '💸' },
];

const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Pending: return 'yellow';
        case BookingStatus.Confirmed: return 'blue';
        case BookingStatus.Completed: return 'green';
        case BookingStatus.Cancelled: return 'red';
        default: return 'gray';
    }
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 font-semibold transition-colors duration-200 text-sm sm:text-base ${active ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
    >
        {children}
    </button>
);


const ProfilePage: React.FC<{
    user: User,
    allUsers: User[],
    bookings: Booking[],
    guides: Guide[],
    addToast: (message: string, type: 'success' | 'error') => void
}> = ({ user, allUsers, bookings, guides, addToast }) => {
    const { updateUser, redeemReward } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        name: user.name,
        emergencyContactName: user.emergencyContact.name,
        emergencyContactPhone: user.emergencyContact.phone,
    });
    
    const handleSave = async () => {
        try {
            await updateUser({
                name: formData.name,
                emergencyContact: {
                    name: formData.emergencyContactName,
                    phone: formData.emergencyContactPhone,
                },
            });
            addToast('Profile updated successfully!', 'success');
            setIsEditing(false);
        } catch (error) {
            addToast('Failed to update profile.', 'error');
        }
    };

    const handleRedeem = async (reward: Reward) => {
        if (user.points < reward.pointsRequired) {
            addToast("Not enough points!", "error");
            return;
        }
        try {
            await redeemReward(reward);
            addToast(`"${reward.title}" redeemed!`, "success");
        } catch (error) {
            addToast("Failed to redeem reward.", "error");
        }
    }
    
    const upcomingBookings = bookings.filter(b => new Date(b.endDate) >= new Date() && b.status !== BookingStatus.Cancelled);
    const pastBookings = bookings.filter(b => new Date(b.endDate) < new Date() || b.status === BookingStatus.Cancelled || b.status === BookingStatus.Completed);
    
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-8">
                <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full border-4 border-primary shadow-md" />
                <div className="text-center md:text-left flex-grow">
                    <h1 className="text-4xl font-extrabold font-heading">{user.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    {user.isPro && <Badge color="yellow">MahaYatri Pro</Badge>}
                </div>
                {!isEditing && activeTab === 'profile' && <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-dark-light p-2 rounded-2xl shadow-lg flex justify-center gap-4">
                <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>Profile & Bookings</TabButton>
                <TabButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}>Rewards</TabButton>
                <TabButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')}>Friends</TabButton>
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in-slow">
                {activeTab === 'profile' && (
                    <div className="space-y-8">
                        {/* Profile Details & Emergency Contact */}
                        <div className={`bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg ${isEditing ? 'block' : 'hidden'} md:block`}>
                            <h2 className="text-2xl font-bold font-heading mb-6">My Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing} />
                                <Input label="Emergency Contact Name" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} disabled={!isEditing} />
                                <Input label="Emergency Contact Phone" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} disabled={!isEditing} />
                            </div>
                            {isEditing && (
                                <div className="mt-6 flex justify-end gap-4">
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button onClick={handleSave}>Save Changes</Button>
                                </div>
                            )}
                        </div>
                        {/* Bookings */}
                        <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold font-heading mb-6">My Bookings</h2>
                            <h3 className="font-semibold mb-2">Upcoming</h3>
                            {upcomingBookings.length > 0 ? upcomingBookings.map(booking => {
                                const guide = guides.find(g => g.id === booking.guideId);
                                return <div key={booking.id} className="p-3 mb-2 bg-light dark:bg-dark rounded-lg flex justify-between items-center">
                                    <p>Tour with <strong>{guide?.name || '...'}</strong> on {new Date(booking.startDate).toLocaleDateString()}</p>
                                    <Badge color={getStatusBadgeColor(booking.status)}>{booking.status}</Badge>
                                </div>
                            }) : <p className="text-gray-500">No upcoming bookings.</p>}
                            
                            <h3 className="font-semibold mb-2 mt-6">Past</h3>
                            {pastBookings.length > 0 ? pastBookings.map(booking => {
                                const guide = guides.find(g => g.id === booking.guideId);
                                return <div key={booking.id} className="p-3 mb-2 bg-light dark:bg-dark rounded-lg flex justify-between items-center">
                                    <div>
                                        <p>Tour with <strong>{guide?.name || '...'}</strong> on {new Date(booking.startDate).toLocaleDateString()}</p>
                                        <Badge color={getStatusBadgeColor(booking.status)}>{booking.status}</Badge>
                                    </div>
                                    {booking.status === BookingStatus.Completed && !booking.hasBeenReviewed && <Button size="sm" onClick={() => setBookingToReview(booking)}>Leave a Review</Button>}
                                </div>
                            }) : <p className="text-gray-500">No past bookings.</p>}
                        </div>
                    </div>
                )}
                {activeTab === 'rewards' && (
                     <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
                         <h2 className="text-2xl font-bold font-heading mb-6">My Points & Rewards</h2>
                         <p className="text-5xl font-extrabold text-primary text-center mb-6">{user.points} <span className="text-2xl text-gray-500">Points</span></p>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {rewards.map(reward => (
                                <div key={reward.id} className={`p-4 rounded-lg border-2 text-center ${user.redeemedRewardIds.includes(reward.id) ? 'bg-gray-100 dark:bg-dark' : 'bg-light dark:bg-dark-lighter'}`}>
                                    <span className="text-4xl">{reward.icon}</span>
                                    <h3 className="font-bold mt-2">{reward.title}</h3>
                                    <p className="text-sm text-gray-500 h-12">{reward.description}</p>
                                    <Button
                                        className="w-full mt-4"
                                        disabled={user.points < reward.pointsRequired || user.redeemedRewardIds.includes(reward.id)}
                                        onClick={() => handleRedeem(reward)}
                                    >
                                        {user.redeemedRewardIds.includes(reward.id) ? 'Redeemed' : `Redeem (${reward.pointsRequired} pts)`}
                                    </Button>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
                {activeTab === 'friends' && (
                    <FriendsManagement currentUser={user} allUsers={allUsers} addToast={addToast} />
                )}
            </div>

            {/* Guide Application CTA */}
            {user.role === 'user' && !user.hasPendingApplication && (
                 <div className="bg-gradient-to-r from-primary to-accent text-white p-8 rounded-2xl shadow-lg text-center">
                    <h2 className="text-3xl font-bold font-heading">Become a Local Guide!</h2>
                    <p className="mt-2 max-w-xl mx-auto">Share your passion for Maharashtra, meet travelers from around the world, and earn on your own schedule.</p>
                    <Button onClick={() => setIsApplying(true)} className="mt-6 bg-white text-primary hover:bg-white/90">Apply Now</Button>
                </div>
            )}
            {user.hasPendingApplication && (
                <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 p-4 rounded-lg text-center">
                    Your guide application is currently under review.
                </div>
            )}
            
            {isApplying && <GuideApplicationModal onClose={() => setIsApplying(false)} addToast={addToast} />}
            {bookingToReview && <ReviewModal booking={bookingToReview} onClose={() => setBookingToReview(null)} addToast={addToast} />}
        </div>
    );
};

export default ProfilePage;