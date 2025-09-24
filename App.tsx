

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { Page, DetailedItinerary, ToastMessage, User, Booking, Stay, Vendor, Guide, Verifiable } from './types';
import { useAuth } from './contexts/AuthContext';
import { getLatestItinerary, saveItinerary, getBookings, saveBookings } from './services/db';
import { useOnlineStatus } from './hooks/useOnlineStatus';
// FIX: Merged all imports from mockData into a single line, and added mockCostEstimate. This also resolves the missing 'mockUsers' export error by relying on the fix in mockData.ts.
import { mockBookings, mockGuides, mockStays, mockUsers as allMockUsers, mockVendors, otherUsers, mockCostEstimate } from './services/mockData';

import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import TripPlannerPage from './components/TripPlannerPage';
import ItineraryPage from './components/ItineraryPage';
import ProfilePage from './components/ProfilePage';
import StaysPage from './components/StaysPage';
import VendorsPage from './components/VendorsPage';
import ExplorePage from './components/ExplorePage';
import ChatPage from './components/ChatPage';
import AdminPage from './components/AdminPage';
import GuideDashboardPage from './components/GuideDashboardPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import FAQPage from './components/FAQPage';
import Spinner from './components/common/Spinner';
import Toast from './components/common/Toast';
import Chatbot from './components/Chatbot';
import SOSButton from './components/SOSButton';

// Modals
import BookingModal from './components/BookingModal';
import StayBookingModal from './components/StayBookingModal';
import VendorBookingModal from './components/VendorBookingModal';
import ReviewModal from './components/ReviewModal';
import CostEstimationModal from './components/CostEstimationModal';
import UpgradeModal from './components/UpgradeModal';
import SOSModal from './components/SOSModal';
import GuideApplicationModal from './components/GuideApplicationModal';
import LiveTripModal from './components/LiveTripModal';
import VerificationModal from './components/VerificationModal';
import AddItemModal from './components/AddItemModal';
import ConfirmationModal from './components/common/ConfirmationModal';

// Mock functions for offline/demo mode
import { estimateTripCost } from './services/geminiService';

const App: React.FC = () => {
    const { user, loading } = useAuth();
    const isOnline = useOnlineStatus();

    const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
    const [itinerary, setItinerary] = useState<DetailedItinerary | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // Modal states
    const [bookingModalGuide, setBookingModalGuide] = useState<Guide | null>(null);
    const [stayBookingModalStay, setStayBookingModalStay] = useState<Stay | null>(null);
    const [vendorBookingModalVendor, setVendorBookingModalVendor] = useState<Vendor | null>(null);
    const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
    const [isCostModalOpen, setIsCostModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
    const [isGuideAppModalOpen, setIsGuideAppModalOpen] = useState(false);
    const [isLiveTripModalOpen, setIsLiveTripModalOpen] = useState(false);
    const [verificationItem, setVerificationItem] = useState<Verifiable | null>(null);
    const [addItemType, setAddItemType] = useState<'guide'|'vendor'|'stay'|null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{title: string, message: React.ReactNode, onConfirm: () => void, confirmButtonVariant?: 'primary'|'danger'}|null>(null);

    const [costEstimate, setCostEstimate] = useState(mockCostEstimate);

    // FIX: Created a handler function to match the signature expected by AdminPage's `onConfirm` prop.
    const handleConfirm = (title: string, message: ReactNode, onConfirm: () => void, confirmButtonVariant?: 'primary'|'danger') => {
        setConfirmationModal({ title, message, onConfirm, confirmButtonVariant });
    };

    useEffect(() => {
        const loadOfflineData = async () => {
            const offlineItinerary = await getLatestItinerary();
            if (offlineItinerary) {
                setItinerary(offlineItinerary);
            }
        };
        loadOfflineData();
    }, []);

    const addToast = useCallback((message: string, type: ToastMessage['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };
    
    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        if (page !== Page.Itinerary) {
            // Clear itinerary if we navigate away, unless to trip planner
             if (page !== Page.TripPlanner) {
                setItinerary(null);
             }
        }
        window.scrollTo(0, 0);
    };

    const handleItineraryGenerated = (newItinerary: DetailedItinerary) => {
        setItinerary(newItinerary);
        setCurrentPage(Page.Itinerary);
    };
    
    const handleEstimateCost = async () => {
        if (!itinerary) return;
        if (!user?.isPro) {
            setIsUpgradeModalOpen(true);
            return;
        }
        addToast("Estimating costs with AI...", "info");
        try {
            const estimate = await estimateTripCost(itinerary);
            setCostEstimate(estimate);
            setIsCostModalOpen(true);
        } catch (error) {
            console.error("Cost estimation failed", error);
            addToast("Couldn't estimate costs. Using a mock estimate.", "error");
            setCostEstimate(mockCostEstimate);
            setIsCostModalOpen(true);
        }
    };

    const handleBookGuide = async (details: Omit<Booking, 'id' | 'userId' | 'status' | 'pointsEarned'>) => {
        // Mock implementation
        addToast(`Booking request sent for ${details.guideId}!`, 'success');
        setBookingModalGuide(null);
    };

    const handleBookStay = async (details: Omit<any, 'id' | 'userId' | 'status'>) => {
        addToast(`Stay booked successfully!`, 'success');
        setStayBookingModalStay(null);
    };

    const handleBookVendor = async (details: Omit<any, 'id' | 'userId' | 'status'>) => {
        addToast(`Table booked successfully!`, 'success');
        setVendorBookingModalVendor(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark">
                <Spinner className="w-12 h-12 border-4" />
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }
    
    const renderPage = () => {
        // Force redirect if role doesn't match page
        if (user.role === 'guide' && currentPage !== Page.GuideDashboard) {
            setCurrentPage(Page.GuideDashboard);
        }
        if (user.role === 'admin' && currentPage !== Page.Admin) {
            setCurrentPage(Page.Admin);
        }

        switch (currentPage) {
            case Page.Home: return <HomePage onNavigate={handleNavigate} user={user} />;
            case Page.Explore: return <ExplorePage />;
            case Page.Search: return <SearchPage onBook={setBookingModalGuide} />;
            case Page.TripPlanner: return <TripPlannerPage onItineraryGenerated={handleItineraryGenerated} user={user} />;
            case Page.Itinerary: return itinerary ? <ItineraryPage itinerary={itinerary} onBack={() => setCurrentPage(Page.TripPlanner)} user={user} onEstimateCost={handleEstimateCost} onUpgrade={() => setIsUpgradeModalOpen(true)} onStartTrip={() => setIsLiveTripModalOpen(true)} /> : <TripPlannerPage onItineraryGenerated={handleItineraryGenerated} user={user} />;
            case Page.Profile: return <ProfilePage user={user} onApply={() => setIsGuideAppModalOpen(true)} allUsers={[...otherUsers, user]} onReview={setReviewModalBooking} />;
            case Page.Stays: return <StaysPage onBook={setStayBookingModalStay} />;
            case Page.Vendors: return <VendorsPage onBook={setVendorBookingModalVendor}/>;
            case Page.Chat: return <ChatPage currentUser={user} allUsers={allMockUsers} />;
            case Page.GuideDashboard: return user.role === 'guide' ? <GuideDashboardPage guideUser={user} /> : <HomePage onNavigate={handleNavigate} user={user} />;
            // FIX: Pass the new handler function to the `onConfirm` prop.
            case Page.Admin: return user.role === 'admin' ? <AdminPage onVerify={setVerificationItem} onAdd={setAddItemType} onConfirm={handleConfirm} /> : <HomePage onNavigate={handleNavigate} user={user} />;
            case Page.About: return <AboutPage />;
            case Page.Contact: return <ContactPage />;
            case Page.PrivacyPolicy: return <PrivacyPolicyPage />;
            case Page.FAQ: return <FAQPage />;
            default: return <HomePage onNavigate={handleNavigate} user={user} />;
        }
    };

    return (
        <div className="bg-light dark:bg-dark min-h-screen flex flex-col font-sans text-dark dark:text-light">
            <Header user={user} currentPage={currentPage} onNavigate={handleNavigate} notifications={[]} onUpdateNotifications={() => {}} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderPage()}
            </main>
            <Footer onNavigate={handleNavigate} />

            {/* Global Components */}
            <Chatbot />
            {isLiveTripModalOpen && <SOSButton onSOS={() => setIsSOSModalOpen(true)} />}

            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-[100] space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>

            {/* Modals */}
            {bookingModalGuide && <BookingModal guide={bookingModalGuide} onClose={() => setBookingModalGuide(null)} onBook={handleBookGuide} addToast={addToast} />}
            {stayBookingModalStay && <StayBookingModal stay={stayBookingModalStay} onClose={() => setStayBookingModalStay(null)} onBook={handleBookStay} addToast={addToast} />}
            {vendorBookingModalVendor && <VendorBookingModal vendor={vendorBookingModalVendor} onClose={() => setVendorBookingModalVendor(null)} onBook={handleBookVendor} addToast={addToast} />}
            {reviewModalBooking && <ReviewModal booking={reviewModalBooking} onClose={() => setReviewModalBooking(null)} addToast={addToast} />}
            {isCostModalOpen && <CostEstimationModal estimate={costEstimate} onClose={() => setIsCostModalOpen(false)} />}
            {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} />}
            {isSOSModalOpen && <SOSModal user={user} onClose={() => setIsSOSModalOpen(false)} />}
            {isGuideAppModalOpen && <GuideApplicationModal onClose={() => setIsGuideAppModalOpen(false)} addToast={addToast} />}
            {isLiveTripModalOpen && itinerary && <LiveTripModal itinerary={itinerary} onClose={() => setIsLiveTripModalOpen(false)} />}
            {verificationItem && <VerificationModal item={verificationItem} onClose={() => setVerificationItem(null)} onUpdateStatus={() => {}} isLoading={false} />}
            {addItemType && <AddItemModal type={addItemType} onClose={() => setAddItemType(null)} onAdd={() => {}} />}
            {confirmationModal && <ConfirmationModal isOpen={!!confirmationModal} onClose={() => setConfirmationModal(null)} onConfirm={() => { confirmationModal.onConfirm(); setConfirmationModal(null); }} {...confirmationModal} />}
        </div>
    );
};

export default App;