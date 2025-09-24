import React, { useState } from 'react';
import Button from './Button';
import { AvailabilityStatus } from '../../types';

interface GuideAvailabilityViewerProps {
  availability?: Record<string, AvailabilityStatus>;
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const GuideAvailabilityViewer: React.FC<GuideAvailabilityViewerProps> = ({ availability = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };
  
  const getDayStyle = (status: AvailabilityStatus | undefined) => {
    const baseStyle = 'w-10 h-10 flex items-center justify-center rounded-full font-semibold';
    const available = 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    const unavailable = 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 line-through';

    switch (status) {
        case 'unavailable_full':
            return `${baseStyle} ${unavailable}`;
        case 'unavailable_morning':
            return `${baseStyle} text-dark dark:text-light bg-gradient-to-b from-red-100 from-50% to-green-100 to-50%`;
        case 'unavailable_afternoon':
            return `${baseStyle} text-dark dark:text-light bg-gradient-to-b from-green-100 from-50% to-red-100 to-50%`;
        default: // available (undefined)
            return `${baseStyle} ${available}`;
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
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const status = availability[dateString];
      const isPast = date < today;

      let dayClasses = '';
      if (isPast) {
          dayClasses = 'w-10 h-10 flex items-center justify-center rounded-full font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-lighter';
      } else {
         dayClasses = getDayStyle(status);
      }
      if (date.getTime() === today.getTime()) {
        dayClasses += ' ring-2 ring-primary';
      }

      calendarDays.push(<div key={day} className={dayClasses}>{day}</div>);
    }
    return calendarDays;
  };
  
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-4">Availability</h2>
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
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gradient-to-b from-red-100 from-50% to-green-100 to-50% border border-gray-300"></div>Partially Unavailable</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/50 border border-gray-300"></div>Fully Unavailable</span>
      </div>
    </div>
  );
};

export default GuideAvailabilityViewer;