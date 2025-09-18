import React, { useState, useMemo } from 'react';
import { User, Guide, Vendor, Stay, Verifiable } from '../types';
import Button from './common/Button';
import Badge from './Badge';
import VerificationModal from './VerificationModal';
import AddItemModal from './AddItemModal';

type ItemType = 'guide' | 'vendor' | 'stay';

interface AdminPageProps {
  users: User[];
  guides: Guide[];
  vendors: Vendor[];
  stays: Stay[];
  onUpdateUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onUpdateGuides: React.Dispatch<React.SetStateAction<Guide[]>>;
  onUpdateVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  onUpdateStays: React.Dispatch<React.SetStateAction<Stay[]>>;
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-light dark:bg-dark p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold font-heading text-dark dark:text-light">{value}</p>
        </div>
    </div>
);

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const { users, guides, vendors, stays, onUpdateUsers, onUpdateGuides, onUpdateVendors, onUpdateStays } = props;
    const [activeTab, setActiveTab] = useState('dashboard');
    const [modal, setModal] = useState<{ type: 'verify' | 'add'; item?: Verifiable }>({ type: 'verify', item: undefined });

    const stats = useMemo(() => ({
        totalUsers: users.length,
        totalGuides: guides.length,
        pendingVerifications: [...guides, ...vendors, ...stays].filter(i => i.verificationStatus === 'pending').length,
        totalBookings: 125, // Mocked for demo
    }), [users, guides, vendors, stays]);

    const pendingItems = useMemo(() => 
        [...guides, ...vendors, ...stays].filter(i => i.verificationStatus === 'pending'),
    [guides, vendors, stays]);

    const handleUpdateStatus = (itemId: string, status: 'verified' | 'rejected') => {
        const item = [...guides, ...vendors, ...stays].find(i => i.id === itemId);
        if (!item) return;

        const updateState = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
            setter(prev => prev.map(p => p.id === itemId ? { ...p, verificationStatus: status } : p));
        };
        
        if ('bio' in item) updateState(onUpdateGuides);
        else if ('cuisine' in item) updateState(onUpdateVendors);
        else if ('amenities' in item) updateState(onUpdateStays);
        
        // If it was a guide application from an existing user, update their status
        const user = users.find(u => u.id === itemId);
        if(user && status === 'verified') {
            onUpdateUsers(prev => prev.map(u => u.id === itemId ? {...u, role: 'guide', hasPendingApplication: false } : u));
        } else if (user && status === 'rejected') {
            onUpdateUsers(prev => prev.map(u => u.id === itemId ? {...u, hasPendingApplication: false } : u));
        }


        setModal({ type: 'verify', item: undefined });
    };

    const handleUserStatusToggle = (userId: string) => {
        onUpdateUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
            }
            return u;
        }));
    };

    const handleAddItem = (itemData: any, itemType: ItemType) => {
        const newItem = {
            ...itemData,
            id: `${itemType}-${Date.now()}`,
            verificationStatus: 'verified',
        };

        if (itemType === 'guide') onUpdateGuides(prev => [...prev, newItem as Guide]);
        else if (itemType === 'vendor') onUpdateVendors(prev => [...prev, newItem as Vendor]);
        else if (itemType === 'stay') onUpdateStays(prev => [...prev, newItem as Stay]);
        
        setModal({ type: 'add' });
    };

    const renderTable = (headers: string[], data: any[], renderRow: (item: any) => JSX.Element) => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark dark:text-gray-400">
                    <tr>{headers.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} className="bg-white dark:bg-dark-light border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark">{renderRow(item)}</tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const tabs = ['dashboard', 'verifications', 'users', 'guides', 'vendors', 'stays'];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <Button onClick={() => setModal({ type: 'add' })}>+ Add New</Button>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap -mb-px">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`mr-2 inline-block p-4 border-b-2 rounded-t-lg capitalize ${activeTab === tab ? 'text-primary border-primary' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}>
                            {tab}{tab === 'verifications' && ` (${pendingItems.length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-dark-light p-6 rounded-b-lg shadow-md">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Users" value={stats.totalUsers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 01-3 5.197z" /></svg>}/>
                        <StatCard title="Verified Guides" value={stats.totalGuides} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /></svg>} />
                        <StatCard title="Pending Verifications" value={stats.pendingVerifications} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}/>
                        <StatCard title="Total Bookings" value={stats.totalBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
                    </div>
                )}
                
                {activeTab === 'verifications' && renderTable(
                    ['Name', 'Type', 'Location', 'Actions'],
                    pendingItems,
                    (item: Verifiable) => (
                        <>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                            <td className="px-6 py-4">{ 'bio' in item ? 'Guide' : ('cuisine' in item ? 'Vendor' : 'Stay') }</td>
                            <td className="px-6 py-4">{item.location}</td>
                            <td className="px-6 py-4"><Button variant="outline" className="py-1 px-3 text-xs" onClick={() => setModal({ type: 'verify', item })}>Review</Button></td>
                        </>
                    )
                )}

                {activeTab === 'users' && renderTable(
                    ['Name', 'Email', 'Role', 'Status', 'Actions'],
                    users,
                    (user: User) => (
                        <>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4 capitalize">{user.role}</td>
                            <td className="px-6 py-4"><Badge color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Badge></td>
                            <td className="px-6 py-4"><Button variant="ghost" className="text-xs" onClick={() => handleUserStatusToggle(user.id)}>{user.status === 'active' ? 'Suspend' : 'Activate'}</Button></td>
                        </>
                    )
                )}

                {activeTab === 'guides' && renderTable(
                    ['Name', 'Location', 'Rating', 'Status', 'Actions'],
                    guides,
                    (guide: Guide) => (
                        <>
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{guide.name}</td>
                           <td className="px-6 py-4">{guide.location}</td>
                           <td className="px-6 py-4">{guide.rating} ({guide.reviewCount})</td>
                           <td className="px-6 py-4"><Badge color={guide.verificationStatus === 'verified' ? 'green' : (guide.verificationStatus === 'pending' ? 'yellow' : 'red')}>{guide.verificationStatus}</Badge></td>
                           <td className="px-6 py-4"><Button variant="ghost" className="text-xs">Edit</Button></td>
                        </>
                    )
                )}

                 {activeTab === 'vendors' && renderTable(
                    ['Name', 'Location', 'Type', 'Status', 'Actions'],
                    vendors,
                    (vendor: Vendor) => (
                         <>
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{vendor.name}</td>
                           <td className="px-6 py-4">{vendor.location}</td>
                           <td className="px-6 py-4">{vendor.type}</td>
                           <td className="px-6 py-4"><Badge color={vendor.verificationStatus === 'verified' ? 'green' : (vendor.verificationStatus === 'pending' ? 'yellow' : 'red')}>{vendor.verificationStatus}</Badge></td>
                           <td className="px-6 py-4"><Button variant="ghost" className="text-xs">Edit</Button></td>
                        </>
                    )
                )}

                 {activeTab === 'stays' && renderTable(
                    ['Name', 'Location', 'Type', 'Status', 'Actions'],
                    stays,
                    (stay: Stay) => (
                         <>
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{stay.name}</td>
                           <td className="px-6 py-4">{stay.location}</td>
                           <td className="px-6 py-4">{stay.type}</td>
                           <td className="px-6 py-4"><Badge color={stay.verificationStatus === 'verified' ? 'green' : (stay.verificationStatus === 'pending' ? 'yellow' : 'red')}>{stay.verificationStatus}</Badge></td>
                           <td className="px-6 py-4"><Button variant="ghost" className="text-xs">Edit</Button></td>
                        </>
                    )
                )}

            </div>
            {modal.type === 'verify' && modal.item && (
                <VerificationModal 
                    item={modal.item} 
                    onClose={() => setModal({ type: 'verify' })} 
                    onUpdateStatus={handleUpdateStatus} 
                />
            )}
             {modal.type === 'add' && (
                <AddItemModal 
                    onClose={() => setModal({ type: 'add' })} 
                    onAddItem={handleAddItem}
                />
            )}
        </div>
    );
};

export default AdminPage;
