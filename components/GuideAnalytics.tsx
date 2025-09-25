import React, { useMemo } from 'react';
import { Booking, Review, BookingStatus } from '../types';
import EarningsChart from './EarningsChart';
import RatingsDistributionChart from './RatingsDistributionChart';

interface GuideAnalyticsProps {
    bookings: Booking[];
    reviews: Review[];
}

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
        <p className="text-3xl font-bold text-primary">{value}</p>
        <h3 className="font-semibold mt-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
    </div>
);


const GuideAnalytics: React.FC<GuideAnalyticsProps> = ({ bookings, reviews }) => {
    const completedBookings = useMemo(() => bookings.filter(b => b.status === BookingStatus.Completed), [bookings]);

    const totalEarnings = useMemo(() => completedBookings.reduce((sum, b) => sum + b.totalPrice, 0), [completedBookings]);
    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        return parseFloat((total / reviews.length).toFixed(1));
    }, [reviews]);
    
    const monthlyEarnings = useMemo(() => {
        const earningsByMonth: { [key: string]: number } = {};
        completedBookings.forEach(b => {
            const month = new Date(b.endDate).toLocaleString('default', { month: 'short' });
            if (!earningsByMonth[month]) {
                earningsByMonth[month] = 0;
            }
            earningsByMonth[month] += b.totalPrice;
        });
        
        const last6Months = [...Array(6)].map((_, i) => {
           const d = new Date();
           d.setMonth(d.getMonth() - i);
           return d.toLocaleString('default', { month: 'short' });
        }).reverse();

        return last6Months.map(month => ({
            month,
            earnings: earningsByMonth[month] || 0,
        }));
    }, [completedBookings]);

    const ratingsDistribution = useMemo(() => {
        const counts = [
            { star: 5, count: 0 },
            { star: 4, count: 0 },
            { star: 3, count: 0 },
            { star: 2, count: 0 },
            { star: 1, count: 0 },
        ];
        reviews.forEach(r => {
            const starData = counts.find(c => c.star === Math.floor(r.rating));
            if (starData) {
                starData.count++;
            }
        });
        return counts;
    }, [reviews]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} description="From all completed tours" />
                <StatCard title="Completed Tours" value={completedBookings.length} description="Total tours marked as complete" />
                <StatCard title="Average Rating" value={averageRating > 0 ? averageRating : 'N/A'} description={`Based on ${reviews.length} reviews`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Recent Earnings</h3>
                    <div className="h-64">
                       <EarningsChart data={monthlyEarnings} />
                    </div>
                </div>
                 <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Ratings Distribution</h3>
                     <div className="h-64 flex flex-col justify-center">
                        <RatingsDistributionChart ratings={ratingsDistribution} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideAnalytics;
