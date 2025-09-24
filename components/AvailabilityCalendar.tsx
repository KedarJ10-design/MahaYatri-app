import React, { useState } from 'react';
import { Guide, AvailabilityStatus } from '../types';
import Button from './common/Button';

interface AvailabilityCalendarProps {
  guide: Guide;
  onUpdateAvailability: (guideId: string, newAvailability: Record<string, AvailabilityStatus | undefined>) => Promise<void>;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

// Define the cycle of statuses
const statusCycle: (AvailabilityStatus | undefined)[] = [
    undefined, // Available
    'unavailable_morning',
    'unavailable_afternoon',
    'unavailable_full',
];

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ guide, onUpdateAvailability }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const handleDayClick = async (day: Date) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const dateString = formatDate(day);
    const currentAvailability = guide.availability || {};
    const currentStatus = currentAvailability[dateString];
    
    // Find the next status in the cycle
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

    const newAvailability = { ...currentAvailability };
    if (nextStatus === undefined) {
      delete newAvailability[dateString]; // If available, remove the key
    } else {
      newAvailability[dateString] = nextStatus;
    }

    try {
        await onUpdateAvailability(guide.id, newAvailability);
    } finally {
        setIsUpdating(false);
    }
  };
  
  const getDayStyle = (status: AvailabilityStatus | undefined) => {
    const baseStyle = 'w-10 h-10 flex items-center justify-center rounded-full transition-colors font-semibold cursor-pointer';
    const available = 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    const unavailable = 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';

    switch (status) {
        case 'unavailable_full':
            return `${baseStyle} ${unavailable} hover:bg-green-100 dark:hover:bg-green-900/50`;
        case 'unavailable_morning':
            return `${baseStyle} text-dark dark:text-light bg-gradient-to-b from-red-100 from-50% to-green-100 to-50% hover:bg-red-100 dark:hover:bg-red-900/50`;
        case 'unavailable_afternoon':
            return `${baseStyle} text-dark dark:text-light bg-gradient-to-b from-green-100 from-50% to-red-100 to-50% hover:bg-red-100 dark:hover:bg-red-900/50`;
        default: // available (undefined)
            return `${baseStyle} ${available} hover:bg-yellow-100 dark:hover:bg-yellow-900/50`;
    }
  };


  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const calendarDays = [];
    // Add empty cells for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const status = guide.availability?.[dateString];
      const isPast = date < today;

      let dayClasses = '';
      if (isPast) {
          dayClasses = 'w-10 h-10 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-lighter cursor-not-allowed';
      } else {
         dayClasses = getDayStyle(status);
      }
      if (date.getTime() === today.getTime()) {
        dayClasses += ' ring-2 ring-primary';
      }

      calendarDays.push(
        <button
          key={day}
          disabled={isPast || isUpdating}
          onClick={() => handleDayClick(date)}
          className={dayClasses}
          aria-label={`Set availability for ${date.toLocaleDateString()}`}
        >
          {day}
        </button>
      );
    }
    return calendarDays;
  };
  
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="bg-white dark:bg-dark-light p-4 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-2">My Availability</h3>
      <div className="flex justify-between items-center mb-4">
        <Button size="sm" variant="ghost" onClick={() => changeMonth(-1)}>&larr;</Button>
        <span className="font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <Button size="sm" variant="ghost" onClick={() => changeMonth(1)}>&rarr;</Button>
      </div>
       <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
           {weekDays.map(day => <div key={day}>{day}</div>)}
       </div>
      <div className="grid grid-cols-7 gap-1 place-items-center">
        {renderCalendar()}
      </div>
      <div className="mt-4 flex flex-col items-start gap-2 text-xs pl-2">
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/50 border border-gray-300"></div>Available</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-b from-red-100 from-50% to-green-100 to-50% border border-gray-300"></div>Morning Unavailable</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-b from-green-100 from-50% to-red-100 to-50% border border-gray-300"></div>Afternoon Unavailable</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/50 border border-gray-300"></div>Fully Unavailable</span>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;