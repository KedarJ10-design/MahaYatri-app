
import React, { useState } from 'react';
import { Booking } from '../types';
import Button from './common/Button';
import StarRating from './StarRating'; // Using a display component, but will manage state here

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const StarInput: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        onClick={() => setRating(ratingValue)}
                        className="text-4xl transition-transform transform hover:scale-125"
                        aria-label={`Rate ${ratingValue} stars`}
                    >
                        {ratingValue <= rating ? '⭐' : '☆'}
                    </button>
                );
            })}
        </div>
    );
}

const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose, addToast }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Here you would call a function to submit the review to your backend
      console.log({
        bookingId: booking.id,
        guideId: booking.guideId,
        rating,
        comment,
      });
      // await submitReviewFunction({ ... });
      addToast('Thank you for your review!', 'success');
      onClose();
    } catch (error) {
      addToast('Failed to submit review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b text-center">
          <h2 className="text-2xl font-bold">Leave a Review</h2>
          <p className="text-gray-500">How was your tour on {new Date(booking.startDate).toLocaleDateString()}?</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
              <StarInput rating={rating} setRating={setRating} />
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Comments (Optional)</label>
              <textarea
                id="comment"
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Submit Review</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
