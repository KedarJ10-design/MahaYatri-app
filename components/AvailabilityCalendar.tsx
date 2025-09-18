import React, { useState } from 'react';

const getNext7Days = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const next7Days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    next7Days.push({
      name: days[date.getDay()],
      date: date.getDate(),
      isAvailable: i < 5, // Default to available on weekdays
    });
  }
  return next7Days;
};

const AvailabilityCalendar: React.FC = () => {
  const [availability, setAvailability] = useState(getNext7Days());

  const toggleAvailability = (index: number) => {
    setAvailability(prev => 
      prev.map((day, i) => 
        i === index ? { ...day, isAvailable: !day.isAvailable } : day
      )
    );
  };

  return (
    <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-2">My Availability</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Set your availability for the next 7 days.</p>
      <div className="space-y-3">
        {availability.map((day, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-light dark:bg-dark rounded-lg">
            <div className="flex items-center gap-3">
              <div className="font-bold text-center w-10">
                <p className="text-xs text-primary">{day.name.toUpperCase()}</p>
                <p className="text-xl">{day.date}</p>
              </div>
              <span className={`text-sm font-semibold ${day.isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {day.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <button 
              onClick={() => toggleAvailability(index)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-light ${day.isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-label={`Set status for ${day.name} ${day.date}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${day.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
