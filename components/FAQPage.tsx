
import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold">{question}</h3>
        <svg
          className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600 dark:text-gray-300 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const FAQPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
      <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-8 text-center">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4">
        <FAQItem question="How are guides verified?">
          <p>
            Every guide on MahaYatri goes through a rigorous verification process. This includes a background check, validation of government-issued IDs, and an interview with our team to assess their knowledge, professionalism, and communication skills. We only approve guides who meet our high standards for safety and quality.
          </p>
        </FAQItem>
        <FAQItem question="What is the AI Trip Planner?">
          <p>
            Our AI Trip Planner is a powerful tool that uses Google's Gemini AI to create personalized travel itineraries for you in seconds. Simply provide your destination, duration, interests, and budget, and our AI will generate a detailed, day-by-day plan complete with activities, travel times, and cost estimates.
          </p>
        </FAQItem>
        <FAQItem question="How does the SOS feature work?">
          <p>
            Your safety is our top priority. The SOS button, available during a live trip, will immediately send your current GPS location and an alert message to your designated emergency contact. Please ensure your emergency contact details are up-to-date in your profile.
          </p>
        </FAQItem>
        <FAQItem question="What is the cancellation policy for bookings?">
          <p>
            Cancellation policies are set by individual guides. Generally, you can cancel for a full refund up to 7 days before the trip. Cancellations within 7 days may be subject to a partial fee. Please check the specific guide's profile for their detailed policy before booking.
          </p>
        </FAQItem>
        <FAQItem question="How do I become a guide on MahaYatri?">
          <p>
            We're always looking for passionate local experts! If you're interested in becoming a guide, please navigate to your profile and click the "Apply to be a Guide" button. You'll be asked to fill out an application form with your details, experience, and relevant documents for verification.
          </p>
        </FAQItem>
      </div>
    </div>
  );
};

export default FAQPage;
