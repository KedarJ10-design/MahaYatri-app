import React from 'react';
import Button from './common/Button';

interface UpgradeModalProps {
  onClose: () => void;
}

// More detailed feature component
const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <li className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1 text-primary">{icon}</div>
        <div>
            <h4 className="font-semibold text-dark dark:text-light">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </li>
);

// SVG Icons for features
const iconClasses = "h-6 w-6";
const proFeatures = [
  {
    title: "AI-Powered Cost Estimator",
    description: "Get a detailed, intelligent breakdown of your trip costs before you book.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    title: "Detailed Expense Tracking",
    description: "Effortlessly manage your budget on the go with our in-app expense tracker.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  },
  {
    title: "Travel Insurance Integration",
    description: "Get peace of mind with easy access to travel insurance from our trusted partners.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  },
  {
    title: "Exclusive Partner Deals",
    description: "Unlock special discounts at top restaurants, stays, and local attractions.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  },
   {
    title: "Exclusive Pro Badge",
    description: "Show off your Pro status with a special badge on your profile.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
  },
  {
    title: "Priority Support",
    description: "Get faster responses from our dedicated customer support team.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  },
  {
    title: "Early Access to New Features",
    description: "Be the first to try out our latest tools and innovations.",
    icon: <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
  },
];


const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 text-center bg-gradient-to-br from-primary via-secondary to-accent text-white rounded-t-2xl">
          <h2 className="text-3xl font-extrabold">Go MahaYatri Pro!</h2>
          <p className="mt-2 opacity-90">Unlock exclusive features to enhance your travels.</p>
        </div>
        <div className="p-8">
            <ul className="space-y-5 mb-8">
                {proFeatures.map(feature => (
                    <Feature key={feature.title} {...feature} />
                ))}
            </ul>
            <Button className="w-full text-lg py-3">Upgrade for ₹999/year</Button>
            <button onClick={onClose} className="w-full mt-3 text-sm text-gray-500 hover:underline">Maybe Later</button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
