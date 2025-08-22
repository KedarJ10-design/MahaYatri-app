import React from 'react';
import { Guide } from '../types';
import Button from './common/Button';
import Badge from './Badge';

interface AdminPageProps {
  guides: Guide[];
  onReviewGuide: (guide: Guide) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ guides, onReviewGuide }) => {
  const pendingGuides = guides.filter(g => g.verificationStatus === 'pending');

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-extrabold text-dark dark:text-light mb-8">Admin Panel</h1>
      
      <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Pending Guide Verifications ({pendingGuides.length})</h2>
        
        {pendingGuides.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guide</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Specialties</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
                {pendingGuides.map((guide) => (
                  <tr key={guide.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={guide.avatarUrl} alt={guide.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-light">{guide.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{guide.contactInfo.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-light">{guide.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                          {guide.specialties.slice(0, 3).map(s => <Badge key={s}>{s}</Badge>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button onClick={() => onReviewGuide(guide)} variant="outline" className="py-2 px-4">Review Application</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending verifications at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
