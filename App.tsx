import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import TripPlannerPage from './components/TripPlannerPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import ExplorePage from './components/ExplorePage';
import ChatPage from './components/ChatPage';
import ItineraryPage from './components/ItineraryPage';
import AdminPage from './components/AdminPage';
import GuideDashboardPage from './components/GuideDashboardPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import PlaceDetailsModal from './components/PlaceDetailsModal';
import BookingModal from './components/BookingModal';
import Chatbot from './components/Chatbot';
import CostEstimationModal from './components/CostEstimationModal';
import SOSButton from './components/SOSButton';
import SOSModal from './components/SOSModal';
import UpgradeModal from './components/UpgradeModal';
import ReviewModal from './components/ReviewModal';
import ItineraryBuilderModal from './components/ItineraryBuilderModal';
import VerificationModal from './components/VerificationModal';
import { Page, User, Guide, Booking, PlaceSuggestion, Itinerary, Conversation, DirectMessage, Review, DetailedItinerary } from './types';
import { mockGuides as initialGuides, mockBookings, mockConversations, mockMessages, mockReviews, otherUsers } from './services/mockData';
import { translateText, generateCustomItinerary } from './services/geminiService';
import { ThemeProvider } from './hooks/useTheme';
import { useRazorpay } from './hooks/useRazorpay';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user: activeUser, loading: authLoading } = useAuth();
  
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [guides, setGuides] = useState<Guide[]>(initialGuides);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null);
  const [viewingPlace, setViewingPlace] = useState<PlaceSuggestion | null>(null);
  const [itineraryForCosting, setItineraryForCosting] = useState<Itinerary | null>(null);
  const [wishlist, setWishlist] = useState<PlaceSuggestion[]>([]);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<DirectMessage[]>(mockMessages);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Review state
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);

  // Itinerary Builder state
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [placesForItinerary, setPlacesForItinerary] = useState<PlaceSuggestion[]>([]);
  const [viewingItinerary, setViewingItinerary] = useState<DetailedItinerary | null>(null);

  // Admin state
  const [reviewingGuide, setReviewingGuide] = useState<Guide | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeUserWithProfile, setActiveUserWithProfile] = useState<User | null>(activeUser);
  
  const { openCheckout } = useRazorpay();

  const allUsers = useMemo(() => activeUserWithProfile ? [activeUserWithProfile, ...otherUsers] : [...otherUsers], [activeUserWithProfile]);

  const placeWithFavoriteStatus = useMemo(() => {
    if (!viewingPlace) return null;
    return {
      ...viewingPlace,
      isFavorite: wishlist.some(item => item.name === viewingPlace.name && item.destination === viewingPlace.destination)
    }
  }, [viewingPlace, wishlist]);

  useEffect(() => {
    setActiveUserWithProfile(activeUser);
  }, [activeUser]);

  useEffect(() => {
    if (activeUser) {
      switch (activeUser.role) {
        case 'admin':
          setCurrentPage(Page.Admin);
          break;
        case 'guide':
          setCurrentPage(Page.GuideDashboard);
          break;
        default:
          setCurrentPage(Page.Home);
      }
    } else {
      setCurrentPage(Page.Home); // Reset to home on logout
    }
  }, [activeUser]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedGuide(null); 
    setActiveConversationId(null);
    setViewingItinerary(null);
  };

  const handleViewGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setCurrentPage(Page.Profile);
  };

  const handleBookGuide = (guide: Guide) => {
    setBookingGuide(guide);
  };

  const handleCloseBookingModal = () => {
    setBookingGuide(null);
  };

  const handleConfirmBooking = (bookingDetails: Omit<Booking, 'id' | 'userId'>) => {
    if (!activeUserWithProfile) return;
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: activeUserWithProfile.id,
      ...bookingDetails,
    };
    setBookings(prev => [newBooking, ...prev]);
    setBookingGuide(null);
  };

  const handleViewPlace = (place: PlaceSuggestion) => {
    setViewingPlace(place);
  }

  const handleClosePlaceModal = () => {
    setViewingPlace(null);
  }

  const handleEstimateCost = (itinerary: Itinerary) => {
    if (activeUserWithProfile?.isPro) {
        setItineraryForCosting(itinerary);
    } else {
        setIsUpgradeModalOpen(true);
    }
  }

  const handleCloseCostModal = () => {
    setItineraryForCosting(null);
  }

  const handleToggleWishlist = (place: PlaceSuggestion) => {
    setWishlist(prev => {
        const isInWishlist = prev.some(item => item.name === place.name && item.destination === place.destination);
        if (isInWishlist) {
            return prev.filter(item => !(item.name === place.name && item.destination === place.destination));
        } else {
            return [...prev, place];
        }
    });
  };

  const handleSos = () => {
    setIsSosModalOpen(true);
  };
  
  const handleUpgradeToPro = () => {
    if (activeUserWithProfile) {
        setActiveUserWithProfile(prev => prev ? { ...prev, isPro: true } : null);
        setIsUpgradeModalOpen(false);
    }
  }
  
  const handleUnlockGuide = async (guide: Guide) => {
    if (!activeUserWithProfile) return;
    try {
      const paymentResponse = await openCheckout({
        amount: guide.contactUnlockPrice * 100,
        currency: 'INR',
        receipt: `receipt_guide_${guide.id}_${Date.now()}`,
        notes: { guideId: guide.id, userId: activeUserWithProfile.id },
        prefill: { name: activeUserWithProfile.name, email: activeUserWithProfile.email }
      });

      console.log('Payment successful, simulating verification...', paymentResponse);
      const isVerified = true;

      if (isVerified) {
        setActiveUserWithProfile(prev => {
            if (!prev) return null;
            if (prev.unlockedGuideIds.includes(guide.id)) return prev;
            return { ...prev, unlockedGuideIds: [...prev.unlockedGuideIds, guide.id] };
        });
      } else {
        throw new Error("Payment verification failed.");
      }
    } catch (error) {
      console.error("Payment failed or was cancelled:", error);
    }
  }

  // --- Chat Handlers ---
  const handleViewConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setCurrentPage(Page.Chat);
  };

  const handleStartChat = (guideId: string) => {
    if (!activeUserWithProfile) return;
    const existingConversation = conversations.find(c => c.guideId === guideId && c.userId === activeUserWithProfile.id);
    if (existingConversation) {
        handleViewConversation(existingConversation.id);
    } else {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            userId: activeUserWithProfile.id,
            guideId,
            lastMessageTimestamp: Date.now(),
            unreadCount: 0,
        };
        setConversations(prev => [newConversation, ...prev]);
        handleViewConversation(newConversation.id);
    }
  }

  const handleSendMessage = (conversationId: string, text: string) => {
    if (!activeUserWithProfile) return;
    const newMessage: DirectMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: activeUserWithProfile.id,
        text,
        timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    // Also update the conversation's last message timestamp for sorting
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, lastMessageTimestamp: newMessage.timestamp } : c));
  };
  
  const handleTranslateMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.translatedText) return;

    try {
        const translated = await translateText(message.text, 'English');
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, translatedText: translated } : m));
    } catch (error) {
        console.error("Translation failed:", error);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, translatedText: "Translation failed." } : m));
    }
  };

  // --- Review Handlers ---
  const handleOpenReviewModal = (booking: Booking) => {
    setReviewingBooking(booking);
  };

  const handleCloseReviewModal = () => {
    setReviewingBooking(null);
  };

  const handleSubmitReview = (review: Omit<Review, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUserWithProfile || !reviewingBooking) return;
    
    const newReview: Review = {
      id: `review-${Date.now()}`,
      userId: activeUserWithProfile.id,
      createdAt: new Date().toISOString(),
      ...review,
    };
    setReviews(prev => [newReview, ...prev]);
    
    // Mark the booking as reviewed
    setBookings(prev => prev.map(b => b.id === reviewingBooking.id ? { ...b, hasBeenReviewed: true } : b));

    setReviewingBooking(null);
  };

  // --- Itinerary Builder Handlers ---
  const handleOpenItineraryBuilder = (places: PlaceSuggestion[]) => {
    setPlacesForItinerary(places);
    setIsBuilderModalOpen(true);
  };

  const handleCloseItineraryBuilder = () => {
    setIsBuilderModalOpen(false);
    setPlacesForItinerary([]);
  };

  const handleGenerateItinerary = async (days: number) => {
    if (placesForItinerary.length === 0) return;
    try {
      const result = await generateCustomItinerary({
        days,
        mustVisit: placesForItinerary.map(p => ({ name: p.name, destination: p.destination })),
      });
      setViewingItinerary(result);
      handleCloseItineraryBuilder();
      setCurrentPage(Page.Itinerary);
    } catch (error) {
      console.error("Failed to generate detailed itinerary", error);
      // Here you would show an error message to the user
      handleCloseItineraryBuilder();
    }
  };

  // --- Admin Handlers ---
  const handleReviewGuide = (guide: Guide) => {
    setReviewingGuide(guide);
  };

  const handleCloseVerificationModal = () => {
    setReviewingGuide(null);
  };

  const handleUpdateGuideStatus = (guideId: string, status: 'verified' | 'rejected') => {
    setGuides(prevGuides => 
      prevGuides.map(g => 
        g.id === guideId ? { ...g, verificationStatus: status } : g
      )
    );
    setReviewingGuide(null);
    setToastMessage(`Guide has been ${status}.`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark-light">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activeUserWithProfile) {
    return <LoginPage />;
  }

  const renderPage = () => {
    if (currentPage === Page.Itinerary && viewingItinerary) {
      return <ItineraryPage itinerary={viewingItinerary} onBack={() => handleNavigate(Page.Profile)} />;
    }

    switch (currentPage) {
      case Page.Home:
        return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} guides={guides} />;
      case Page.Search:
        return <SearchPage onViewGuide={handleViewGuide} guides={guides} />;
      case Page.TripPlanner:
        return <TripPlannerPage user={activeUserWithProfile} onEstimateCost={handleEstimateCost} />;
      case Page.Explore:
        return <ExplorePage onViewPlace={handleViewPlace} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />;
      case Page.Chat:
        return <ChatPage 
                  currentUser={activeUserWithProfile}
                  conversations={conversations}
                  messages={messages}
                  activeConversationId={activeConversationId}
                  onViewConversation={handleViewConversation}
                  onSendMessage={handleSendMessage}
                  onTranslateMessage={handleTranslateMessage}
                  onBack={() => { setActiveConversationId(null); handleNavigate(Page.Chat); }}
                  guides={guides}
                />;
       case Page.Admin:
        return <AdminPage guides={guides} onReviewGuide={handleReviewGuide} />;
       case Page.GuideDashboard:
        return <GuideDashboardPage guideUser={activeUserWithProfile} guides={guides} bookings={bookings} allUsers={allUsers} />;
       case Page.About:
        return <AboutPage />;
       case Page.Contact:
        return <ContactPage />;
       case Page.PrivacyPolicy:
        return <PrivacyPolicyPage />;
      case Page.Profile:
        // This is now exclusively the Tourist Dashboard
        return <ProfilePage 
                  user={activeUserWithProfile} 
                  guide={selectedGuide} 
                  bookings={bookings} 
                  reviews={reviews}
                  allUsers={allUsers}
                  onBookGuide={handleBookGuide}
                  onNavigate={handleNavigate}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onViewPlace={handleViewPlace}
                  onOpenItineraryBuilder={handleOpenItineraryBuilder}
                  onUpdateUser={setActiveUserWithProfile}
                  onUpgrade={() => setIsUpgradeModalOpen(true)}
                  onUnlockGuide={handleUnlockGuide}
                  onStartChat={handleStartChat}
                  onOpenReviewModal={handleOpenReviewModal}
                  guides={guides}
                />;
      default:
        return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} guides={guides} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-dark text-dark dark:text-light transition-colors duration-300">
      {activeUserWithProfile && <Header onNavigate={handleNavigate} currentPage={currentPage} user={activeUserWithProfile} />}
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      {bookingGuide && (
        <BookingModal
          guide={bookingGuide}
          onBook={handleConfirmBooking}
          onClose={handleCloseBookingModal}
        />
      )}
      {placeWithFavoriteStatus && (
        <PlaceDetailsModal 
          place={placeWithFavoriteStatus}
          onClose={handleClosePlaceModal}
          onToggleWishlist={handleToggleWishlist}
        />
      )}
      {itineraryForCosting && (
        <CostEstimationModal
          itinerary={itineraryForCosting}
          onClose={handleCloseCostModal}
        />
      )}
      {isUpgradeModalOpen && (
        <UpgradeModal
          onClose={() => setIsUpgradeModalOpen(false)}
          onUpgrade={handleUpgradeToPro}
        />
      )}
      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          onClose={handleCloseReviewModal}
          onSubmit={handleSubmitReview}
          guides={guides}
        />
      )}
       {reviewingGuide && (
        <VerificationModal
          guide={reviewingGuide}
          onClose={handleCloseVerificationModal}
          onUpdateStatus={handleUpdateGuideStatus}
        />
      )}
      {isBuilderModalOpen && (
        <ItineraryBuilderModal
          placesCount={placesForItinerary.length}
          onClose={handleCloseItineraryBuilder}
          onGenerate={handleGenerateItinerary}
        />
      )}
      {activeUserWithProfile && <Footer onNavigate={handleNavigate} />}
      {activeUserWithProfile && <Chatbot />}
      {activeUserWithProfile && <SOSButton onSOS={handleSos} />}
      {isSosModalOpen && activeUserWithProfile && (
        <SOSModal
          onClose={() => setIsSosModalOpen(false)}
          emergencyContact={activeUserWithProfile.emergencyContact}
        />
      )}
       {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
              {toastMessage}
          </div>
       )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;