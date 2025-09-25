import React, { useState, useMemo, useEffect } from 'react';
import { User, Guide, Booking, BookingStatus, AvailabilityStatus } from '../types';
import Button from './common/Button';
import LazyImage from './common/LazyImage';
import AvailabilityCalendar from './AvailabilityCalendar';
import GuideAnalytics from './GuideAnalytics';

interface GuideDashboardPageProps {
  guideUser: User & Guide;
  // FIX: Add 'bookings' and 'allUsers' to props to receive data from parent.
  bookings: Booking[];
  allUsers: User[];
}

// FIX: Update BookingRow to accept 'allUsers' prop.
const BookingRow: React.FC<{ booking: Booking, onUpdateStatus: (bookingId: string, status: BookingStatus) => void, allUsers: User[] }> = ({ booking, onUpdateStatus, allUsers }) => {
    // FIX: Find the tourist from the 'allUsers' prop instead of using mock data.
    const tourist = allUsers.find(u => u.id === booking.userId);
    if (!tourist) return null;

    const statusStyles: Record<BookingStatus, string> = {
        [BookingStatus.Confirmed]: 'bg-blue-100 text-blue-800',
        [BookingStatus.Completed]: 'bg-green-100 text-green-800',
        [BookingStatus.Cancelled]: 'bg-red-100 text-red-800',
        [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    };

    return (
        <tr className="border-b dark:border-gray-700">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <LazyImage src={tourist.avatarUrl} alt={tourist.name} className="w-10 h-10 rounded-full" placeholderClassName="rounded-full" />
                    <div>
                        <p className="font-medium">{tourist.name}</p>
                        <p className="text-sm text-gray-500">{tourist.email}</p>
                    </div>
                </div>
            </td>
            <td className="p-4">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[booking.status]}`}>{booking.status}</span>
            </td>
            <td className="p-4">
                {booking.status === BookingStatus.Pending && (
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => onUpdateStatus(booking.id, BookingStatus.Confirmed)}>Confirm</Button>
                        <Button size="sm" variant="danger" onClick={() => onUpdateStatus(booking.id, BookingStatus.Cancelled)}>Decline</Button>
                    </div>
                )}
                 {booking.status === BookingStatus.Confirmed && (
                    <Button size="sm" onClick={() => onUpdateStatus(booking.id, BookingStatus.Completed)}>Mark as Completed</Button>
                )}
            </td>
        </tr>
    );
};

const GuideDashboardPage: React.FC<GuideDashboardPageProps> = ({ guideUser, bookings: allBookings, allUsers }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState<Booking[]>([]);

    // FIX: Synchronize local bookings state with the passed 'allBookings' prop.
    useEffect(() => {
        setBookings(allBookings.filter(b => b.guideId === guideUser.id));
    }, [allBookings, guideUser.id]);

    const { upcomingBookings, pastBookings, pendingBookings } = useMemo(() => {
        const now = new Date();
        return {
            pendingBookings: bookings.filter(b => b.status === BookingStatus.Pending),
            upcomingBookings: bookings.filter(b => new Date(b.startDate) >= now && b.status === BookingStatus.Confirmed),
            pastBookings: bookings.filter(b => new Date(b.startDate) < now || b.status === BookingStatus.Completed || b.status === BookingStatus.Cancelled),
        };
    }, [bookings]);

    const handleUpdateAvailability = async (guideId: string, newAvailability: Record<string, AvailabilityStatus | undefined>) => {
        // Mock update
        console.log("Updating availability for", guideId, newAvailability);
        // In a real app, you would call a service to update this in the backend.
        // For the mock, we can't easily update the guideUser prop, so we'll just log it.
        alert("Availability updated (check console). This is a mock action.");
    };

    const handleUpdateStatus = (bookingId: string, status: BookingStatus) => {
        // FIX: Cast the updated booking object to 'Booking' to resolve the discriminated union type error.
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } as Booking : b));
        // In real app, call a service here: await updateBookingStatus(bookingId, status);
        alert(`Booking status updated to ${status}. This is a mock action.`);
    };

    const TabButton: React.FC<{ name: string, label: string }> = ({ name, label }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 font-semibold rounded-t-lg border-b-2 transition-colors ${activeTab === name ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-8">
                <LazyImage src={guideUser.avatarUrl} alt={guideUser.name} className="w-32 h-32 rounded-full border-4 border-primary shadow-md" placeholderClassName="rounded-full" />
                <div className="flex-grow text-center md:text-left">
                    <h1 className="text-3xl font-bold font-heading">Welcome, {guideUser.name.split(' ')[0]}!</h1>
                    <p className="text-gray-500">Here's your guide dashboard.</p>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <TabButton name="dashboard" label="Dashboard" />
                <TabButton name="bookings" label="Bookings" />
                <TabButton name="availability" label="Availability" />
            </div>

            {activeTab === 'dashboard' && <GuideAnalytics guide={guideUser} bookings={bookings} />}

            {activeTab === 'bookings' && (
                <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold font-heading mb-4">Manage Bookings</h2>
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-xl font-bold mb-2">Pending Requests ({pendingBookings.length})</h3>
                            {pendingBookings.length > 0 ? (
                                <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-dark-lighter"><tr><th className="p-4">Tourist</th><th className="p-4">Dates</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                                    {/* FIX: Pass 'allUsers' prop to BookingRow. */}
                                    <tbody>{pendingBookings.map(b => <BookingRow key={b.id} booking={b} onUpdateStatus={handleUpdateStatus} allUsers={allUsers} />)}</tbody>
                                </table>
                                </div>
                            ) : <p className="text-gray-500">No pending requests.</p>}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Upcoming Tours ({upcomingBookings.length})</h3>
                             {upcomingBookings.length > 0 ? (
                                <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-dark-lighter"><tr><th className="p-4">Tourist</th><th className="p-4">Dates</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
                                    {/* FIX: Pass 'allUsers' prop to BookingRow. */}
                                    <tbody>{upcomingBookings.map(b => <BookingRow key={b.id} booking={b} onUpdateStatus={handleUpdateStatus} allUsers={allUsers} />)}</tbody>
                                </table>
                                </div>
                            ) : <p className="text-gray-500">No upcoming tours scheduled.</p>}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'availability' && (
                <div>
                    <AvailabilityCalendar guide={guideUser} onUpdateAvailability={handleUpdateAvailability} />
                </div>
            )}
        </div>
    );
};

export default GuideDashboardPage;
