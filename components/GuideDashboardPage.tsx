import React, { useState, useMemo } from 'react';
import { User, Guide, Booking, Review, BookingStatus, AvailabilityStatus } from '../types';
import Button from './common/Button';
import AvailabilityCalendar from './AvailabilityCalendar';
import GuideAnalytics from './GuideAnalytics';
import LazyImage from './common/LazyImage';
import Badge from './common/Badge';

interface GuideDashboardPageProps {
  guideUser: User & Guide;
  bookings: Booking[];
  allUsers: User[];
  reviews: Review[];
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 font-semibold transition-colors rounded-t-lg border-b-2 ${active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}>
        {children}
    </button>
);

const BookingRow: React.FC<{ booking: Booking, tourist?: User, onRespond: (bookingId: string, status: 'Confirmed' | 'Cancelled') => void }> = ({ booking, tourist, onRespond }) => {
    const statusStyles: Record<BookingStatus, string> = {
        [BookingStatus.Confirmed]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        [BookingStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        [BookingStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    
    return (
        <div className="bg-white dark:bg-dark-light p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <LazyImage src={tourist?.avatarUrl || ''} alt={tourist?.name || 'Tourist'} className="w-16 h-16 rounded-full flex-shrink-0" placeholderClassName="rounded-full" />
            <div className="flex-grow">
                <h3 className="font-bold">{tourist?.name || 'Unknown User'}</h3>
                <p className="text-sm text-gray-500">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">{booking.guests} guest(s) - Total: ₹{booking.totalPrice.toLocaleString()}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {booking.status === BookingStatus.Pending ? (
                    <>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => onRespond(booking.id, 'Cancelled')}>Decline</Button>
                        <Button size="sm" className="w-full" onClick={() => onRespond(booking.id, 'Confirmed')}>Accept</Button>
                    </>
                ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[booking.status]}`}>{booking.status}</span>
                )}
            </div>
        </div>
    );
};


const GuideDashboardPage: React.FC<GuideDashboardPageProps> = ({ guideUser, bookings, allUsers, reviews }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const guideBookings = useMemo(() => bookings.filter(b => b.guideId === guideUser.id), [bookings, guideUser.id]);
    const pendingBookings = useMemo(() => guideBookings.filter(b => b.status === BookingStatus.Pending), [guideBookings]);
    const upcomingBookings = useMemo(() => guideBookings.filter(b => b.status === BookingStatus.Confirmed && new Date(b.startDate) >= new Date()), [guideBookings]);
    const pastBookings = useMemo(() => guideBookings.filter(b => b.status === BookingStatus.Completed || b.status === BookingStatus.Cancelled || (b.status === BookingStatus.Confirmed && new Date(b.startDate) < new Date())), [guideBookings]);
    
    const guideReviews = useMemo(() => reviews.filter(r => r.guideId === guideUser.id), [reviews, guideUser.id]);

    const handleUpdateAvailability = async (guideId: string, newAvailability: Record<string, AvailabilityStatus | undefined>) => {
        // In a real app, this would call a Firebase function to update the guide's document.
        console.log("Updating availability for", guideId, newAvailability);
        // For demo purposes, we'll assume it succeeds.
        alert("Availability updated! (Note: This is a demo and is not persisted.)");
        return Promise.resolve();
    };

    const handleBookingResponse = (bookingId: string, status: 'Confirmed' | 'Cancelled') => {
        console.log(`Responding to booking ${bookingId} with ${status}`);
        // In a real app, this would update the booking document in Firestore.
        alert(`Booking request ${status.toLowerCase()}! (Note: This is a demo and is not persisted.)`);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return <GuideAnalytics bookings={guideBookings} reviews={guideReviews} />;
            case 'bookings':
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Pending Requests ({pendingBookings.length})</h2>
                            {pendingBookings.length > 0 ? (
                                pendingBookings.map(b => <BookingRow key={b.id} booking={b} tourist={allUsers.find(u => u.id === b.userId)} onRespond={handleBookingResponse} />)
                            ) : <p className="text-gray-500">No pending requests.</p>}
                        </div>
                         <div>
                            <h2 className="text-xl font-bold mb-4">Upcoming Tours ({upcomingBookings.length})</h2>
                            {upcomingBookings.length > 0 ? (
                                upcomingBookings.map(b => <BookingRow key={b.id} booking={b} tourist={allUsers.find(u => u.id === b.userId)} onRespond={handleBookingResponse} />)
                            ) : <p className="text-gray-500">No upcoming tours scheduled.</p>}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4">Past Tours</h2>
                            {pastBookings.length > 0 ? (
                                pastBookings.map(b => <BookingRow key={b.id} booking={b} tourist={allUsers.find(u => u.id === b.userId)} onRespond={handleBookingResponse} />)
                            ) : <p className="text-gray-500">No past tours yet.</p>}
                        </div>
                    </div>
                );
            case 'availability':
                return <AvailabilityCalendar guide={guideUser} onUpdateAvailability={handleUpdateAvailability} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-8">
             <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg flex items-center gap-8">
                <LazyImage src={guideUser.avatarUrl} alt={guideUser.name} className="w-32 h-32 rounded-full border-4 border-primary shadow-md" placeholderClassName="rounded-full" />
                <div>
                    <h1 className="text-3xl font-bold font-heading">{guideUser.name}</h1>
                    <p className="text-gray-500">Your Guide Dashboard</p>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
                <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')}>Bookings</TabButton>
                <TabButton active={activeTab === 'availability'} onClick={() => setActiveTab('availability')}>Availability</TabButton>
            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default GuideDashboardPage;
