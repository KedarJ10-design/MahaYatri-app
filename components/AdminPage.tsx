import React, { useState } from 'react';
import { User, Guide, Vendor, Stay, Verifiable, UserRole, ToastMessage } from '../types';
import VerificationModal from './VerificationModal';
import AddItemModal from './AddItemModal';
import Button from './common/Button';
import Badge from './Badge';
import { db } from '../services/firebase';
import ConfirmationModal from './common/ConfirmationModal';
import LazyImage from './common/LazyImage';

type ItemType = 'guide' | 'vendor' | 'stay' | 'user';

interface AdminPageProps {
  users: User[];
  guides: Guide[];
  vendors: Vendor[];
  stays: Stay[];
  onDeleteItem: (id: string, type: ItemType) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  addToast: (message: string, type: ToastMessage['type']) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ users, guides, vendors, stays, onDeleteItem, onUpdateUserRole, addToast }) => {
  const [activeTab, setActiveTab] = useState('verification');
  const [itemToVerify, setItemToVerify] = useState<Verifiable | null>(null);
  const [addItemType, setAddItemType] = useState<'guide' | 'vendor' | 'stay' | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: ItemType } | null>(null);


  const pendingVerifications = [
      ...guides.filter(g => g.verificationStatus === 'pending'),
      ...vendors.filter(v => v.verificationStatus === 'pending'),
      ...stays.filter(s => s.verificationStatus === 'pending'),
  ];
  
  const handleUpdateStatus = async (itemId: string, status: 'verified' | 'rejected') => {
      const loadingKey = `verify-${itemId}`;
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      const isGuide = guides.some(g => g.id === itemId);
      const isVendor = vendors.some(v => v.id === itemId);
      const collectionName = isGuide ? 'guides' : isVendor ? 'vendors' : 'stays';

      try {
          if (!db) throw new Error("Database not connected.");
          
          await db.collection(collectionName).doc(itemId).update({ verificationStatus: status });
          
          // If a guide application is processed, update the corresponding user record.
          if (isGuide) {
              const guideUser = users.find(u => u.id === itemId);
              if (guideUser) {
                  const newRole = status === 'verified' ? 'guide' : guideUser.role; // Don't demote on rejection
                  await db.collection('users').doc(itemId).update({ 
                      hasPendingApplication: false,
                      role: newRole,
                  });
              }
          }
          
          addToast(`${collectionName.slice(0, -1)} status updated!`, 'success');
          setItemToVerify(null);
      } catch (e) {
          console.error(e);
          addToast('Failed to update status.', 'error');
      } finally {
          setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
      }
  }

  const handleAddItem = (item: any, type: 'guide' | 'vendor' | 'stay') => {
    if (db) {
        db.collection(`${type}s`).doc(item.id).set(item)
            .then(() => addToast(`${type} added successfully!`, 'success'))
            .catch((e) => {
                console.error(e);
                addToast(`Failed to add ${type}.`, 'error');
            });
    }
    setAddItemType(null);
  }

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
      const loadingKey = `status-${userId}`;
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      try {
        if (db) await db.collection('users').doc(userId).update({ status: newStatus });
        addToast("User status updated.", "success");
      } catch(e) {
        addToast("Failed to update status.", "error");
      } finally {
        setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
      }
  }
  
  const handleDeleteClick = (item: { id: string, name: string }, type: ItemType) => {
    setItemToDelete({ ...item, type });
  }

  const confirmDelete = () => {
    if (itemToDelete) {
        onDeleteItem(itemToDelete.id, itemToDelete.type);
        setItemToDelete(null);
    }
  }
  
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const loadingKey = `role-${userId}`;
    setLoadingStates(prev => ({...prev, [loadingKey]: true}));
    try {
        await onUpdateUserRole(userId, newRole);
    } catch (e) {
      // Error toast is shown by the parent handler
    } finally {
        setLoadingStates(prev => ({...prev, [loadingKey]: false}));
    }
  };


  const TabButton: React.FC<{tab: string, count: number, children: React.ReactNode}> = ({tab, count, children}) => (
      <button onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm sm:text-base font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === tab ? 'bg-white dark:bg-dark-light border-b-2 border-primary text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark'}`}>
          {children}
          <Badge color={activeTab === tab ? 'blue' : 'gray'}>{count}</Badge>
      </button>
  );

  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="border-b border-gray-200 dark:border-gray-700 flex flex-wrap -mb-px">
            <TabButton tab="verification" count={pendingVerifications.length}>Verification</TabButton>
            <TabButton tab="users" count={users.length}>Users</TabButton>
            <TabButton tab="guides" count={guides.length}>Guides</TabButton>
            <TabButton tab="vendors" count={vendors.length}>Vendors</TabButton>
            <TabButton tab="stays" count={stays.length}>Stays</TabButton>
        </div>
        
        <div className="mt-8 bg-white dark:bg-dark-light p-4 md:p-6 rounded-2xl shadow-lg">
            {activeTab === 'verification' && (
                 <div>
                    <h2 className="text-xl font-bold mb-4">Pending Verifications</h2>
                    {pendingVerifications.length > 0 ? pendingVerifications.map(item => (
                        <div key={item.id} className="p-4 mb-2 bg-light dark:bg-dark rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-gray-100 dark:hover:bg-dark-lighter/70 transition-all transform hover:-translate-y-px">
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.location}</p>
                            </div>
                            <Button onClick={() => setItemToVerify(item)} className="self-end sm:self-center">Review</Button>
                        </div>
                    )) : <p>No pending verifications.</p>}
                 </div>
            )}
             {activeTab === 'users' && (
                 <div>
                    <h2 className="text-xl font-bold mb-4">Manage Users</h2>
                    <div className="space-y-3">
                    {users.map(user => (
                        <div key={user.id} className="p-4 bg-light dark:bg-dark rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-100 dark:hover:bg-dark-lighter/70 transition-all">
                            <div className="flex items-center gap-4 flex-grow">
                                <LazyImage 
                                    src={user.avatarUrl} 
                                    alt={user.name} 
                                    className="w-12 h-12 rounded-full flex-shrink-0"
                                    placeholderClassName="rounded-full"
                                    sizes="48px"
                                />
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-lg">{user.name}</p>
                                        <Badge color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center flex-wrap flex-shrink-0 self-end sm:self-center">
                                {user.role !== 'admin' ? (
                                    <>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            disabled={loadingStates[`role-${user.id}`]}
                                            className="h-full px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50"
                                        >
                                            <option value="user">User</option>
                                            <option value="guide">Guide</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <Button size="sm" variant={user.status === 'active' ? 'outline' : 'secondary'} onClick={() => handleUpdateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')} loading={loadingStates[`status-${user.id}`]}>
                                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteClick(user, 'user')}>Delete</Button>
                                    </>
                                ) : (
                                    <Badge color="gray">Admin</Badge>
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                 </div>
            )}
            {activeTab === 'guides' && (
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Manage Guides</h2>
                        <Button onClick={() => setAddItemType('guide')}>Add New</Button>
                     </div>
                     {guides.map(guide => (
                         <div key={guide.id} className="p-4 mb-2 bg-light dark:bg-dark rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-lighter/70 transition-all">
                             <div>
                                 <p className="font-bold">{guide.name}</p>
                                 <p className="text-sm text-gray-500">{guide.location} - <span className="capitalize">{guide.verificationStatus}</span></p>
                             </div>
                             <Button size="sm" variant="danger" onClick={() => handleDeleteClick(guide, 'guide')} className="self-end sm:self-center">Delete</Button>
                         </div>
                     ))}
                </div>
            )}
            {activeTab === 'vendors' && (
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Manage Vendors</h2>
                        <Button onClick={() => setAddItemType('vendor')}>Add New</Button>
                     </div>
                     {vendors.map(vendor => (
                         <div key={vendor.id} className="p-4 mb-2 bg-light dark:bg-dark rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-lighter/70 transition-all">
                             <div>
                                 <p className="font-bold">{vendor.name}</p>
                                 <p className="text-sm text-gray-500">{vendor.location} - <span className="capitalize">{vendor.verificationStatus}</span></p>
                             </div>
                             <Button size="sm" variant="danger" onClick={() => handleDeleteClick(vendor, 'vendor')} className="self-end sm:self-center">Delete</Button>
                         </div>
                     ))}
                </div>
            )}
            {activeTab === 'stays' && (
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Manage Stays</h2>
                        <Button onClick={() => setAddItemType('stay')}>Add New</Button>
                     </div>
                     {stays.map(stay => (
                         <div key={stay.id} className="p-4 mb-2 bg-light dark:bg-dark rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-lighter/70 transition-all">
                             <div>
                                 <p className="font-bold">{stay.name}</p>
                                 <p className="text-sm text-gray-500">{stay.location} - <span className="capitalize">{stay.verificationStatus}</span></p>
                             </div>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteClick(stay, 'stay')} className="self-end sm:self-center">Delete</Button>
                         </div>
                     ))}
                </div>
            )}
        </div>

        {itemToVerify && <VerificationModal item={itemToVerify} onClose={() => setItemToVerify(null)} onUpdateStatus={handleUpdateStatus} isLoading={loadingStates[`verify-${itemToVerify.id}`]} />}
        {addItemType && <AddItemModal type={addItemType} onClose={() => setAddItemType(null)} onAdd={handleAddItem} />}
        {itemToDelete && (
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={
                    <>
                        Are you sure you want to delete the {itemToDelete.type}{' '}
                        <strong>"{itemToDelete.name}"</strong>? This action cannot be undone.
                    </>
                }
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            />
        )}
    </div>
  );
};

export default AdminPage;