import React from 'react';

interface SOSButtonProps {
  onSOS: () => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onSOS }) => {
  return (
    <div className="fixed bottom-24 right-6 z-50">
      <button
        onClick={onSOS}
        className="bg-red-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        aria-label="Emergency SOS"
      >
        <span className="font-bold text-xl">SOS</span>
      </button>
    </div>
  );
};

export default SOSButton;