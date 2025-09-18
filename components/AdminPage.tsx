
import React, { useState, useMemo } from 'react';
import { Guide, User, Booking, Vendor, Stay, Verifiable } from '../types';
import Button from './common/Button';
import Badge from './Badge';
import AddItemModal from './AddItemModal';

interface AdminPageProps {
  guides: Guide[];
  vendors: Vendor[];
  stays: Stay[];
  allUsers: User[];
  bookings: Booking[];
  currentAdmin: User;
  onReviewItem: (item: Verifiable) => void;
  onUpdateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  onAddItem: (itemData: any, itemType: 'guide' | 'vendor' | 'stay') => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-light dark:bg-dark p-6 rounded-xl shadow-md flex items-center gap-4">
        <div className="bg-primary/10 text-primary p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold font-heading text-dark dark:text-light">{value}</p>
        </div>
    </div>
);


const AdminPage: React.FC<AdminPageProps> = ({ guides, vendors, stays, onReviewItem, allUsers, bookings, onUpdateUserStatus, currentAdmin, onAddItem }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const pendingGuides = guides.filter(g => g.verificationStatus === 'pending');
  const pendingVendors = vendors.filter(v => v.verificationStatus === 'pending');
  const pendingStays = stays.filter(s => s.verificationStatus === 'pending');
  const tourists = allUsers.filter(u => u.role === 'user');
  
  const allPendingItems: Verifiable[] = [...pendingGuides, ...pendingVendors, ...pendingStays];

  const stats = useMemo(() => ({
    totalUsers: allUsers.filter(u => u.role === 'user').length,
    totalGuides: guides.length,
    totalVendors: vendors.length,
    totalStays: stays.length,
    pendingVerifications: allPendingItems.length,
    totalBookings: bookings.length,
  }), [allUsers, guides, vendors, stays, allPendingItems, bookings]);

  const TabButton: React.FC<{tab: string; children: React.ReactNode}> = ({tab, children}) => (
    <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 font-semibold rounded-md transition-colors text-sm ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark'}`}
    >
        {children}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light">Admin Panel</h1>
        <div className="flex items-center gap-4">
            <Button onClick={() => setIsAddItemModalOpen(true)}>+ Add New Entry</Button>
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-dark-light rounded-lg shadow-sm self-start flex-wrap">
                <TabButton tab="dashboard">Dashboard</TabButton>
                <TabButton tab="guides">Guides ({guides.length})</TabButton>
                <TabButton tab="vendors">Vendors ({vendors.length})</TabButton>
                <TabButton tab="stays">Stays ({stays.length})</TabButton>
                <TabButton tab="users">Users ({tourists.length})</TabButton>
                <TabButton tab="bookings">Bookings ({bookings.length})</TabButton>
            </div>
        </div>
      </div>
      
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.44-2.143M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" /></svg>} />
                <StatCard title="Total Guides" value={stats.totalGuides} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M12 12L4 7l8-4 8 4-8 5z" /></svg>} />
                <StatCard title="Total Vendors" value={stats.totalVendors} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 2a1 1 0 011 1v1.586l.707-.707a1 1 0 011.414 0L6.5 4.293l.293-.293a1 1 0 011.414 0L9.5 5.293l.293-.293a1 1 0 011.414 0L12.5 6.293l.293-.293a1 1 0 011.414 0L15.5 7.293l.293-.293a1 1 0 011.414 0l.707.707V3a1 1 0 112 0v1.586l.707-.707a1 1 0 111.414 1.414L19.414 6.5l.293.293a1 1 0 11-1.414 1.414L17.586 7.5l-1.293 1.293a1 1 0 01-1.414 0L13.586 7.5l-1.293 1.293a1 1 0 01-1.414 0L9.586 7.5 8.293 8.793a1 1 0 01-1.414 0L5.586 7.5 4.293 8.793a1 1 0 01-1.414 0L2 7.914V15a1 1 0 01-1 1H1a1 1 0 110-2h.586L12 3.414l1.707 1.707a1 1 0 010 1.414L12.414 7.828 11.707 7.121a1 1 0 00-1.414 0L9 8.414l-1.293-1.293a1 1 0 00-1.414 0L5 8.414 3.707 7.121a1 1 0 00-1.414 0L1.586 7.828a1 1 0 01-1.414-1.414L2 4.707V3a1 1 0 01-1-1H1a1 1 0 110-2h1zM18 11a1 1 0 100 2h-4a1 1 0 100 2h4a1 1 0 100-2zm-6 2a1 1 0 100 2H8a1 1 0 100-2h4z" /></svg>} />
                 <StatCard title="Total Stays" value={stats.totalStays} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.706-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.172 4.243a1 1 0 111.414 1.414l.707-.707a1 1 0 11-1.414-1.414l-.707.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zm2.172 4.243l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4.464 4.95l-.707-.707a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414z" /></svg>} />
            </div>
            <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold font-heading mb-4">Pending Verifications ({allPendingItems.length})</h2>
                {allPendingItems.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-dark">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
                        {allPendingItems.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10"><img className="h-10 w-10 rounded-full" src={item.avatarUrl} alt={item.name} /></div><div className="ml-4"><div className="text-sm font-medium">{item.name}</div></div></div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{ 'bio' in item ? 'Guide' : 'cuisine' in item ? 'Vendor' : 'Stay'}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm">{item.location}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><Button onClick={() => onReviewItem(item)} variant="outline" className="py-2 px-4">Review</Button></td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                ) : ( <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending verifications.</p> )}
            </div>
        </div>
      )}

      {activeTab === 'guides' && (
         <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold font-heading mb-4">All Guides</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th><th className="relative px-6 py-3"></th></tr></thead>
                  <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
                    {guides.map(g => (<tr key={g.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><img className="h-10 w-10 rounded-full" src={g.avatarUrl} alt="" /><div className="ml-4"><div className="text-sm font-medium">{g.name}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{g.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{g.rating.toFixed(1)} ({g.reviewCount})</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={g.verificationStatus === 'verified' ? 'green' : g.verificationStatus === 'pending' ? 'yellow' : 'red'}>{g.verificationStatus}</Badge></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{ g.verificationStatus === 'pending' && <Button onClick={() => onReviewItem(g)} variant="outline" className="py-1 px-2 text-xs">Review</Button>}</td></tr>
                    ))}
                  </tbody>
                </table>
            </div>
         </div>
      )}
       {activeTab === 'vendors' && (
         <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold font-heading mb-4">All Vendors</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th><th className="relative px-6 py-3"></th></tr></thead>
                  <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
                    {vendors.map(v => (<tr key={v.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><img className="h-10 w-10 rounded-full" src={v.avatarUrl} alt="" /><div className="ml-4"><div className="text-sm font-medium">{v.name}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{v.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{v.rating.toFixed(1)} ({v.reviewCount})</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={v.verificationStatus === 'verified' ? 'green' : v.verificationStatus === 'pending' ? 'yellow' : 'red'}>{v.verificationStatus}</Badge></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{ v.verificationStatus === 'pending' && <Button onClick={() => onReviewItem(v)} variant="outline" className="py-1 px-2 text-xs">Review</Button>}</td></tr>
                    ))}
                  </tbody>
                </table>
            </div>
         </div>
      )}
      {activeTab === 'stays' && (
         <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold font-heading mb-4">All Stays</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th><th className="relative px-6 py-3"></th></tr></thead>
                  <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
                    {stays.map(s => (<tr key={s.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><img className="h-10 w-10 rounded-full" src={s.avatarUrl} alt="" /><div className="ml-4"><div className="text-sm font-medium">{s.name}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{s.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{s.rating.toFixed(1)} ({s.reviewCount})</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={s.verificationStatus === 'verified' ? 'green' : s.verificationStatus === 'pending' ? 'yellow' : 'red'}>{s.verificationStatus}</Badge></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{ s.verificationStatus === 'pending' && <Button onClick={() => onReviewItem(s)} variant="outline" className="py-1 px-2 text-xs">Review</Button>}</td></tr>
                    ))}
                  </tbody>
                </table>
            </div>
         </div>
      )}
       {activeTab === 'users' && (
         <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold font-heading mb-4">All Users</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th><th className="relative px-6 py-3"></th></tr></thead>
                  <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
                    {tourists.map(u => (<tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><img className="h-10 w-10 rounded-full" src={u.avatarUrl} alt="" /><div className="ml-4"><div className="text-sm font-medium">{u.name}</div><div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{u.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={u.status === 'active' ? 'green' : 'red'}>{u.status}</Badge></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {u.status === 'active' ? 
                                <Button className="py-1 px-2 text-xs bg-red-600 hover:bg-red-700" onClick={() => onUpdateUserStatus(u.id, 'suspended')}>Suspend</Button> :
                                <Button className="py-1 px-2 text-xs bg-green-600 hover:bg-green-700" onClick={() => onUpdateUserStatus(u.id, 'active')}>Reactivate</Button>
                            }
                        </td></tr>
                    ))}
                  </tbody>
                </table>
            </div>
         </div>
      )}
       {activeTab === 'bookings' && (
         <div className="bg-white dark:bg-dark-light p-6 rounded-2xl shadow-lg animate-fade-in">
            <h2 className="text-2xl font-bold font-heading mb-4">All Bookings</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tourist</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Guide</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th></tr></thead>
                  <tbody className="bg-white dark:bg-dark-light divide-y divide-gray-200 dark:divide-gray-700">
                    {bookings.map(b => {
                        const tourist = allUsers.find(u => u.id === b.userId);
                        const guide = guides.find(g => g.id === b.guideId);
                        return (<tr key={b.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{tourist?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{guide?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{b.startDate} to {b.endDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={b.status === 'COMPLETED' ? 'green' : 'blue'}>{b.status}</Badge></td>
                        </tr>)
                    })}
                  </tbody>
                </table>
            </div>
         </div>
      )}

       {isAddItemModalOpen && (
        <AddItemModal 
          onClose={() => setIsAddItemModalOpen(false)}
          onAddItem={(itemData, itemType) => {
            onAddItem(itemData, itemType);
            setIsAddItemModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminPage;
