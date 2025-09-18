import React from 'react';
import Button from './common/Button';
import Badge from './Badge';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const ProFeature: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        </div>
        <div>
            <h4 className="font-semibold text-dark dark:text-light">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-2">
                <Badge color="yellow">MahaYatri PRO</Badge>
            </div>
          <h2 id="upgrade-title" className="text-2xl font-bold font-heading text-dark dark:text-light">Unlock Your Ultimate Travel Companion</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upgrade to Pro for exclusive features and a smarter travel experience.</p>
        </div>
        
        <div className="p-8 space-y-5">
            <ProFeature 
                title="AI Trip Cost Estimator"
                description="Get detailed, AI-powered budget breakdowns for any itinerary you create."
            />
            <ProFeature 
                title="Personalized AI Assistant"
                description="Our chatbot will know your preferences to give you perfectly tailored suggestions."
            />
             <ProFeature 
                title="Exclusive Pro Rewards"
                description="Access a special tier of rewards and discounts redeemable with your points."
            />
             <ProFeature 
                title="Unlimited Offline Maps"
                description="Download maps for any region in Maharashtra for seamless offline navigation (coming soon)."
            />
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl">
            <Button onClick={onUpgrade} className="w-full text-lg">
                Upgrade Now for ₹499/year
            </Button>
            <button onClick={onClose} className="w-full text-center mt-3 text-sm text-gray-500 hover:underline">
                Maybe Later
            </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;