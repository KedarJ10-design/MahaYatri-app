import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { Page, DetailedItinerary, ToastMessage, User, Booking, Stay, Vendor, Guide, Verifiable, Review } from './types';
import { useAuth } from './contexts/AuthContext';
import { getLatestItinerary, saveItinerary } from './services/db';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { initializeFCM } from './services/pushNotificationService';
import { db } from './services/firebase';

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

import { submitBookingRequest } from './services/geminiService';

const App: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const isOnline = useOnlineStatus();

    // --- GLOBAL DATA STATE ---
    const [dataLoading, setDataLoading] = useState(true);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [stays, setStays] = useState<Stay[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
    const [itinerary, setItinerary] = useState<DetailedItinerary | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // --- MODAL STATES ---
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

    const [costEstimate, setCostEstimate] = useState<any>(null); // To be fetched from AI

    const addToast = useCallback((message: string, type: ToastMessage['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (user && db) {
            setDataLoading(true);
            const collections = ['guides', 'vendors', 'stays', 'users', 'bookings', 'reviews'];
            const setters: any = {
                guides: setGuides,
                vendors: setVendors,
                stays: setStays,
                users: setAllUsers,
                bookings: setBookings,
                reviews: setReviews,
            };

            const unsubscribes = collections.map(col => 
                db.collection(col).onSnapshot(
                    snapshot => {
                        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setters[col](data);
                    },
                    (error) => {
                        addToast(`Failed to load ${col}.`, 'error');
                    }
                )
            );
            setDataLoading(false); // Set loading to false after setting up listeners

            return () => unsubscribes.forEach(unsub => unsub());
        } else if (!user) {
            // Reset state when user logs out
            setDataLoading(false);
            setGuides([]);
            setVendors([]);
            setStays([]);
            setAllUsers([]);
            setBookings([]);
            setReviews([]);
        }
    }, [user, addToast]);

    useEffect(() => {
        if (user && user.role === 'guide' && currentPage !== Page.GuideDashboard) setCurrentPage(Page.GuideDashboard);
        if (user && user.role === 'admin' && currentPage !== Page.Admin) setCurrentPage(Page.Admin);
    }, [user, currentPage]);


    useEffect(() => {
        const loadOfflineData = async () => {
            const offlineItinerary = await getLatestItinerary();
            if (offlineItinerary) setItinerary(offlineItinerary);
        };
        loadOfflineData();
    }, []);
    
    useEffect(() => {
        if (user && isOnline) initializeFCM(user.id);
    }, [user, isOnline]);

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        if (page !== Page.Itinerary && page !== Page.TripPlanner) setItinerary(null);
        window.scrollTo(0, 0);
    };

    const handleItineraryGenerated = (newItinerary: DetailedItinerary) => {
        setItinerary(newItinerary);
        setCurrentPage(Page.Itinerary);
    };
    
    const handleBookGuide = async (details: Omit<Booking, 'id' | 'userId' | 'status' | 'pointsEarned'>) => {
        if (!user) { addToast('You must be logged in to book.', 'error'); return; }
        try {
            await submitBookingRequest({ ...details, userId: user.id });
            addToast(`Booking request sent for ${details.guideId}!`, 'success');
            setBookingModalGuide(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to send booking request.";
            addToast(message, 'error');
        }
    };

    if (authLoading || dataLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark"><Spinner className="w-12 h-12 border-4" /></div>;
    }
    if (!user) return <LoginPage />;
    
    const renderPage = () => {
        switch (currentPage) {
            case Page.Home: return <HomePage onNavigate={handleNavigate} user={user} guides={guides} />;
            case Page.Explore: return <ExplorePage />;
            case Page.Search: return <SearchPage onBook={setBookingModalGuide} guides={guides} allUsers={allUsers} />;
            case Page.TripPlanner: return <TripPlannerPage onItineraryGenerated={handleItineraryGenerated} user={user} />;
            case Page.Itinerary: return itinerary ? <ItineraryPage itinerary={itinerary} onBack={() => setCurrentPage(Page.TripPlanner)} user={user} onEstimateCost={() => {}} onUpgrade={() => setIsUpgradeModalOpen(true)} onStartTrip={() => setIsLiveTripModalOpen(true)} /> : <TripPlannerPage onItineraryGenerated={handleItineraryGenerated} user={user} />;
            case Page.Profile: return <ProfilePage user={user} onApply={() => setIsGuideAppModalOpen(true)} allUsers={allUsers} onReview={setReviewModalBooking} bookings={bookings} guides={guides} />;
            case Page.Stays: return <StaysPage onBook={setStayBookingModalStay} stays={stays} />;
            case Page.Vendors: return <VendorsPage onBook={setVendorBookingModalVendor} vendors={vendors} />;
            case Page.Chat: return <ChatPage currentUser={user} allUsers={allUsers} />;
            case Page.GuideDashboard: return user.role === 'guide' ? <GuideDashboardPage guideUser={user as User & Guide} bookings={bookings} allUsers={allUsers} reviews={reviews} /> : <HomePage onNavigate={handleNavigate} user={user} guides={guides} />;
            case Page.Admin: return user.role === 'admin' ? <AdminPage users={allUsers} guides={guides} vendors={vendors} stays={stays} onVerify={setVerificationItem} onAdd={setAddItemType} onConfirm={() => {}} /> : <HomePage onNavigate={handleNavigate} user={user} guides={guides} />;
            case Page.About: return <AboutPage />;
            case Page.Contact: return <ContactPage />;
            case Page.PrivacyPolicy: return <PrivacyPolicyPage />;
            case Page.FAQ: return <FAQPage />;
            default: return <HomePage onNavigate={handleNavigate} user={user} guides={guides} />;
        }
    };

    return (
        <div className="bg-light dark:bg-dark min-h-screen flex flex-col font-sans text-dark dark:text-light">
            <Header user={user} currentPage={currentPage} onNavigate={handleNavigate} notifications={[]} onUpdateNotifications={() => {}} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderPage()}</main>
            <Footer onNavigate={handleNavigate} />
            <Chatbot />
            {isLiveTripModalOpen && <SOSButton onSOS={() => setIsSOSModalOpen(true)} />}
            <div className="fixed top-20 right-4 z-[100] space-y-2">{toasts.map(toast => <Toast key={toast.id} toast={toast} onRemove={(id) => setToasts(p => p.filter(t => t.id !== id))} />)}</div>
            {bookingModalGuide && <BookingModal guide={bookingModalGuide} onClose={() => setBookingModalGuide(null)} onBook={handleBookGuide} addToast={addToast} />}
            {stayBookingModalStay && <StayBookingModal stay={stayBookingModalStay} onClose={() => setStayBookingModalStay(null)} onBook={() => Promise.resolve()} addToast={addToast} />}
            {vendorBookingModalVendor && <VendorBookingModal vendor={vendorBookingModalVendor} onClose={() => setVendorBookingModalVendor(null)} onBook={() => Promise.resolve()} addToast={addToast} />}
            {reviewModalBooking && <ReviewModal booking={reviewModalBooking} onClose={() => setReviewModalBooking(null)} addToast={addToast} />}
            {isCostModalOpen && costEstimate && <CostEstimationModal estimate={costEstimate} onClose={() => setIsCostModalOpen(false)} />}
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