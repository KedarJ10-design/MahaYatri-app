import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const timer = setTimeout(() => {
      // Animate out
      setIsVisible(false);
      // Wait for animation to finish before removing from DOM
      setTimeout(() => onRemove(toast.id), 300);
    }, 4000); // 4 seconds visible

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };
  
  const iconMap = {
      success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  }

  return (
    <div
      className={`relative flex items-center gap-4 w-full max-w-sm p-4 text-white rounded-lg shadow-2xl transition-all duration-300 ease-in-out ${
        typeClasses[toast.type]
      } ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="flex-shrink-0">{iconMap[toast.type]}</div>
      <p>{toast.message}</p>
    </div>
  );
};

export default Toast;