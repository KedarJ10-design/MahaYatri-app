import React, { useState } from 'react';

const faqData = [
  {
    question: "How are guides verified?",
    answer: "Every guide on MahaYatri goes through a rigorous verification process, including background checks and interviews, to ensure they are knowledgeable, professional, and safe."
  },
  {
    question: "How does the AI Trip Planner work?",
    answer: "Our AI Trip Planner uses advanced language models to create a personalized itinerary based on your destination, duration, interests, and budget. Just provide the details, and it will generate a day-by-day plan for you."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes, absolutely. We use Razorpay, a leading payment gateway in India, to process all transactions. Your payment information is never stored on our servers."
  },
  {
    question: "What is the SOS button for?",
    answer: "The SOS button is an emergency feature. When activated, it retrieves your current GPS location and helps you quickly share it with your emergency contact via SMS."
  },
  {
    question: "How do I earn and redeem points?",
    answer: "You earn points for completing bookings with guides. These points can be redeemed in the 'Rewards' section of your profile for discounts and other exclusive offers."
  }
];

const FAQItem: React.FC<{ question: string; answer: string; }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold text-dark dark:text-light">{question}</h3>
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
        <div className="mt-4 text-gray-600 dark:text-gray-400 animate-fade-in">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
      <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-4 text-center">Frequently Asked Questions</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
        Have questions? We've got answers.
      </p>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};

export default FAQPage;