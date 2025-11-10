
import React, { useState, useMemo } from 'react';
import { User, Guide, Vendor, Stay, Verifiable } from '../types';
import Button from './common/Button';
import Badge from './Badge';
import { useAppStore } from '../store/appStore';

type Tab = 'dashboard' | 'users' | 'guides' | 'vendors' | 'stays' | 'verifications';

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 font-semibold transition-colors ${active ? 'bg-primary/10 text-primary rounded-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-lighter rounded-md'}`}>
        {children}
    </button>
);

interface AdminPageProps {
    onVerify: (item: Verifiable) => void;
    onAdd: (type: 'guide' | 'vendor' | 'stay') => void;
    onConfirm: (title: string, message: React.ReactNode, onConfirm: () => void, confirmButtonVariant?: 'primary' | 'danger') => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onVerify, onAdd, onConfirm }) => {
    const users = useAppStore(state => state.allUsers);
    const guides = useAppStore(state => state.guides);
    const vendors = useAppStore(state => state.vendors);
    const stays = useAppStore(state => state.stays);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    const allData = { users, guides, vendors, stays };

    const pendingVerifications = useMemo(() => [
        ...allData.guides.filter(g => g.verificationStatus === 'pending'),
        ...allData.vendors.filter(v => v.verificationStatus === 'pending'),
        ...allData.stays.filter(s => s.verificationStatus === 'pending'),
    ], [allData]);

    const stats = {
        totalUsers: allData.users.length,
        totalGuides: allData.guides.length,
        totalVendors: allData.vendors.length,
        totalStays: allData.stays.length,
        pendingCount: pendingVerifications.length,
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries({
                            "Total Users": stats.totalUsers,
                            "Total Guides": stats.totalGuides,
                            "Pending Verifications": stats.pendingCount,
                        }).map(([label, value]) => (
                            <div key={label} className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg text-center">
                                <p className="text-4xl font-bold text-primary">{value}</p>
                                <p className="text-gray-500 mt-2">{label}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'verifications':
                return (
                    <div className="space-y-4">
                        {pendingVerifications.map(item => (
                            <div key={item.id} className="bg-white dark:bg-dark-light p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.location} / { (item as any).type || 'Guide'}</p>
                                </div>
                                <Button size="sm" onClick={() => onVerify(item)}>Review</Button>
                            </div>
                        ))}
                        {pendingVerifications.length === 0 && <p className="text-gray-500 text-center py-8">No pending verifications.</p>}
                    </div>
                );
            case 'users':
            case 'guides':
            case 'vendors':
            case 'stays':
                const items = allData[activeTab];
                const itemType = activeTab.slice(0, -1) as 'guide' | 'vendor' | 'stay' | 'user';
                return (
                    <div>
                         <div className="flex justify-end mb-4">
                            {itemType !== 'user' && <Button onClick={() => onAdd(itemType)}>Add New {itemType}</Button>}
                        </div>
                        <div className="overflow-x-auto bg-white dark:bg-dark-light rounded-lg shadow">
                           <table className="w-full text-sm text-left">
                               <thead className="bg-gray-50 dark:bg-dark-lighter">
                                   <tr>
                                       <th className="p-4">Name</th>
                                       <th className="p-4">Location/Email</th>
                                       <th className="p-4">Status</th>
                                       <th className="p-4">Actions</th>
                                   </tr>
                               </thead>
                               <tbody>
                                    {items.map((item: any) => (
                                        <tr key={item.id} className="border-b dark:border-gray-700">
                                            <td className="p-4 font-medium">{item.name}</td>
                                            <td className="p-4 text-gray-500">{item.email || item.location}</td>
                                            <td className="p-4">
                                                <Badge color={item.verificationStatus === 'verified' || item.status === 'active' ? 'green' : item.verificationStatus === 'pending' ? 'yellow' : 'red'}>
                                                    {item.verificationStatus || item.status || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Button size="sm" variant="danger" onClick={() => onConfirm(
                                                    `Delete ${item.name}?`,
                                                    <p>Are you sure you want to permanently delete this {itemType}? This action cannot be undone.</p>,
                                                    () => console.log(`Deleting ${itemType} ${item.id}`),
                                                    'danger'
                                                )}>
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                               </tbody>
                           </table>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
            <aside className="w-full md:w-1/5">
                <nav className="flex flex-row md:flex-col gap-2 bg-white dark:bg-dark-light p-4 rounded-2xl shadow-lg sticky top-24">
                    <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
                    <TabButton active={activeTab === 'verifications'} onClick={() => setActiveTab('verifications')}>Verifications</TabButton>
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>Users</TabButton>
                    <TabButton active={activeTab === 'guides'} onClick={() => setActiveTab('guides')}>Guides</TabButton>
                    <TabButton active={activeTab === 'vendors'} onClick={() => setActiveTab('vendors')}>Vendors</TabButton>
                    <TabButton active={activeTab === 'stays'} onClick={() => setActiveTab('stays')}>Stays</TabButton>
                </nav>
            </aside>
            <main className="flex-grow">
                 <h1 className="text-3xl font-bold font-heading capitalize mb-6">{activeTab}</h1>
                 {renderContent()}
            </main>
        </div>
    );
};

export default AdminPage;
