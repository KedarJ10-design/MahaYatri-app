import React from 'react';
import { Guide } from '../types';
import Button from './common/Button';
import Badge from './Badge';

interface VerificationModalProps {
  guide: Guide;
  onClose: () => void;
  onUpdateStatus: (guideId: string, status: 'verified' | 'rejected') => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ guide, onClose, onUpdateStatus }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-title"
    >
      <div
        className="bg-white dark:bg-dark-light rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 id="verification-title" className="text-2xl font-bold text-dark dark:text-light">Review Guide Application</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-lighter" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
            <div className="flex items-center gap-6">
                <img src={guide.avatarUrl} alt={guide.name} className="w-24 h-24 rounded-full border-4 border-primary object-cover" />
                <div>
                    <h3 className="text-3xl font-bold">{guide.name}</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400">{guide.location}</p>
                    <p className="text-gray-600 dark:text-gray-300">{guide.contactInfo.email} | {guide.contactInfo.phone}</p>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-lg mb-2 border-b pb-1">Bio</h4>
                <p className="text-gray-700 dark:text-gray-300">{guide.bio}</p>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-lg mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">{guide.specialties.map(s => <Badge key={s}>{s}</Badge>)}</div>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">{guide.languages.map(l => <Badge key={l} color='blue'>{l}</Badge>)}</div>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-lg mb-2">Submitted Documents</h4>
                <div className="space-y-2 p-4 bg-light dark:bg-dark rounded-lg border dark:border-gray-700">
                    <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        identity_document.pdf
                    </a>
                     <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        tour_guide_license.pdf
                    </a>
                </div>
            </div>

        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-dark rounded-b-2xl flex justify-end items-center gap-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700 focus:ring-red-500" onClick={() => onUpdateStatus(guide.id, 'rejected')}>Reject</Button>
            <Button type="button" className="bg-green-600 hover:bg-green-700 focus:ring-green-500" onClick={() => onUpdateStatus(guide.id, 'verified')}>Approve</Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
