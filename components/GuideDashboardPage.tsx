import React, { useState, useMemo, useEffect } from 'react';
import { User, Guide, Booking, BookingStatus, ToastMessage, AvailabilityStatus } from '../types';
import EarningsChart from './EarningsChart';
import AvailabilityCalendar from './AvailabilityCalendar';
import Badge from './Badge';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { db } from '../services/firebase';

interface GuideDashboardPageProps {
  guideUser: User;
  allUsers: User[];
  onUpdateAvailability: (guideId: string, newAvailability: Record<string, AvailabilityStatus | undefined>) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const getStatusBadgeColor = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Pending: return 'yellow';
        case BookingStatus.Confirmed: return 'blue';
        case BookingStatus.Completed: return 'green';
        case BookingStatus.Cancelled: return 'red';
        default: return 'gray';
    }
};


const GuideDashboardPage: React.FC<GuideDashboardPageProps> = ({ guideUser, allUsers, onUpdateAvailability, onUpdateBookingStatus, addToast }) => {
  const [guideProfile, setGuideProfile] = useState<Guide | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingActionLoading, setBookingActionLoading] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!db || !guideUser.id) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);

    const unsubscribes: (() => void)[] = [];
    
    // Listener for the guide profile is the primary source for loading state.
    const guideRef = db.collection('guides').doc(guideUser.id);
    unsubscribes.push(guideRef.onSnapshot(doc => {
        setGuideProfile(doc.exists ? { id: doc.id, ...doc.data() } as Guide : null);
        setIsLoading(false); // Stop loading once profile is fetched, so we can check its status.
    }, () => {
        setIsLoading(false);
        addToast("Could not load your guide profile.", "error");
    }));

    // Listener for bookings can load in the background.
    const bookingsQuery = db.collection('bookings').where('guideId', '==', guideUser.id);
    unsubscribes.push(bookingsQuery.onSnapshot(snapshot => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    }));

    return () => unsubscribes.forEach(unsub => unsub());
  }, [guideUser.id, addToast]);
  
  const { totalEarnings, chartData, upcomingBookings, pastBookings } = useMemo(() => {
    if (!guideProfile) {
      return { totalEarnings: 0, chartData: [], upcomingBookings: [], pastBookings: [] };
    }
    
    const myBookings = [...bookings].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    const now = new Date();
    const upcoming = myBookings.filter(b => new Date(b.endDate) >= now && b.status !== BookingStatus.Completed && b.status !== BookingStatus.Cancelled);
    const past = myBookings.filter(b => new Date(b.endDate) < now || b.status === BookingStatus.Completed || b.status === BookingStatus.Cancelled);

    const completed = myBookings.filter(b => b.status === BookingStatus.Completed);
    
    const total = completed.reduce((sum, b) => sum + b.totalPrice, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentCompletedBookings = completed.filter(b => new Date(b.endDate) >= sixMonthsAgo);

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);
        return {
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear(),
            earnings: 0,
        };
    }).reverse();

    recentCompletedBookings.forEach(booking => {
        const bookingDate = new Date(booking.endDate);
        const bookingMonth = bookingDate.toLocaleString('default', { month: 'short' });
        const bookingYear = bookingDate.getFullYear();
        const monthForBooking = monthlyData.find(m => m.month === bookingMonth && m.year === bookingYear);
        if (monthForBooking) {
            monthForBooking.earnings += booking.totalPrice;
        }
    });

    return {
      totalEarnings: total,
      chartData: monthlyData.map(({ month, earnings }) => ({ month, earnings })),
      upcomingBookings: upcoming,
      pastBookings: past,
    };
  }, [guideProfile, bookings]);

  const handleBookingAction = async (bookingId: string, status: BookingStatus) => {
      setBookingActionLoading(prev => ({ ...prev, [bookingId]: true }));
      try {
          await onUpdateBookingStatus(bookingId, status);
      } finally {
          setBookingActionLoading(prev => ({ ...prev, [bookingId]: false }));
      }
  };

  const BookingRow: React.FC<{booking: Booking, isUpcoming: boolean}> = ({ booking, isUpcoming }) => {
    const tourist = allUsers.find(u => u.id === booking.userId);
    return (
        <div key={booking.id} className="p-4 bg-light dark:bg-dark rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <p className="font-bold">Tour with {tourist?.name || 'a user'}</p>
                <p className="text-sm text-gray-500">{new Date(booking.startDate).toDateString()} for {booking.guests} guests</p>
                 <div className="mt-2 flex items-center gap-4">
                    <p className="font-semibold text-dark dark:text-light">₹{booking.totalPrice.toLocaleString()}</p>
                    <Badge color={getStatusBadgeColor(booking.status)}>{booking.status}</Badge>
                </div>
            </div>
            {isUpcoming && booking.status === BookingStatus.Pending && (
                <div className="flex gap-2 self-end sm:self-center">
                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={() => handleBookingAction(booking.id, BookingStatus.Cancelled)} loading={bookingActionLoading[booking.id]}>Cancel</Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleBookingAction(booking.id, BookingStatus.Confirmed)} loading={bookingActionLoading[booking.id]}>Confirm</Button>
                </div>
            )}
        </div>
    )
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner className="w-12 h-12" /></div>;
  }
  
  // After loading, check the profile status.
  // If the profile doesn't exist yet OR if its status is pending, show the message.
  if (!guideProfile || guideProfile.verificationStatus === 'pending') {
    return (
        <div className="text-center p-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg animate-fade-in">
            <h2 className="text-2xl font-bold font-heading">Application Pending</h2>
            <p className="mt-2 text-yellow-800 dark:text-yellow-200">Your guide application is currently under review by our team. You will be notified once it's approved.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold font-heading">Welcome back, {guideUser.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-500">Total Earnings (Completed)</h3>
              <p className="text-4xl font-bold text-primary mt-2">₹{totalEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-500">Upcoming Bookings</h3>
              <p className="text-4xl font-bold text-primary mt-2">{upcomingBookings.length}</p>
          </div>
          <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-500">Overall Rating</h3>
              <p className="text-4xl font-bold text-primary mt-2">{guideProfile.rating}/5</p>
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">6-Month Earnings Overview</h3>
            <div className="h-64">
                <EarningsChart data={chartData} />
            </div>
        </div>
        <div>
            <AvailabilityCalendar guide={guideProfile} onUpdateAvailability={onUpdateAvailability}/>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">My Bookings</h3>
        
        <h4 className="text-lg font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-300">Upcoming & Active Tours</h4>
        <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => <BookingRow key={booking.id} booking={booking} isUpcoming={true} />)
            ) : <p className="text-gray-500">You have no upcoming tours.</p>}
        </div>

        <h4 className="text-lg font-semibold mt-8 mb-3 text-gray-700 dark:text-gray-300">Past Tours</h4>
        <div className="space-y-4">
            {pastBookings.length > 0 ? (
                pastBookings.map(booking => <BookingRow key={booking.id} booking={booking} isUpcoming={false} />)
            ) : <p className="text-gray-500">You have no past tours.</p>}
        </div>
      </div>
    </div>
  );
};

export default GuideDashboardPage;