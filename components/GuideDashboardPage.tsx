
import React, { useState, useMemo } from 'react';
import { User, Guide, Booking, BookingStatus } from '../types';
import { mockBookings, mockGuides } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';
import AvailabilityCalendar from './AvailabilityCalendar';
import EarningsChart from './EarningsChart';
import StarRating from './StarRating';
import LazyImage from './common/LazyImage';

interface GuideDashboardPageProps {
  guideUser: User;
}

const GuideDashboardPage: React.FC<GuideDashboardPageProps> = ({ guideUser }) => {
  const { updateUser } = useAuth();
  // Find the full guide profile from mock data
  const guideProfile = mockGuides.find(g => g.id === guideUser.id);
  
  const bookings = useMemo(() => mockBookings.filter(b => b.guideId === guideUser.id), [guideUser.id]);
  
  const { pendingBookings, confirmedBookings, pastBookings } = useMemo(() => ({
    pendingBookings: bookings.filter(b => b.status === BookingStatus.Pending),
    confirmedBookings: bookings.filter(b => b.status === BookingStatus.Confirmed),
    pastBookings: bookings.filter(b => b.status === BookingStatus.Completed || b.status === BookingStatus.Cancelled),
  }), [bookings]);

  const stats = useMemo(() => ({
    totalEarnings: pastBookings.filter(b => b.status === BookingStatus.Completed).reduce((sum, b) => sum + b.totalPrice, 0),
    upcomingBookingsCount: confirmedBookings.length,
    pendingRequestsCount: pendingBookings.length,
  }), [pastBookings, confirmedBookings, pendingBookings]);

  const handleUpdateAvailability = async (guideId: string, newAvailability: any) => {
    // Mock update
    console.log("Updating availability for", guideId, newAvailability);
    // In real app: await updateAvailabilityOnServer(guideId, newAvailability);
    // For demo, we assume the parent state manages this. This is a stub.
  };

  const earningsData = [
    { month: 'Jan', earnings: 12000 },
    { month: 'Feb', earnings: 25000 },
    { month: 'Mar', earnings: 18000 },
    { month: 'Apr', earnings: 35000 },
    { month: 'May', earnings: 42000 },
    { month: 'Jun', earnings: 28000 },
  ];

  if (!guideProfile) {
    return <div className="text-center p-8">Could not load your guide profile. Please contact support.</div>;
  }
  
  const BookingRow: React.FC<{booking: Booking}> = ({booking}) => {
    // In a real app, we'd fetch user data. Here we mock it.
    const user = { name: `User ${booking.userId.slice(-1)}`, avatarUrl: `https://picsum.photos/seed/user-${booking.userId}/100/100` };
    
    return (
        <div className="bg-white dark:bg-dark-light p-4 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <LazyImage src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" placeholderClassName="rounded-full"/>
                <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-500">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex gap-2">
                 {booking.status === BookingStatus.Pending && (
                    <>
                        <Button size="sm" variant="outline">Decline</Button>
                        <Button size="sm">Accept</Button>
                    </>
                 )}
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold font-heading">My Dashboard</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
            <p className="text-4xl font-bold text-primary">₹{stats.totalEarnings.toLocaleString()}</p>
            <p className="text-gray-500 mt-2">Total Earnings (Completed)</p>
        </div>
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
            <p className="text-4xl font-bold text-secondary">{stats.upcomingBookingsCount}</p>
            <p className="text-gray-500 mt-2">Upcoming Bookings</p>
        </div>
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
            <p className="text-4xl font-bold text-accent">{stats.pendingRequestsCount}</p>
            <p className="text-gray-500 mt-2">Pending Requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Pending Requests */}
            <section>
                <h2 className="text-2xl font-bold font-heading mb-4">Pending Requests</h2>
                <div className="space-y-3">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map(b => <BookingRow key={b.id} booking={b} />)
                    ) : <p className="text-gray-500 bg-white dark:bg-dark-light p-6 rounded-lg">No pending requests.</p>}
                </div>
            </section>
             {/* Earnings */}
            <section className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold font-heading mb-4">Earnings Overview</h2>
                <div className="h-64">
                    <EarningsChart data={earningsData} />
                </div>
            </section>
        </div>
        <div className="lg:col-span-1">
          <AvailabilityCalendar guide={guideProfile} onUpdateAvailability={handleUpdateAvailability} />
        </div>
      </div>
    </div>
  );
};

export default GuideDashboardPage;
