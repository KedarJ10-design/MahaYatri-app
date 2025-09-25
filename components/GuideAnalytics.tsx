import React from 'react';
import { Guide, Booking, Review, BookingStatus } from '../types';
import { mockReviews } from '../services/mockData';
import EarningsChart from './EarningsChart';
import RatingsDistributionChart from './RatingsDistributionChart';

interface GuideAnalyticsProps {
  guide: Guide;
  bookings: Booking[];
}

const GuideAnalytics: React.FC<GuideAnalyticsProps> = ({ guide, bookings }) => {
  // Mock analytics data generation
  const totalEarnings = bookings
    .filter(b => b.status === BookingStatus.Completed)
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const completedBookings = bookings.filter(b => b.status === BookingStatus.Completed).length;

  const guideReviews = mockReviews.filter(r => r.guideId === guide.id);
  
  const averageRating = guideReviews.length > 0 
    ? (guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length).toFixed(1)
    : 'N/A';

  const ratingsDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: guideReviews.filter(r => r.rating === star).length,
  }));
  
  // Mock monthly earnings for the last 6 months
  const monthlyEarnings = [
    { month: 'Mar', earnings: 55000 },
    { month: 'Apr', earnings: 72000 },
    { month: 'May', earnings: 65000 },
    { month: 'Jun', earnings: 89000 },
    { month: 'Jul', earnings: 78000 },
    { month: 'Aug', earnings: 95000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
            <p className="text-gray-500">Total Earnings</p>
            <p className="text-4xl font-bold text-primary">₹{totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
            <p className="text-gray-500">Completed Tours</p>
            <p className="text-4xl font-bold text-secondary">{completedBookings}</p>
        </div>
        <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
            <p className="text-gray-500">Average Rating</p>
            <p className="text-4xl font-bold text-accent">{averageRating}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-4">Earnings Overview</h3>
              <div className="h-64">
                <EarningsChart data={monthlyEarnings} />
              </div>
          </div>
          <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold mb-4">Ratings Distribution</h3>
              <RatingsDistributionChart ratings={ratingsDistribution} />
          </div>
      </div>
    </div>
  );
};

export default GuideAnalytics;
