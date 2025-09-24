
import React from 'react';
import Button from './common/Button';

interface ItineraryBuilderModalProps {
    onClose: () => void;
    onNavigateToPlanner: () => void;
}

const ItineraryBuilderModal: React.FC<ItineraryBuilderModalProps> = ({ onClose, onNavigateToPlanner }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md text-center p-8" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">Itinerary Builder</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                    This feature is coming soon! For now, you can use our powerful AI Trip Planner to generate a complete itinerary for you.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={onNavigateToPlanner}>Go to AI Planner</Button>
                </div>
            </div>
        </div>
    );
};

export default ItineraryBuilderModal;
