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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    await onGenerate(days);
    // The parent component will handle closing the modal on success
    setIsGenerating(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
          <h2 id="builder-title" className="text-2xl font-bold text-dark dark:text-light">Plan Your Trip</h2>
          <p className="text-gray-500 dark:text-gray-400">You've selected {placesCount} {placesCount === 1 ? 'place' : 'places'}.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="p-8">
                <Input
                    label="How many days is your trip?"
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                    min="1"
                    max="14"
                    required
                    autoFocus
                />
                 <p className="text-sm text-gray-400 mt-2">The AI will create the best possible route to visit your selected places within this duration.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end items-center gap-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>Cancel</Button>
                <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? (
                        <span className="flex items-center"><Spinner className="mr-2" /> Generating...</span>
                    ) : (
                        'Generate Itinerary'
                    )}
                </Button>
            </div>
        </form>

      </div>
    </div>
  );
};

export default ItineraryBuilderModal;
