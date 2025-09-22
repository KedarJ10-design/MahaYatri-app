import React from 'react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'danger' | 'primary' | 'secondary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'primary',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="confirmation-title" className="text-2xl font-bold font-heading text-dark dark:text-light">
            {title}
          </h2>
        </div>
        <div className="p-8">
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button type="button" variant={confirmButtonVariant} onClick={onConfirm}>
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;