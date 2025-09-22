import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>}
      <input
        id={inputId}
        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent hover:border-primary/50 dark:hover:border-primary/50 transition"
        {...props}
      />
    </div>
  );
};

export default Input;