import React, { useState, useEffect, useMemo } from 'react';

// Contexts & Hooks
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './hooks/useTheme';
import { useRazorpay } from './hooks/useRazorpay';

// Firebase
import { db, firebaseConfig } from './services/firebase';

// Components
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import TripPlannerPage from './components/TripPlannerPage';
import ProfilePage from './components/ProfilePage';
import BookingModal from './components/BookingModal';
import CostEstimationModal from './components/CostEstimationModal';
import PlaceDetailsModal from './components/PlaceDetailsModal';
import SOSButton from './components/SOSButton';
import SOSModal from './components/SOSModal';
import Chatbot from './components/Chatbot';
import UpgradeModal from './components/UpgradeModal';
import VerificationModal from './components/VerificationModal';
import AdminPage from './components/AdminPage';
import GuideDashboardPage from './components/GuideDashboardPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ExplorePage from './components/ExplorePage';
import ChatPage from './components/ChatPage';
import ReviewModal from './components/ReviewModal';
import ItineraryBuilderModal from './components/ItineraryBuilderModal';
import ItineraryPage from './components/ItineraryPage';
import VendorsPage from './components/VendorsPage';
import StaysPage from './components/StaysPage';
import Spinner from './components/common/Spinner';

// Types and Data
import { Page, Guide, Booking, Itinerary, PlaceSuggestion, User, BookingStatus, Review, Verifiable, DetailedItinerary, Conversation, DirectMessage, Vendor, Stay, Reward } from './types';
import { otherUsers, mockConversations, mockMessages, mockReviews, mockAdminUser, mockGuideUser } from './services/mockData';
import { generateCustomItinerary, translateText } from './services/geminiService';

const ConnectionTroubleshooter: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-red-50 dark:bg-red-900/20 p-4 sm:p-8">
        <div className="w-full max-w-3xl bg-white dark:bg-dark-light rounded-2xl shadow-xl p-6 sm:p-8 border-t-4 border-red-500">
            <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                    <h2 className="text-2xl font-extrabold text-red-700 dark:text-red-300 font-heading">Database Connection Failed</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">The app could not connect to the Firestore database. This is a configuration issue in your cloud project, not an application bug.</p>
                </div>
            </div>
            
            <div className="mt-6 text-sm">
                <p className="font-semibold text-dark dark:text-light mb-2">Your app is trying to connect to this project:</p>
                <pre className="p-3 bg-gray-100 dark:bg-dark rounded-md text-primary font-mono text-center text-base tracking-wider">{firebaseConfig.projectId}</pre>
            </div>

            <div className="mt-6">
                <h3 className="font-bold text-lg text-dark dark:text-light font-heading">Troubleshooting Checklist</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please carefully verify every step in your Google Cloud and Firebase consoles:</p>
                <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                        <span className="font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                        <div>
                            <strong className="text-dark dark:text-light">Correct Project Selected:</strong> Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>. At the top of the page, ensure the project dropdown shows exactly <strong className="font-mono">{firebaseConfig.projectId}</strong>. A common mistake is being in the wrong project.
                        </div>
                    </li>
                     <li className="flex items-start gap-3">
                        <span className="font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                        <div>
                            <strong className="text-dark dark:text-light">Cloud Firestore API Enabled:</strong> In the correct Google Cloud project, search for "Cloud Firestore API" in the API library. The page must show that the API is <strong className="text-green-600">ENABLED</strong>. If it shows a blue "Enable" button, you must click it.
                        </div>
                    </li>
                     <li className="flex items-start gap-3">
                        <span className="font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
                        <div>
                            <strong className="text-dark dark:text-light">Database Created:</strong> Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a> and select the <strong className="font-mono">{firebaseConfig.projectId}</strong> project. Navigate to <strong className="font-mono">Build &gt; Firestore Database</strong>. You must see your data collections (e.g., `guides`). If you see a "Create database" button, you must create one (start in test mode).
                        </div>
                    </li>
                </ul>
            </div>
             <div className="mt-6 text-center">
                 <button onClick={() => window.location.reload()} className="px-6 py-2 font-semibold rounded-lg bg-primary text-white hover:bg-orange-600 transition">
                    I have checked these settings, please try again
                 </button>
            </div>
        </div>
    </div>
);


const AppContent: React.FC = () => {
  const { user: currentUser, loading: authLoading, updateUser } = useAuth();
  const { openCheckout } = useRazorpay();

  // Page state
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  
  // Data state
  const [guides, setGuides] = useState<Guide[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Mock data that isn't migrated yet
  // Keep mock users for now to populate admin/guide views, but the current user's data is live.
  const [allUsers, setAllUsers] = useState<User[]>([mockGuideUser, mockAdminUser, ...otherUsers]);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<DirectMessage[]>(mockMessages);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [wishlist, setWishlist] = useState<PlaceSuggestion[]>([]);

  // Modal and view state
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null);
  const [estimatingItinerary, setEstimatingItinerary] = useState<Itinerary | null>(null);
  const [viewingPlace, setViewingPlace] = useState<PlaceSuggestion | null>(null);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<Verifiable | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [isItineraryBuilderOpen, setIsItineraryBuilderOpen] = useState(false);
  const [itineraryPlaces, setItineraryPlaces] = useState<PlaceSuggestion[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<DetailedItinerary | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch data from Firestore
  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setDataLoading(true);
        setDataError(null);
        try {
          const guidesPromise = db.collection('guides').get();
          const vendorsPromise = db.collection('vendors').get();
          const staysPromise = db.collection('stays').get();
          const bookingsPromise = db.collection('bookings').get();

          const [guidesSnapshot, vendorsSnapshot, staysSnapshot, bookingsSnapshot] = await Promise.all([guidesPromise, vendorsPromise, staysPromise, bookingsPromise]);

          const guidesData = guidesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Guide));
          const vendorsData = vendorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
          const staysData = staysSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stay));
          const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));

          setGuides(guidesData);
          setVendors(vendorsData);
          setStays(staysData);
          setBookings(bookingsData);

        } catch (error: any) {
          console.error("Firestore Error:", error);
          // Set a specific error code to trigger the troubleshooter
          if (error.code === 'unavailable') {
              setDataError('unavailable');
          } else {
             setDataError(`An error occurred while fetching data: ${error.message}`);
          }
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      switch (currentUser.role) {
        case 'guide': setCurrentPage(Page.GuideDashboard); break;
        case 'admin': setCurrentPage(Page.Admin); break;
        default: setCurrentPage(Page.Home); break;
      }
    }
  }, [currentUser]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedGuide(null);
    setCurrentItinerary(null);
    window.scrollTo(0, 0);
  };
  
  const handleBackFromChat = () => {
      handleNavigate(Page.Chat);
      setActiveConversationId(null);
  };

  const handleViewGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    handleNavigate(Page.Profile);
  };

  const handleConfirmBooking = async (bookingDetails: Omit<Booking, 'id' | 'userId'>) => {
    if (!currentUser) return;

    const newBookingData = {
      userId: currentUser.id,
      ...bookingDetails
    };

    try {
      const docRef = await db.collection('bookings').add(newBookingData);
      
      const newBooking: Booking = {
        id: docRef.id,
        ...newBookingData,
      };
      
      setBookings(prev => [...prev, newBooking]);
      
      await updateUser({ points: (currentUser.points || 0) + newBooking.pointsEarned });
      
      setBookingGuide(null);
      alert(`Booking confirmed with ${bookingGuide?.name}!`);

    } catch (error) {
      console.error("Error creating booking:", error);
      alert("There was an issue confirming your booking. Please try again.");
    }
  };

  const handleToggleWishlist = (place: PlaceSuggestion) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.name === place.name && item.destination === place.destination);
      if (exists) {
        return prev.filter(item => item.name !== place.name || item.destination !== place.destination);
      } else {
        return [...prev, place];
      }
    });
  };

  const handleViewPlace = (place: PlaceSuggestion) => {
    setViewingPlace(place);
  };

  const handleOpenItineraryBuilder = (places: PlaceSuggestion[]) => {
      setItineraryPlaces(places);
      setIsItineraryBuilderOpen(true);
  }

  const handleGenerateCustomItinerary = async (days: number) => {
      try {
          const mustVisit = itineraryPlaces.map(p => ({name: p.name, destination: p.destination}));
          const result = await generateCustomItinerary({days, mustVisit});
          setCurrentItinerary(result);
          setIsItineraryBuilderOpen(false);
          handleNavigate(Page.Itinerary);
      } catch (error) {
          console.error("Failed to generate custom itinerary:", error);
          alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
  }

  const handleUnlockGuide = async (guideToUnlock: Guide) => {
      if (!currentUser) return;
      try {
          await openCheckout({
              amount: guideToUnlock.contactUnlockPrice * 100,
              currency: 'INR',
              receipt: `unlock_${guideToUnlock.id}_${Date.now()}`,
              prefill: { name: currentUser.name, email: currentUser.email },
              notes: { userId: currentUser.id, guideId: guideToUnlock.id }
          });
          updateUser({ unlockedGuideIds: [...currentUser.unlockedGuideIds, guideToUnlock.id] });
          alert(`Successfully unlocked contact info for ${guideToUnlock.name}!`);
      } catch (error) {
          console.error("Payment failed or cancelled", error);
          alert(`Payment failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
      }
  }

  const handleStartChat = (guideId: string) => {
      if (!currentUser) return;
      let conversation = conversations.find(c => c.guideId === guideId && c.userId === currentUser.id);
      if (!conversation) {
          conversation = {
              id: `conv-${Date.now()}`,
              userId: currentUser.id,
              guideId: guideId,
              lastMessageTimestamp: Date.now(),
              unreadCount: 0,
          };
          setConversations(prev => [...prev, conversation]);
      }
      setActiveConversationId(conversation.id);
      handleNavigate(Page.Chat);
  }

  const handleSendMessage = (conversationId: string, text: string) => {
      if (!currentUser) return;
      const newMessage: DirectMessage = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId: currentUser.id,
          text,
          timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
  }
  
  const handleTranslateMessage = async (messageId: string) => {
      const message = messages.find(m => m.id === messageId);
      if (!message || message.translatedText) return;
      try {
          const translatedText = await translateText(message.text, 'en');
          setMessages(prev => prev.map(m => m.id === messageId ? {...m, translatedText} : m));
      } catch (error) {
           console.error("Translation failed:", error);
           alert("Could not translate message.");
      }
  }

  const handleSubmitReview = (reviewData: Omit<Review, 'id'|'userId'|'createdAt'>) => {
      if (!currentUser || !reviewingBooking) return;
      const newReview: Review = {
          ...reviewData,
          id: `review-${Date.now()}`,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
      }
      setReviews(prev => [...prev, newReview]);
      setBookings(prev => prev.map(b => b.id === reviewingBooking.id ? {...b, hasBeenReviewed: true} : b));
      setReviewingBooking(null);
  }
  
  const handleRedeemReward = (reward: Reward) => {
      if (!currentUser || currentUser.points < reward.pointsRequired) return;
      updateUser({
          points: currentUser.points - reward.pointsRequired,
          redeemedRewardIds: [...currentUser.redeemedRewardIds, reward.id]
      });
      alert(`Successfully redeemed "${reward.title}"!`);
  }

  const handleApplyToBeGuide = (applicationData: Omit<Guide, 'id' | 'name' | 'avatarUrl' | 'verificationStatus' | 'rating' | 'reviewCount'>) => {
    if (!currentUser) return;
    const newGuide: Guide = {
      ...applicationData,
      id: currentUser.id,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      verificationStatus: 'pending',
      rating: 0,
      reviewCount: 0,
    };
    setGuides(prev => [...prev, newGuide]);
    updateUser({ hasPendingApplication: true, role: 'guide' });
    alert("Application submitted! It will be reviewed by an admin.");
  }

  const handleReviewItem = (item: Verifiable) => {
      setReviewingItem(item);
  }

  const handleUpdateItemStatus = (itemId: string, status: 'verified' | 'rejected') => {
      const updateList = (list: Verifiable[]) => list.map(item => item.id === itemId ? {...item, verificationStatus: status} : item);
      setGuides(prev => updateList(prev) as Guide[]);
      setVendors(prev => updateList(prev) as Vendor[]);
      setStays(prev => updateList(prev) as Stay[]);
      setReviewingItem(null);
  }

  const handleUpdateUserStatus = (userId: string, status: 'active' | 'suspended') => {
      setAllUsers(prev => prev.map(u => u.id === userId ? {...u, status} : u));
  }

  const handleAddItem = async (itemData: any, itemType: 'guide' | 'vendor' | 'stay') => {
    const newItemBase = {
      ...itemData,
      verificationStatus: 'verified',
    };
    const collectionName = itemType === 'guide' ? 'guides' : itemType === 'vendor' ? 'vendors' : 'stays';

    try {
      const docRef = await db.collection(collectionName).add(newItemBase);
      const newItemWithId = { ...newItemBase, id: docRef.id };

      if (itemType === 'guide') setGuides(prev => [...prev, newItemWithId as Guide]);
      if (itemType === 'vendor') setVendors(prev => [...prev, newItemWithId as Vendor]);
      if (itemType === 'stay') setStays(prev => [...prev, newItemWithId as Stay]);
    } catch (error: any) {
      console.error("Error adding document: ", error);
       if (error.code === 'permission-denied') {
        alert("Error: Permission denied. Please check your Firestore security rules to ensure you have write access.");
      } else {
        alert(`An error occurred while adding the new item: ${error.message}`);
      }
    }
  };

  const renderPage = () => {
    if (currentItinerary && currentPage === Page.Itinerary) {
        return <ItineraryPage itinerary={currentItinerary} onBack={() => handleNavigate(Page.Profile)} />;
    }

    switch (currentPage) {
      case Page.Home: return <HomePage guides={guides} onNavigate={handleNavigate} onViewGuide={handleViewGuide} />;
      case Page.Search: return <SearchPage guides={guides} onViewGuide={handleViewGuide} />;
      case Page.TripPlanner: return <TripPlannerPage user={currentUser!} onEstimateCost={setEstimatingItinerary} />;
      case Page.Profile: return <ProfilePage
          user={currentUser!}
          guide={selectedGuide}
          guides={guides}
          bookings={bookings.filter(b => b.userId === currentUser!.id)}
          reviews={reviews}
          allUsers={allUsers}
          wishlist={wishlist}
          onBookGuide={setBookingGuide}
          onNavigate={handleNavigate}
          onToggleWishlist={handleToggleWishlist}
          onViewPlace={setViewingPlace}
          onOpenItineraryBuilder={handleOpenItineraryBuilder}
          onUpdateUser={updateUser}
          onUpgrade={() => setIsUpgradeModalOpen(true)}
          onUnlockGuide={handleUnlockGuide}
          onStartChat={handleStartChat}
          onOpenReviewModal={setReviewingBooking}
          onRedeemReward={handleRedeemReward}
          onApplyToBeGuide={handleApplyToBeGuide}
      />;
      case Page.Explore: return <ExplorePage wishlist={wishlist} onToggleWishlist={handleToggleWishlist} onViewPlace={handleViewPlace} />;
      case Page.Chat: return <ChatPage 
        currentUser={currentUser!} 
        conversations={conversations.filter(c => c.userId === currentUser!.id || c.guideId === currentUser!.id)} 
        messages={messages} 
        guides={guides}
        activeConversationId={activeConversationId}
        onViewConversation={setActiveConversationId}
        onSendMessage={handleSendMessage}
        onTranslateMessage={handleTranslateMessage}
        onBack={handleBackFromChat}
       />;
      case Page.Admin: return <AdminPage 
        guides={guides}
        vendors={vendors}
        stays={stays}
        allUsers={allUsers}
        bookings={bookings}
        currentAdmin={currentUser!}
        onReviewItem={handleReviewItem}
        onUpdateUserStatus={handleUpdateUserStatus}
        onAddItem={handleAddItem}
      />;
      case Page.GuideDashboard: return <GuideDashboardPage 
        guideUser={currentUser!}
        guides={guides}
        bookings={bookings}
        allUsers={allUsers}
        vendors={vendors}
        stays={stays}
       />;
      case Page.Vendors: return <VendorsPage vendors={vendors} />;
      case Page.Stays: return <StaysPage stays={stays} />;
      case Page.About: return <AboutPage />;
      case Page.Contact: return <ContactPage />;
      case Page.PrivacyPolicy: return <PrivacyPolicyPage />;
      default: return <HomePage guides={guides} onNavigate={handleNavigate} onViewGuide={handleViewGuide} />;
    }
  };

  if (authLoading || (currentUser && dataLoading)) {
    return (
      <div className="flex justify-center items-center h-screen bg-light dark:bg-dark animate-fade-in">
        <Spinner className="h-12 w-12 border-4" />
      </div>
    );
  }
  
  if (dataError === 'unavailable') {
    return <ConnectionTroubleshooter />;
  }

  if (dataError) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-red-50 dark:bg-red-900/20 p-8">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">An Error Occurred</h2>
            <pre className="mt-4 p-4 bg-white dark:bg-dark-light rounded-lg text-red-600 dark:text-red-300 whitespace-pre-wrap w-full max-w-2xl">{dataError}</pre>
        </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-light dark:bg-dark text-dark dark:text-light transition-colors duration-300">
      <Header onNavigate={handleNavigate} currentPage={currentPage} user={currentUser} />
      <main key={currentPage} className="flex-grow container mx-auto px-4 py-8 animate-fade-in-slow">
        {renderPage()}
      </main>
      {currentUser.role === 'user' && <Footer onNavigate={handleNavigate} />}
      
      {currentUser.role === 'user' && <Chatbot />}
      {currentUser.role === 'user' && <SOSButton onSOS={() => setIsSOSModalOpen(true)} />}

      {bookingGuide && <BookingModal guide={bookingGuide} onClose={() => setBookingGuide(null)} onBook={handleConfirmBooking} />}
      {estimatingItinerary && <CostEstimationModal itinerary={estimatingItinerary} onClose={() => setEstimatingItinerary(null)} />}
      {viewingPlace && <PlaceDetailsModal
          place={{...viewingPlace, isFavorite: wishlist.some(item => item.name === viewingPlace.name && item.destination === viewingPlace.destination)}} 
          onClose={() => setViewingPlace(null)} 
          onToggleWishlist={handleToggleWishlist}
      />}
      {isSOSModalOpen && <SOSModal emergencyContact={currentUser.emergencyContact} onClose={() => setIsSOSModalOpen(false)} />}
      {isUpgradeModalOpen && <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={() => { updateUser({ isPro: true }); setIsUpgradeModalOpen(false); }} />}
      {reviewingItem && <VerificationModal item={reviewingItem} onClose={() => setReviewingItem(null)} onUpdateStatus={handleUpdateItemStatus} />}
      {reviewingBooking && <ReviewModal booking={reviewingBooking} guides={guides} onClose={() => setReviewingBooking(null)} onSubmit={handleSubmitReview} />}
      {isItineraryBuilderOpen && <ItineraryBuilderModal placesCount={itineraryPlaces.length} onClose={() => setIsItineraryBuilderOpen(false)} onGenerate={handleGenerateCustomItinerary} />}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;