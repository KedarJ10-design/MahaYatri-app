import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import Spinner from './common/Spinner';

interface ItineraryBuilderModalProps {
  placesCount: number;
  onClose: () => void;
  onGenerate: (days: number) => Promise<void>;
}

const ItineraryBuilderModal: React.FC<ItineraryBuilderModalProps> = ({ placesCount, onClose, onGenerate }) => {
  const [days, setDays] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(days);
      // The parent component is expected to close the modal on success.
    } catch (error) {
      console.error("Failed to generate itinerary from modal:", error);
      setIsGenerating(false); // Stop loading on error
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="itinerary-builder-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
          <h2 id="itinerary-builder-title" className="text-2xl font-bold font-heading text-dark dark:text-light">Generate Custom Itinerary</h2>
          <p className="text-gray-500 dark:text-gray-400">Create a trip plan based on your {placesCount} selected places.</p>
        </div>
        
        <div className="p-8 space-y-6">
            <Input 
                label="How many days is your trip?"
                type="number"
                value={days}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                min="1"
                max="14"
                required
            />
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">Our AI will create a logical route and fill in the gaps with other exciting activities around your selected spots.</p>
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end items-center gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>Cancel</Button>
            <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? <span className="flex items-center"><Spinner className="mr-2" /> Generating...</span> : 'Generate Trip'}
            </Button>
        </div>

      </div>
    </div>
  );
};

export default ItineraryBuilderModal;
