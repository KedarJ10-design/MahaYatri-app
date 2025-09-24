import React, { useState, useEffect, useCallback } from 'react';
import { Page, User, Guide, Booking, BookingStatus, DetailedItinerary, PlaceSuggestion, Vendor, Stay, Notification, ToastMessage, UserRole, Review, CostEstimate } from './types';
import { useAuth } from './contexts/AuthContext';
import { mockGuides, mockBookings, mockVendors, mockStays, mockNotifications, otherUsers } from './services/mockData';
import { getLatestItinerary, saveBookings, getBookings as getBookingsFromDB } from './services/db';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import TripPlannerPage from './components/TripPlannerPage';
import ProfilePage from './components/ProfilePage';
import ExplorePage from './components/ExplorePage';
import ChatPage from './components/ChatPage';
import ItineraryPage from './components/ItineraryPage';
import AdminPage from './components/AdminPage';
import GuideDashboardPage from './components/GuideDashboardPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import StaysPage from './components/StaysPage';
import VendorsPage from './components/VendorsPage';
import FAQPage from './components/FAQPage';
import Chatbot from './components/Chatbot';
import SOSButton from './components/SOSButton';
import SOSModal from './components/SOSModal';
import UpgradeModal from './components/UpgradeModal';
import CostEstimationModal from './components/CostEstimationModal';
import LiveTripModal from './components/LiveTripModal';
import Toast from './components/common/Toast';
import Spinner from './components/common/Spinner';

const App: React.FC = () => {
    const { user, loading, updateUser, signOut } = useAuth();
    
    // Global state
    const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
    const [itinerary, setItinerary] = useState<DetailedItinerary | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Modal state
    const [isSOSModalOpen, setSOSModalOpen] = useState(false);
    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [isCostModalOpen, setCostModalOpen] = useState(false);
    const [isLiveTripModalOpen, setLiveTripModalOpen] = useState(false);
    const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);

    // Data state (simulating a database)
    const [guides, setGuides] = useState<Guide[]>(mockGuides);
    const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
    const [stays, setStays] = useState<Stay[]>(mockStays);
    const [bookings, setBookings] = useState<Booking[]>(mockBookings);
    const [allUsers, setAllUsers] = useState<User[]>([...otherUsers, user!].filter(Boolean));

    // Offline data loading on initial mount
    useEffect(() => {
        const loadOfflineData = async () => {
            const cachedItinerary = await getLatestItinerary();
            if (cachedItinerary) {
                setItinerary(cachedItinerary);
            }
            const cachedBookings = await getBookingsFromDB();
             if (cachedBookings.length > 0) {
                // In a real app with a backend, you'd merge this with fresh data.
                // For mock mode, we just load it.
                setBookings(cachedBookings);
            }
        };
        loadOfflineData();
    }, []);

    // Save bookings to IndexedDB whenever they change
    useEffect(() => {
        if (bookings.length > 0) {
            saveBookings(bookings);
        }
    }, [bookings]);

    // Reset to home page on user change (login/logout)
    useEffect(() => {
        setCurrentPage(Page.Home);
        setItinerary(null);
    }, [user]);
    
    useEffect(() => {
        if(user) setAllUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    }, [user]);

    const addToast = useCallback((message: string, type: ToastMessage['type']) => {
        const newToast: ToastMessage = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
    }, []);

    const handleNavigate = (page: Page) => {
        if (page === Page.TripPlanner && itinerary) {
            setItinerary(null); // Reset itinerary when navigating back to planner
        }
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleItineraryGenerated = (generatedItinerary: DetailedItinerary) => {
        setItinerary(generatedItinerary);
        setCurrentPage(Page.Itinerary);
    };

    const handleStartTrip = () => {
        if (itinerary) {
            setLiveTripModalOpen(true);
            addToast("Your live trip has started!", "success");
        }
    };
    
    const handleEstimateCost = async () => {
        if (itinerary) {
            // In a real app, this would call the gemini service.
            // For this mock, we'll just create some plausible data.
            const estimated: CostEstimate = {
                accommodation: { amount: itinerary.total_estimated_cost * 0.4, description: "Mid-range hotels" },
                food: { amount: itinerary.total_estimated_cost * 0.3, description: "Mix of local and cafe dining" },
                localTransport: { amount: itinerary.total_estimated_cost * 0.15, description: "Rickshaws and local taxis" },
                activities: { amount: itinerary.total_estimated_cost * 0.15, description: "Entry fees and tours" },
            };
            setCostEstimate(estimated);
            setCostModalOpen(true);
        }
    }

    const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
        try {
            const userToUpdate = allUsers.find(u => u.id === userId);
            if (!userToUpdate) throw new Error("User not found");
            // In a real app this is a backend call. Here we just update local state.
            setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
            addToast(`Updated ${userToUpdate.name}'s role to ${newRole}.`, 'success');
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to update user role.";
            addToast(message, "error");
            throw e;
        }
    };

    const handleDeleteItem = (id: string, type: 'guide' | 'vendor' | 'stay' | 'user') => {
        // Mock deletion
        if (type === 'guide') setGuides(guides.filter(g => g.id !== id));
        if (type === 'vendor') setVendors(vendors.filter(v => v.id !== id));
        if (type === 'stay') setStays(stays.filter(s => s.id !== id));
        if (type === 'user') {
            if (user?.id === id) {
                addToast("You can't delete yourself!", "error");
                return;
            }
            setAllUsers(allUsers.filter(u => u.id !== id));
        }
        addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`, 'success');
    };
    
    // Mock handler for the follow feature to provide immediate UI feedback.
    const handleFollowToggle = (guideId: string) => {
        if (!user) return;
        const isFollowing = user.followingGuideIds.includes(guideId);
        
        // Update guide's follower count
        setGuides(prevGuides => prevGuides.map(g => {
            if (g.id === guideId) {
                return { ...g, followersCount: g.followersCount + (isFollowing ? -1 : 1) };
            }
            return g;
        }));

        // Update user's following list (delegated to useAuth for persistence)
        const newFollowingIds = isFollowing
            ? user.followingGuideIds.filter(id => id !== guideId)
            : [...user.followingGuideIds, guideId];
        
        updateUser({ followingGuideIds: newFollowingIds });
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark"><Spinner className="w-12 h-12" /></div>;
    }

    if (!user) {
        return <LoginPage />;
    }

    const renderPage = () => {
        if (itinerary && currentPage === Page.Itinerary) {
            return <ItineraryPage 
                        itinerary={itinerary} 
                        onBack={() => setCurrentPage(Page.TripPlanner)} 
                        user={user}
                        onEstimateCost={handleEstimateCost}
                        onUpgrade={() => setUpgradeModalOpen(true)}
                        onStartTrip={handleStartTrip}
                    />;
        }
        
        switch (currentPage) {
            case Page.Home: return <HomePage onNavigate={handleNavigate} guides={guides} user={user} />;
            case Page.Search: return <SearchPage guides={guides} allUsers={allUsers} onFollowToggle={handleFollowToggle} user={user} addToast={addToast} />;
            case Page.TripPlanner: return <TripPlannerPage onItineraryGenerated={handleItineraryGenerated} user={user} />;
            case Page.Profile: return <ProfilePage user={user} allUsers={allUsers} bookings={bookings.filter(b => b.userId === user.id)} guides={guides} addToast={addToast} />;
            case Page.Explore: return <ExplorePage />;
            case Page.Chat: return <ChatPage currentUser={user} guides={guides} activeConversationId={null} onViewConversation={() => {}} onSendMessage={async () => {}} onBack={() => {}} addToast={addToast} />;
            case Page.Admin: return <AdminPage users={allUsers} guides={guides} vendors={vendors} stays={stays} onDeleteItem={handleDeleteItem} onUpdateUserRole={handleUpdateUserRole} addToast={addToast} />;
            case Page.GuideDashboard: return <GuideDashboardPage guideUser={user} allUsers={allUsers} onUpdateAvailability={async () => {}} onUpdateBookingStatus={async () => {}} addToast={addToast} />;
            case Page.About: return <AboutPage />;
            case Page.Contact: return <ContactPage />;
            case Page.PrivacyPolicy: return <PrivacyPolicyPage />;
            case Page.Stays: return <StaysPage stays={stays} addToast={addToast} />;
            case Page.Vendors: return <VendorsPage vendors={vendors} addToast={addToast} />;
            case Page.FAQ: return <FAQPage />;
            default: return <HomePage onNavigate={handleNavigate} guides={guides} user={user} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light font-body">
            <Header user={user} currentPage={currentPage} onNavigate={handleNavigate} notifications={notifications} onUpdateNotifications={setNotifications} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderPage()}
            </main>
            <Footer onNavigate={handleNavigate} />
            
            {/* Global Components & Modals */}
            <Chatbot />
            {user.role === 'user' && <SOSButton onSOS={() => setSOSModalOpen(true)} />}
            {isSOSModalOpen && user.emergencyContact && <SOSModal user={user} onClose={() => setSOSModalOpen(false)} />}
            {isUpgradeModalOpen && <UpgradeModal onClose={() => setUpgradeModalOpen(false)} />}
            {isCostModalOpen && costEstimate && <CostEstimationModal estimate={costEstimate} onClose={() => setCostModalOpen(false)} />}
            {isLiveTripModalOpen && itinerary && <LiveTripModal itinerary={itinerary} onClose={() => setLiveTripModalOpen(false)} />}
            
            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-[100] w-full max-w-sm space-y-2">
                {toasts.map(toast => <Toast key={toast.id} toast={toast} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />)}
            </div>
        </div>
    );
};

export default App;