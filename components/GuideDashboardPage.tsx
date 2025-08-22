import React, { useMemo } from 'react';
import { User, Guide, Booking, BookingStatus } from '../types';
import Button from './common/Button';
import Badge from './Badge';
import StarRating from './StarRating';

interface GuideDashboardPageProps {
  guideUser: User;
  guides: Guide[];
  bookings: Booking[];
  allUsers: User[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-light dark:bg-dark p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-dark dark:text-light">{value}</p>
        </div>
    </div>
);

const UpcomingBookingCard: React.FC<{ booking: Booking; tourist: User | undefined }> = ({ booking, tourist }) => {
    if (!tourist) return null;

    return (
        <div className="bg-light dark:bg-dark p-4 rounded-lg flex items-center gap-4 border-l-4 border-primary">
            <img src={tourist.avatarUrl} alt={tourist.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-grow">
                <p className="font-bold">{tourist.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
            </div>
            <div className="text-right">
                <p className="font-semibold text-lg">₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{booking.guests} {booking.guests > 1 ? 'guests' : 'guest'}</p>
            </div>
            <Button variant="outline" className="py-2 px-3 text-sm">View</Button>
        </div>
    );
};


const GuideDashboardPage: React.FC<GuideDashboardPageProps> = ({ guideUser, guides, bookings, allUsers }) => {
    const guideProfile = useMemo(() => guides.find(g => g.id === guideUser.id), [guides, guideUser.id]);
    
    const upcomingBookings = useMemo(() => 
        bookings.filter(b => b.guideId === guideUser.id && b.status === BookingStatus.Upcoming)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
        [bookings, guideUser.id]
    );

    const totalEarnings = useMemo(() => 
        bookings
            .filter(b => b.guideId === guideUser.id && b.status === BookingStatus.Completed)
            .reduce((sum, b) => sum + b.totalPrice, 0),
        [bookings, guideUser.id]
    );

    // FIX: All hooks must be called before any conditional returns.
    // The check for guideProfile is moved after all useMemo hooks.
    if (!guideProfile) {
        return <div className="text-center py-10">Error: Guide profile not found.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-dark dark:text-light">Welcome back, {guideUser.name.split(' ')[0]}!</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Here's what's happening with your guide business today.</p>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Earnings Section */}
                    <section>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="Total Earnings" value={`₹${(totalEarnings / 1000).toFixed(1)}k`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                            <StatCard title="Upcoming Bookings" value={upcomingBookings.length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                            <StatCard title="Overall Rating" value={guideProfile.rating.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
                        </div>
                    </section>

                    {/* Upcoming Bookings Section */}
                    <section className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Upcoming Schedule</h2>
                        {upcomingBookings.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingBookings.map(booking => (
                                    <UpcomingBookingCard 
                                        key={booking.id} 
                                        booking={booking} 
                                        tourist={allUsers.find(u => u.id === booking.userId)} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">You have no upcoming bookings.</p>
                        )}
                    </section>
                </div>

                {/* Right Column - Profile */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
                        <img src={guideProfile.avatarUrl} alt={guideProfile.name} className="w-32 h-32 rounded-full mx-auto border-4 border-primary object-cover" />
                        <h2 className="text-2xl font-bold mt-4">{guideProfile.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{guideProfile.location}</p>
                        {guideProfile.verificationStatus === 'verified' ? (
                            <Badge color="green">Verified</Badge>
                        ) : (
                             <Badge color={guideProfile.verificationStatus === 'pending' ? 'yellow' : 'red'}>
                                {guideProfile.verificationStatus.charAt(0).toUpperCase() + guideProfile.verificationStatus.slice(1)}
                             </Badge>
                        )}
                        <div className="flex items-center justify-center mt-2">
                            <StarRating rating={guideProfile.rating} />
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({guideProfile.reviewCount} reviews)</span>
                        </div>
                        <Button variant="outline" className="w-full mt-6">Edit My Profile</Button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default GuideDashboardPage;