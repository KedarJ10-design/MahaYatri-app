import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'gray' | 'green' | 'blue' | 'yellow' | 'red';
}

const Badge: React.FC<BadgeProps> = ({ children, color = 'gray' }) => {
  const colorClasses = {
    gray: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  );
};

export default Badge;