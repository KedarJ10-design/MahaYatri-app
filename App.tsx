import React, { useState, useEffect, useCallback } from 'react';
import { Page, User, Guide, Booking, PlaceSuggestion, DetailedItinerary, Review, Vendor, Stay, Reward, StayBooking, VendorBooking } from './types';
import { mockGuides, mockTouristUser, mockBookings, mockReviews, mockVendors, mockStays, otherUsers, mockAdminUser, mockGuideUser, mockConversations, mockMessages } from './services/mockData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './hooks/useTheme';
import { translateText } from './services/geminiService';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import BookingModal from './components/BookingModal';
import PlaceDetailsModal from './components/PlaceDetailsModal';
import TripPlannerPage from './components/TripPlannerPage';
import ItineraryPage from './components/ItineraryPage';
import Chatbot from './components/Chatbot';
import SOSButton from './components/SOSButton';
import SOSModal from './components/SOSModal';
import UpgradeModal from './components/UpgradeModal';
import { useRazorpay } from './hooks/useRazorpay';
import Spinner from './components/common/Spinner';
import ExplorePage from './components/ExplorePage';
import ItineraryBuilderModal from './components/ItineraryBuilderModal';
import AdminPage from './components/AdminPage';
import GuideDashboardPage from './components/GuideDashboardPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import FAQPage from './components/FAQPage';
import ReviewModal from './components/ReviewModal';
import VendorsPage from './components/VendorsPage';
import StaysPage from './components/StaysPage';
import ChatPage from './components/ChatPage';
import StayBookingModal from './components/StayBookingModal';
import VendorBookingModal from './components/VendorBookingModal';

const AppContent: React.FC = () => {
  const { user, loading: authLoading, updateUser: updateAuthUser } = useAuth();
  
  // App State
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [guides, setGuides] = useState<Guide[]>(mockGuides);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [stays, setStays] = useState<Stay[]>(mockStays);
  const [users, setUsers] = useState<User[]>([mockTouristUser, mockGuideUser, mockAdminUser, ...otherUsers]);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [stayBookings, setStayBookings] = useState<StayBooking[]>([]);
  const [vendorBookings, setVendorBookings] = useState<VendorBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);

  // UI State
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<DetailedItinerary | null>(null);
  const [wishlist, setWishlist] = useState<PlaceSuggestion[]>([]);
  const [placesForItinerary, setPlacesForItinerary] = useState<PlaceSuggestion[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Modal State
  const [modal, setModal] = useState<string | null>(null);
  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [stayToBook, setStayToBook] = useState<Stay | null>(null);
  const [vendorToBook, setVendorToBook] = useState<Vendor | null>(null);

  const { openCheckout } = useRazorpay();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') setCurrentPage(Page.Admin);
      else if (user.role === 'guide') setCurrentPage(Page.GuideDashboard);
      else setCurrentPage(Page.Home);
    }
  }, [user]);

  const handleNavigate = (page: Page) => {
    setActiveItinerary(null);
    setSelectedGuide(null);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleViewGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setCurrentPage(Page.Profile);
  };
  
  const handleViewPlace = (place: PlaceSuggestion) => {
    const placeWithFavorite = { ...place, isFavorite: wishlist.some(item => item.name === place.name && item.destination === place.destination) };
    setSelectedPlace(placeWithFavorite);
    setModal('placeDetails');
  };

  const handleToggleWishlist = (place: PlaceSuggestion) => {
    setWishlist(prev => {
        const isFavorite = prev.some(item => item.name === place.name && item.destination === place.destination);
        if (isFavorite) {
            return prev.filter(item => !(item.name === place.name && item.destination === place.destination));
        } else {
            return [...prev, place];
        }
    });
  };

  const handleBookGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setModal('booking');
  };
  
  const handleBookVendor = (vendor: Vendor) => {
    setVendorToBook(vendor);
    setModal('vendorBooking');
  };

  const handleConfirmBooking = (bookingDetails: Omit<Booking, 'id' | 'userId'>) => {
      if (!user) return;
      const newBooking: Booking = {
          ...bookingDetails,
          id: `booking-${Date.now()}`,
          userId: user.id,
      };
      setBookings(prev => [...prev, newBooking]);
      const updatedUser = { ...user, points: user.points + newBooking.pointsEarned };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      updateAuthUser(updatedUser);
      setModal(null);
  };

   const handleConfirmStayBooking = (bookingDetails: Omit<StayBooking, 'id' | 'userId'>) => {
    if (!user) return;
    const newBooking: StayBooking = {
      ...bookingDetails,
      id: `stay-booking-${Date.now()}`,
      userId: user.id,
    };
    setStayBookings(prev => [...prev, newBooking]);
    setModal(null);
  }

  const handleConfirmVendorBooking = (bookingDetails: Omit<VendorBooking, 'id' | 'userId'>) => {
    if (!user) return;
    const newBooking: VendorBooking = {
      ...bookingDetails,
      id: `vendor-booking-${Date.now()}`,
      userId: user.id,
    };
    setVendorBookings(prev => [...prev, newBooking]);
    setModal(null);
  }

  const handleItineraryGenerated = (itinerary: DetailedItinerary) => {
    setActiveItinerary(itinerary);
    setCurrentPage(Page.Itinerary);
  };

  const handleOpenItineraryBuilder = (places: PlaceSuggestion[]) => {
    setPlacesForItinerary(places);
    setModal('itineraryBuilder');
  };

  const handleGenerateFromWishlist = async (days: number): Promise<void> => {
    if (!user) throw new Error("User not found");
    const itinerary = await new Promise<DetailedItinerary>(resolve => setTimeout(() => {
        const generatedItinerary: DetailedItinerary = {
            summary: `An amazing ${days}-day trip featuring your selected wishlist items.`,
            days: Array.from({ length: days }, (_, i) => ({
                day: i + 1,
                date: `2024-08-${String(i + 1).padStart(2, '0')}`,
                slots: placesForItinerary.map((p, j) => ({
                    timeWindow: `${9 + j * 2}:00 AM - ${11 + j * 2}:00 AM`,
                    place: { name: p.name },
                    activity: `Explore ${p.name}`,
                    notes: `Enjoy your time at this handpicked location.`,
                    estimated_cost: 500,
                    travel: { from: 'Previous Location', to: p.name, distance_km: 5, duration_min: 15 }
                })).slice(0, 3), // Simplified for demo
            })),
            total_estimated_cost: 500 * placesForItinerary.length * days
        };
        resolve(generatedItinerary);
    }, 2000));

    setActiveItinerary(itinerary);
    setModal(null);
    setCurrentPage(Page.Itinerary);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    if (!user) return;
    const newUserState = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(newUserState);
    updateAuthUser(updatedUser);
  };
  
  const handleUnlockGuide = async (guideToUnlock: Guide): Promise<void> => {
    if (!user) throw new Error("You must be logged in to unlock a guide.");
    try {
        await openCheckout({
            amount: guideToUnlock.contactUnlockPrice * 100, // in paise
            currency: 'INR',
            receipt: `unlock-guide-${guideToUnlock.id}-${Date.now()}`,
            notes: { userId: user.id, guideId: guideToUnlock.id },
            prefill: { name: user.name, email: user.email },
            userId: user.id,
            guideId: guideToUnlock.id,
        });
        const updatedUser = { ...user, unlockedGuideIds: [...user.unlockedGuideIds, guideToUnlock.id] };
        handleUpdateUser(updatedUser);
    } catch (error) {
        console.error("Payment failed or was cancelled:", error);
        alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error; // Re-throw to be caught in the component
    }
  };

  const handleStartChat = (guideId: string) => {
    if (!user) return;
    const existingConversation = conversations.find(c => c.guideId === guideId && c.userId === user.id);
    if (existingConversation) {
        setActiveConversationId(existingConversation.id);
    } else {
        const newConversation = {
            id: `conv-${Date.now()}`,
            userId: user.id,
            guideId,
            lastMessageTimestamp: Date.now(),
            unreadCount: 0,
        };
        setConversations(prev => [...prev, newConversation]);
        setActiveConversationId(newConversation.id);
    }
    setCurrentPage(Page.Chat);
  };

  const handleSendMessage = (conversationId: string, text: string) => {
      if(!user) return;
      const newMessage: any = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId: user.id,
          text,
          timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
      // Simulate guide response
      setTimeout(() => {
          const guideId = conversations.find(c => c.id === conversationId)?.guideId;
          if (!guideId) return;
          const responseMessage: any = {
              id: `msg-${Date.now() + 1}`,
              conversationId,
              senderId: guideId,
              text: "Thank you for your message. I will get back to you shortly.",
              timestamp: Date.now() + 1,
          };
          setMessages(prev => [...prev, responseMessage]);
      }, 1500);
  };

  const handleTranslateMessage = async (messageId: string): Promise<void> => {
      const messageToTranslate = messages.find(m => m.id === messageId);
      if (!messageToTranslate || messageToTranslate.translatedText) return;
      try {
          const translation = await translateText(messageToTranslate.text, "English");
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, translatedText: translation } : m));
      } catch (error) {
          console.error("Translation failed:", error);
          alert("Could not translate message.");
      }
  };

  const handleSubmitReview = (reviewData: Omit<Review, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !bookingToReview) return;
    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    setReviews(prev => [newReview, ...prev]);
    setBookings(prev => prev.map(b => b.id === bookingToReview.id ? { ...b, hasBeenReviewed: true } : b));
    setModal(null);
    setBookingToReview(null);
  };

  const handleRedeemReward = (reward: Reward) => {
    if (!user || user.points < reward.pointsRequired) return;
    const updatedUser = { 
        ...user, 
        points: user.points - reward.pointsRequired,
        redeemedRewardIds: [...user.redeemedRewardIds, reward.id]
    };
    handleUpdateUser(updatedUser);
  };
  
  const handleApplyToBeGuide = (applicationData: Omit<Guide, 'id' | 'name' | 'avatarUrl' | 'verificationStatus' | 'rating' | 'reviewCount'>) => {
      if (!user) return;
      const newGuideApplication: Guide = {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          verificationStatus: 'pending',
          rating: 0,
          reviewCount: 0,
          ...applicationData,
      };
      setGuides(prev => [...prev, newGuideApplication]);
      handleUpdateUser({ ...user, hasPendingApplication: true });
  };


  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-light dark:bg-dark">
        <Spinner className="h-12 w-12 border-4" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case Page.Home: return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} guides={guides} />;
      case Page.Search: return <SearchPage onViewGuide={handleViewGuide} guides={guides} />;
      case Page.Profile: return <ProfilePage 
        user={user}
        guide={selectedGuide}
        guides={guides}
        bookings={bookings.filter(b => b.userId === user.id)}
        vendorBookings={vendorBookings.filter(b => b.userId === user.id)}
        vendors={vendors}
        wishlist={wishlist}
        reviews={reviews}
        allUsers={users}
        onBookGuide={handleBookGuide}
        onNavigate={handleNavigate}
        onToggleWishlist={handleToggleWishlist}
        onViewPlace={handleViewPlace}
        onOpenItineraryBuilder={handleOpenItineraryBuilder}
        onUpdateUser={handleUpdateUser}
        onUpgrade={() => setModal('upgrade')}
        onUnlockGuide={handleUnlockGuide}
        onStartChat={handleStartChat}
        onOpenReviewModal={(booking) => { setBookingToReview(booking); setModal('review'); }}
        onRedeemReward={handleRedeemReward}
        onApplyToBeGuide={handleApplyToBeGuide}
      />;
      case Page.TripPlanner: return <TripPlannerPage onItineraryGenerated={handleItineraryGenerated} user={user} />;
      case Page.Itinerary: return activeItinerary ? <ItineraryPage itinerary={activeItinerary} onBack={() => handleNavigate(Page.TripPlanner)} /> : <div>No Itinerary to display.</div>;
      case Page.Explore: return <ExplorePage onViewPlace={handleViewPlace} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />;
      case Page.Admin: return user.role === 'admin' ? <AdminPage users={users} guides={guides} vendors={vendors} stays={stays} onUpdateGuides={setGuides} onUpdateVendors={setVendors} onUpdateStays={setStays} onUpdateUsers={setUsers}/> : <div>Access Denied</div>;
      case Page.GuideDashboard: return user.role === 'guide' ? <GuideDashboardPage guideUser={user} guides={guides} bookings={bookings} allUsers={users} vendors={vendors} stays={stays}/> : <div>Access Denied</div>;
      case Page.About: return <AboutPage />;
      case Page.Contact: return <ContactPage />;
      case Page.PrivacyPolicy: return <PrivacyPolicyPage />;
      case Page.FAQ: return <FAQPage />;
      case Page.Vendors: return <VendorsPage vendors={vendors} onBookVendor={handleBookVendor} />;
      case Page.Stays: return <StaysPage stays={stays} onBookStay={(stay) => { setStayToBook(stay); setModal('stayBooking'); }} />;
      case Page.Chat: return <ChatPage 
        currentUser={user} 
        conversations={conversations.filter(c => c.userId === user.id || guides.some(g => g.id === c.guideId && g.id === user.id))}
        messages={messages}
        guides={guides}
        activeConversationId={activeConversationId}
        onViewConversation={setActiveConversationId}
        onSendMessage={handleSendMessage}
        onTranslateMessage={handleTranslateMessage}
        onBack={() => setActiveConversationId(null)}
      />;
      default: return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} guides={guides} />;
    }
  };

  return (
      <div className="bg-light dark:bg-dark text-slate-800 dark:text-slate-200 min-h-screen font-sans">
        <Header user={user} currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="container mx-auto p-4 md:p-8">
          {renderPage()}
        </main>
        <Footer onNavigate={handleNavigate} />
        
        {modal === 'booking' && selectedGuide && <BookingModal guide={selectedGuide} onClose={() => setModal(null)} onBook={handleConfirmBooking} />}
        {modal === 'stayBooking' && stayToBook && <StayBookingModal stay={stayToBook} onClose={() => setModal(null)} onBook={handleConfirmStayBooking} />}
        {modal === 'vendorBooking' && vendorToBook && <VendorBookingModal vendor={vendorToBook} onClose={() => setModal(null)} onBook={handleConfirmVendorBooking} />}
        {modal === 'placeDetails' && selectedPlace && <PlaceDetailsModal place={selectedPlace} onClose={() => setModal(null)} onToggleWishlist={handleToggleWishlist} />}
        {modal === 'sos' && <SOSModal onClose={() => setModal(null)} emergencyContact={user.emergencyContact} />}
        {modal === 'upgrade' && <UpgradeModal onClose={() => setModal(null)} onUpgrade={() => { handleUpdateUser({ ...user, isPro: true }); setModal(null); }}/>}
        {modal === 'itineraryBuilder' && <ItineraryBuilderModal placesCount={placesForItinerary.length} onClose={() => setModal(null)} onGenerate={handleGenerateFromWishlist} />}
        {modal === 'review' && bookingToReview && <ReviewModal booking={bookingToReview} guides={guides} onClose={() => { setModal(null); setBookingToReview(null); }} onSubmit={handleSubmitReview} />}

        {user.role === 'user' && <Chatbot />}
        {user.role === 'user' && <SOSButton onSOS={() => setModal('sos')} />}
      </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};


export default App;