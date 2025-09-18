import React, { useMemo, useState } from 'react';
import { User, Guide, Booking, BookingStatus, Vendor, Stay } from '../types';
import Button from './common/Button';
import Badge from './Badge';
import StarRating from './StarRating';
import EarningsChart from './EarningsChart';
import AvailabilityCalendar from './AvailabilityCalendar';


interface GuideDashboardPageProps {
  guideUser: User;
  guides: Guide[];
  bookings: Booking[];
  allUsers: User[];
  vendors: Vendor[];
  stays: Stay[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-light dark:bg-dark p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold font-heading text-dark dark:text-light">{value}</p>
        </div>
    </div>
);

const BookingRow: React.FC<{ booking: Booking; tourist: User | undefined }> = ({ booking, tourist }) => {
    if (!tourist) return null;

    return (
        <div className="bg-light dark:bg-dark p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 border-l-4 border-primary transition-colors hover:bg-light-dark dark:hover:bg-dark-light">
            <img src={tourist.avatarUrl} alt={tourist.name} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-grow">
                <p className="font-bold">{tourist.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
            </div>
            <div className="text-left sm:text-right">
                <p className="font-semibold text-lg">₹{booking.totalPrice.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500">{booking.guests} {booking.guests > 1 ? 'guests' : 'guest'}</p>
            </div>
            <Button variant="outline" className="py-2 px-3 text-sm self-start sm:self-center">View Details</Button>
        </div>
    );
};

const RecommendationCard: React.FC<{ item: Vendor | Stay }> = ({ item }) => (
    <div className="flex items-center gap-4 bg-light dark:bg-dark p-3 rounded-lg">
        <img src={item.avatarUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
        <div className="flex-grow">
            <p className="font-semibold">{item.name}</p>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <StarRating rating={item.rating} />
                <span className="ml-2">({item.reviewCount})</span>
            </div>
        </div>
    </div>
);


const GuideDashboardPage: React.FC<GuideDashboardPageProps> = ({ guideUser, guides, bookings, allUsers, vendors, stays }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const guideProfile = useMemo(() => guides.find(g => g.id === guideUser.id), [guides, guideUser.id]);
    
    const upcomingBookings = useMemo(() => 
        bookings.filter(b => b.guideId === guideUser.id && b.status === BookingStatus.Upcoming)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
        [bookings, guideUser.id]
    );

     const pastBookings = useMemo(() => 
        bookings.filter(b => b.guideId === guideUser.id && b.status === BookingStatus.Completed)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
        [bookings, guideUser.id]
    );

    const totalEarnings = useMemo(() => 
        pastBookings.reduce((sum, b) => sum + b.totalPrice, 0),
        [pastBookings]
    );
    
    const localVendors = useMemo(() => 
        vendors.filter(v => v.location === guideProfile?.location && v.verificationStatus === 'verified'),
        [vendors, guideProfile]
    );

    const localStays = useMemo(() =>
        stays.filter(s => s.location === guideProfile?.location && s.verificationStatus === 'verified'),
        [stays, guideProfile]
    );

    if (!guideProfile) {
        return <div className="text-center py-10">Error: Guide profile not found.</div>;
    }

    const TabButton: React.FC<{tab: 'upcoming' | 'past'; children: React.ReactNode}> = ({tab, children}) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold rounded-md transition-colors text-sm ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark'}`}
        >
            {children}
        </button>
      );

    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light">Welcome back, {guideUser.name.split(' ')[0]}!</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Here's what's happening with your guide business today.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold font-heading mb-1">Earnings Overview</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Your earnings for the last 6 months.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1 bg-light dark:bg-dark p-4 rounded-lg flex flex-col justify-center">
                                <p className="text-sm text-gray-500">Total Earnings (Past Bookings)</p>
                                <p className="text-4xl font-extrabold text-primary">₹{totalEarnings.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="md:col-span-2">
                                <EarningsChart />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold font-heading">My Bookings</h2>
                            <div className="flex items-center gap-2 p-1 bg-light dark:bg-dark rounded-lg">
                                <TabButton tab="upcoming">Upcoming ({upcomingBookings.length})</TabButton>
                                <TabButton tab="past">Past ({pastBookings.length})</TabButton>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {activeTab === 'upcoming' && (
                                upcomingBookings.length > 0 ? (
                                    upcomingBookings.map(booking => (
                                        <BookingRow 
                                            key={booking.id} 
                                            booking={booking} 
                                            tourist={allUsers.find(u => u.id === booking.userId)} 
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">You have no upcoming bookings.</p>
                                )
                            )}
                             {activeTab === 'past' && (
                                pastBookings.length > 0 ? (
                                    pastBookings.map(booking => (
                                        <BookingRow 
                                            key={booking.id} 
                                            booking={booking} 
                                            tourist={allUsers.find(u => u.id === booking.userId)} 
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No completed bookings yet.</p>
                                )
                            )}
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
                        <img src={guideProfile.avatarUrl} alt={guideProfile.name} className="w-32 h-32 rounded-full mx-auto border-4 border-primary object-cover" />
                        <h2 className="text-2xl font-bold font-heading mt-4">{guideProfile.name}</h2>
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
                    <AvailabilityCalendar />
                     <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold font-heading mb-4">Local Recommendations</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-primary mb-2 font-heading">Top Eateries</h4>
                                <div className="space-y-2">
                                    {localVendors.length > 0 ? localVendors.slice(0,2).map(v => <RecommendationCard key={v.id} item={v}/>) : <p className="text-xs text-gray-500">No verified vendors in your area yet.</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-primary mb-2 font-heading">Recommended Stays</h4>
                                <div className="space-y-2">
                                     {localStays.length > 0 ? localStays.slice(0,2).map(s => <RecommendationCard key={s.id} item={s}/>) : <p className="text-xs text-gray-500">No verified stays in your area yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default GuideDashboardPage;