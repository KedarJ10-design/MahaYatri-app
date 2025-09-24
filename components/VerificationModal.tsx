
import React from 'react';
import { Verifiable } from '../types';
import Button from './common/Button';
import LazyImage from './common/LazyImage';

interface VerificationModalProps {
  item: Verifiable;
  onClose: () => void;
  onUpdateStatus: (itemId: string, status: 'verified' | 'rejected') => void;
  isLoading: boolean;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ item, onClose, onUpdateStatus, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Review Application: {item.name}</h2>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <LazyImage src={item.avatarUrl} alt={item.name} className="w-32 h-32 rounded-lg" placeholderClassName="rounded-lg" sizes="128px" />
          <p><strong>ID:</strong> {item.id}</p>
          <p><strong>Name:</strong> {item.name}</p>
          <p><strong>Location:</strong> {item.location}</p>
          <h3 className="font-bold mt-4">Gallery Images</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {item.gallery.map((url, index) => (
              <LazyImage key={index} src={url} alt={`Gallery image ${index + 1}`} className="w-full h-40 object-cover rounded-lg" placeholderClassName="rounded-lg" sizes="(max-width: 768px) 50vw, 33vw" />
            ))}
            {item.gallery.length === 0 && <p className="text-gray-500">No gallery images submitted.</p>}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Close</Button>
          <Button variant="danger" onClick={() => onUpdateStatus(item.id, 'rejected')} loading={isLoading}>Reject</Button>
          <Button variant="primary" onClick={() => onUpdateStatus(item.id, 'verified')} loading={isLoading}>Approve</Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
