
import React, { useEffect, useRef } from 'react';
import Button from './Button';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'danger';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  confirmButtonVariant = 'primary',
  isLoading = false,
}) => {
  const modalRef = useFocusTrap(isOpen);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
        confirmButtonRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        <div className="p-6">
          <h2 id="confirmation-title" className="text-2xl font-bold">{title}</h2>
          <div className="mt-4 text-gray-600 dark:text-gray-300">{message}</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button ref={confirmButtonRef} variant={confirmButtonVariant} onClick={onConfirm} loading={isLoading}>{confirmButtonText}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;