import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

const messages = [
  "Consulting ancient travel scrolls...",
  "Plotting the most scenic routes...",
  "Asking locals for hidden gems...",
  "Aligning the stars for your perfect trip...",
  "Packing our virtual bags...",
  "Crafting your unique adventure...",
  "Just a few more moments...",
];

const CountdownLoader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-dark-light rounded-2xl shadow-lg min-h-[50vh]">
      <Spinner className="w-12 h-12 border-4 border-primary" />
      <h2 className="text-2xl font-bold font-heading mt-6 text-dark dark:text-light">Generating Your Itinerary</h2>
      <div className="relative h-6 mt-4 w-full max-w-sm overflow-hidden">
        {messages.map((message, index) => (
            <p
                key={index}
                className={`absolute w-full transition-all duration-500 ease-in-out ${
                    index === messageIndex
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-full'
                }`}
                style={{ transitionDelay: index === messageIndex ? '300ms' : '0ms' }}
            >
                {message}
            </p>
        ))}
       </div>
    </div>
  );
};

export default CountdownLoader;
