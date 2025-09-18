import React, { useState } from 'react';
import { Booking, Review, Guide } from '../types';
import Button from './common/Button';

interface ReviewModalProps {
  booking: Booking;
  guides: Guide[];
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'userId' | 'createdAt'>) => void;
}

const StarInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex justify-center" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        className="text-4xl transition-transform duration-200 hover:scale-125"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                    >
                        <svg
                            className={`w-10 h-10 ${starValue <= (hoverRating || rating) ? 'text-secondary' : 'text-gray-300 dark:text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

const ReviewModal: React.FC<ReviewModalProps> = ({ booking, guides, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const guide = guides.find(g => g.id === booking.guideId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({
      guideId: booking.guideId,
      rating,
      comment,
    });
  };

  if (!guide) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
          <h2 id="review-title" className="text-2xl font-bold font-heading text-dark dark:text-light">Rate your trip with {guide.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">Your feedback helps other travelers.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
                <div>
                    <label className="block text-center text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
                    <StarInput rating={rating} setRating={setRating} />
                </div>
                 <div>
                    <label htmlFor="comment" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Your Review</label>
                    <textarea
                        id="comment"
                        rows={5}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end items-center gap-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={rating === 0}>Submit Review</Button>
            </div>
        </form>

      </div>
    </div>
  );
};

export default ReviewModal;