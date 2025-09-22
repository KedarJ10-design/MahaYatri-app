
import React, { useState, useEffect, useCallback } from 'react';
import { Page, User, Guide, Booking, PlaceSuggestion, DetailedItinerary, Review, Vendor, Stay, Reward, StayBooking, VendorBooking, UserRole, ToastMessage, Notification, Conversation, DirectMessage, BookingStatus } from './types';
import { mockGuides, mockTouristUser, mockBookings, mockReviews, mockVendors, mockStays, otherUsers, mockAdminUser, mockGuideUser, mockConversations, mockMessages, mockNotifications } from './services/mockData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './hooks/useTheme';
import { translateText } from './services/geminiService';
import { db, firebaseInitializationError } from './services/firebase';
import firebase from 'firebase/compat/app';

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
import CostEstimationModal from './components/CostEstimationModal';
import Toast from './components/common/Toast';
import LiveTripModal from './components/LiveTripModal';


const AppContent: React.FC = () => {
  const { user, loading: authLoading, updateUser: updateAuthUser } = useAuth();
  
  // App State - Global / Public Data
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Needed for Admin panel and review lookups
  const [reviews, setReviews] = useState<Review[]>([]); // Needed for guide profiles
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // UI State
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<DetailedItinerary | null>(null);
  const [placesForItinerary, setPlacesForItinerary] = useState<PlaceSuggestion[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [initialExploreDestination, setInitialExploreDestination] = useState<string>('');


  // Modal State
  const [modal, setModal] = useState<string | null>(null);
  const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);
  const [stayToBook, setStayToBook] = useState<Stay | null>(null);
  const [vendorToBook, setVendorToBook] = useState<Vendor | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);


  const { openCheckout } = useRazorpay();
  
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // --- GLOBAL DATA LOADING ---
  useEffect(() => {
    const loadMockData = () => {
        console.warn("Firebase not configured. The app will run in offline/mock mode.");
        setGuides(mockGuides);
        setVendors(mockVendors);
        setStays(mockStays);
        setUsers([mockTouristUser, mockGuideUser, mockAdminUser, ...otherUsers]);
        setReviews(mockReviews);
        setNotifications(mockNotifications);
        setIsDataLoaded(true);
    }

    if (!db || firebaseInitializationError) {
        if (!authLoading) loadMockData();
        return;
    }

    const allUnsubscribes: (() => void)[] = [];

    // Collections that are public or needed across many components (e.g., for lookups)
    const collections: { [key: string]: React.Dispatch<React.SetStateAction<any[]>> } = {
        'guides': setGuides, 'vendors': setVendors, 'stays': setStays, 'users': setUsers,
        'reviews': setReviews, 'notifications': setNotifications,
    };

    let collectionsLoaded = 0;
    const totalCollections = Object.keys(collections).length;

    Object.entries(collections).forEach(([colName, setter]) => {
        const unsubscribe = db.collection(colName).onSnapshot(
            (snapshot) => {
                // If firebase is connected, the live database is the source of truth.
                // An empty collection means there is no data, which is the correct state.
                setter(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                collectionsLoaded++;
                if (collectionsLoaded >= totalCollections) {
                    setIsDataLoaded(true);
                }
            },
            (error) => {
                console.error(`Error fetching ${colName}:`, error);
                addToast(`Could not load live ${colName} data.`, 'error');
                // Do not fall back to mock data on a per-collection basis to avoid data inconsistency.
                // The app will now correctly show an empty state for the failed collection.
                collectionsLoaded++;
                if (collectionsLoaded >= totalCollections) {
                    setIsDataLoaded(true);
                }
            }
        );
        allUnsubscribes.push(unsubscribe);
    });

    return () => {
        allUnsubscribes.forEach(unsub => unsub());
    };
  }, [addToast, authLoading]);


  useEffect(() => {
    if (user && isDataLoaded) {
      if (user.role === 'admin' && currentPage !== Page.Admin) {
        setCurrentPage(Page.Admin);
      } else if (user.role === 'guide' && currentPage !== Page.GuideDashboard) {
        setCurrentPage(Page.GuideDashboard);
      } else if (user.role === 'user' && (currentPage === Page.Admin || currentPage === Page.GuideDashboard)) {
        setCurrentPage(Page.Home);
      }
    }
  }, [user, isDataLoaded, currentPage]);

  const handleNavigate = (page: Page) => {
    setActiveItinerary(null);
    setSelectedGuideId(null);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleViewGuide = (guide: Guide) => {
    setSelectedGuideId(guide.id);
    setCurrentPage(Page.Profile);
  };
  
  const handleViewPlace = (place: PlaceSuggestion) => {
    const isFavorite = user?.wishlist?.some(item => item.name === place.name && item.destination === place.destination) ?? false;
    const placeWithFavorite = { ...place, isFavorite };
    setSelectedPlace(placeWithFavorite);
    setModal('placeDetails');
  };
  
  const handleExploreDestination = (destination: string) => {
    setInitialExploreDestination(destination);
    handleNavigate(Page.Explore);
  };

  const handleInitialDestinationConsumed = () => {
    setInitialExploreDestination('');
  };


  const handleToggleWishlist = async (place: PlaceSuggestion) => {
    if (!user) return;
    
    const currentWishlist = user.wishlist || [];
    const isFavorite = currentWishlist.some(item => item.name === place.name && item.destination === place.destination);
    
    const newWishlist = isFavorite
      ? currentWishlist.filter(item => !(item.name === place.name && item.destination === place.destination))
      : [...currentWishlist, { name: place.name, type: place.type, description: place.description, destination: place.destination }];

    await updateAuthUser({ wishlist: newWishlist });
    addToast(isFavorite ? 'Removed from wishlist' : 'Added to wishlist!', 'info');
  };

  const handleBookGuide = (guide: Guide) => {
    setSelectedGuideId(guide.id);
    setModal('booking');
  };
  
  const handleBookVendor = (vendor: Vendor) => {
    setVendorToBook(vendor);
    setModal('vendorBooking');
  };
  
  const handleConfirmBooking = async (bookingDetails: Omit<Booking, 'id' | 'userId'>) => {
      if (!user) return;
      const newBookingData: Omit<Booking, 'id'> = { ...bookingDetails, userId: user.id };
      
      if (db) {
          try {
              await db.collection('bookings').add(newBookingData);
              // Points are now awarded upon completion, not booking.
              setModal(null);
              addToast('Tour request sent! The guide will confirm shortly.', 'success');
          } catch(e) { 
            console.error(e); 
            addToast('Booking failed. Please try again.', 'error'); 
          }
      }
  };

   const handleConfirmStayBooking = async (bookingDetails: Omit<StayBooking, 'id' | 'userId'>) => {
    if (!user) return;
    const newBookingData: Omit<StayBooking, 'id'> = { ...bookingDetails, userId: user.id };

    if(db) {
        try {
            await db.collection('stayBookings').add(newBookingData);
            setModal(null);
            addToast('Stay successfully booked!', 'success');
        } catch(e) { 
          console.error(e); 
          addToast('Booking failed. Please try again.', 'error'); 
        }
    }
  }

  const handleConfirmVendorBooking = async (bookingDetails: Omit<VendorBooking, 'id' | 'userId'>) => {
    if (!user) return;
    const newBookingData: Omit<VendorBooking, 'id'> = { ...bookingDetails, userId: user.id };
    
    if(db) {
        try {
            await db.collection('vendorBookings').add(newBookingData);
            setModal(null);
            addToast('Reservation confirmed!', 'success');
        } catch(e) { 
            console.error(e); 
            addToast('Booking failed. Please try again.', 'error');
        }
    }
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
    setActiveItinerary({
        summary: `An amazing ${days}-day trip featuring your wishlist items.`,
        days: [], total_estimated_cost: 0 
    });
    setModal(null);
    setCurrentPage(Page.Itinerary);
  };
  
  const handleUnlockGuide = async (guideToUnlock: Guide): Promise<void> => {
    if (!user) throw new Error("You must be logged in to unlock a guide.");
    try {
        await openCheckout({
            amount: guideToUnlock.contactUnlockPrice * 100,
            currency: 'INR',
            receipt: `unlock-guide-${guideToUnlock.id}-${Date.now()}`,
            notes: { userId: user.id, guideId: guideToUnlock.id },
            prefill: { name: user.name, email: user.email },
            userId: user.id,
            guideId: guideToUnlock.id,
        });
        addToast(`Successfully unlocked contact for ${guideToUnlock.name}!`, 'success');
    } catch (error) {
        console.error("Payment failed or was cancelled:", error);
        addToast(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        throw error;
    }
  };

  const handleStartChat = async (guideId: string, currentConversations: Conversation[]) => {
    if (!user) return;
    const existingConversation = currentConversations.find(c => c.guideId === guideId && c.userId === user.id);
    if (existingConversation) {
        setActiveConversationId(existingConversation.id);
    } else {
        const newConversationData: Omit<Conversation, 'id'> = {
            userId: user.id,
            guideId,
            lastMessageTimestamp: Date.now(),
            unreadCount: 0,
        };
        if(db) {
            try {
                const docRef = await db.collection('conversations').add(newConversationData);
                setActiveConversationId(docRef.id);
            } catch(e) { 
                console.error(e); 
                addToast('Could not start chat.', 'error'); 
                return; 
            }
        }
    }
    setCurrentPage(Page.Chat);
  };

  const handleSendMessage = async (conversationId: string, text: string) => {
      if(!user) return;
      const newMessageData: Omit<DirectMessage, 'id'> = {
          conversationId,
          senderId: user.id,
          text,
          timestamp: Date.now(),
      };
      if(db) {
        const batch = db.batch();
        const messageRef = db.collection('messages').doc();
        batch.set(messageRef, newMessageData);

        const conversationRef = db.collection('conversations').doc(conversationId);
        batch.update(conversationRef, { lastMessageTimestamp: Date.now() });

        try {
            await batch.commit();
        } catch(e) { 
            console.error(e); 
            addToast('Could not send message.', 'error'); 
            throw e;
        }
      }
  };

  const handleSubmitReview = async (reviewData: Omit<Review, 'id' | 'userId' | 'createdAt'>) => {
    if (!user || !bookingToReview) return;
    const newReviewData: Omit<Review, 'id'> = {
      ...reviewData,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    if(db) {
        try {
            await db.collection('reviews').add(newReviewData);
            await db.collection('bookings').doc(bookingToReview.id).update({ hasBeenReviewed: true });
            setModal(null);
            setBookingToReview(null);
            addToast('Thank you for your review!', 'success');
        } catch(e) { 
            console.error(e); 
            addToast('Review submission failed.', 'error'); 
        }
    }
  };
  
  const handleApplyToBeGuide = async (applicationData: Omit<Guide, 'id' | 'name' | 'avatarUrl' | 'verificationStatus' | 'rating' | 'reviewCount'>) => {
      if (!user) return Promise.reject();
      const newGuideApplication: Guide = {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          verificationStatus: 'pending',
          rating: 0,
          reviewCount: 0,
          ...applicationData,
      };
      if(db) {
          try {
              await db.collection('guides').doc(user.id).set(newGuideApplication);
              await updateAuthUser({ hasPendingApplication: true });
              addToast('Your application has been submitted!', 'success');
          } catch(e) { 
              console.error(e); 
              addToast('Application submission failed.', 'error'); 
              throw e;
          }
      }
      return Promise.resolve();
  };
  
  const handleDeleteItem = (itemId: string, itemType: 'user' | 'guide' | 'vendor' | 'stay') => {
    if(db) {
      try {
        db.collection(`${itemType}s`).doc(itemId).delete();
        addToast(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted.`, 'info');
      } catch(e) { 
          console.error(e); 
          addToast(`Failed to delete ${itemType}.`, 'error'); 
      }
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    if (user?.id === userId) {
        addToast("You cannot change your own role.", 'error'); return;
    }
    if(db) {
      try {
        await db.collection('users').doc(userId).update({ role: newRole });
        addToast("User role updated successfully.", 'success');
      } catch(e) { 
          console.error(e); 
          addToast('Failed to update user role.', 'error'); 
      }
    }
  };
  
  const handleUpdateGuideAvailability = async (guideId: string, newAvailability: Record<string, boolean>) => {
    if(db) {
      try {
        await db.collection('guides').doc(guideId).update({ availability: newAvailability });
        addToast("Availability updated.", 'success');
      } catch(e) {
          console.error(e);
          addToast('Failed to update availability.', 'error');
          throw e;
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
      if (db) {
          try {
              await db.collection('bookings').doc(bookingId).update({ status });
              addToast('Booking status updated!', 'success');
          } catch (e) {
              console.error(e);
              addToast('Failed to update booking status.', 'error');
              throw e;
          }
      }
  };


  if (authLoading || !isDataLoaded) {
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
      case Page.Home: return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} guides={guides} onExploreDestination={handleExploreDestination} />;
      case Page.Search: return <SearchPage onViewGuide={handleViewGuide} guides={guides} />;
      case Page.Profile: return <ProfilePage 
        key={selectedGuideId}
        user={user}
        guideId={selectedGuideId}
        onBookGuide={handleBookGuide}
        onNavigate={handleNavigate}
        onToggleWishlist={handleToggleWishlist}
        onViewPlace={handleViewPlace}
        onOpenItineraryBuilder={handleOpenItineraryBuilder}
        onUpgrade={() => setModal('upgrade')}
        onUnlockGuide={handleUnlockGuide}
        onStartChat={handleStartChat}
        onOpenReviewModal={(booking) => { setBookingToReview(booking); setModal('review'); }}
        onApplyToBeGuide={handleApplyToBeGuide}
        addToast={addToast}
      />;
      case Page.TripPlanner: return <TripPlannerPage onItineraryGenerated={handleItineraryGenerated} user={user} />;
      case Page.Itinerary: return activeItinerary ? <ItineraryPage user={user} itinerary={activeItinerary} onBack={() => handleNavigate(Page.TripPlanner)} onEstimateCost={() => setModal('costEstimation')} onUpgrade={() => setModal('upgrade')} onStartTrip={() => setIsTripModalOpen(true)} /> : <div>No Itinerary to display.</div>;
      case Page.Explore: return <ExplorePage onViewPlace={handleViewPlace} wishlist={user.wishlist || []} onToggleWishlist={handleToggleWishlist} initialDestination={initialExploreDestination} onInitialDestinationConsumed={handleInitialDestinationConsumed} />;
      case Page.Admin: return user.role === 'admin' ? <AdminPage users={users} guides={guides} vendors={vendors} stays={stays} onDeleteItem={handleDeleteItem} onUpdateUserRole={handleUpdateUserRole} addToast={addToast} /> : <div>Access Denied</div>;
      case Page.GuideDashboard: return user.role === 'guide' ? <GuideDashboardPage guideUser={user} allUsers={users} onUpdateAvailability={handleUpdateGuideAvailability} onUpdateBookingStatus={handleUpdateBookingStatus} addToast={addToast} /> : <div>Access Denied</div>;
      case Page.About: return <AboutPage />;
      case Page.Contact: return <ContactPage />;
      case Page.PrivacyPolicy: return <PrivacyPolicyPage />;
      case Page.FAQ: return <FAQPage />;
      case Page.Vendors: return <VendorsPage vendors={vendors} onBookVendor={handleBookVendor} />;
      case Page.Stays: return <StaysPage stays={stays} onBookStay={(stay) => { setStayToBook(stay); setModal('stayBooking'); }} />;
      case Page.Chat: return <ChatPage 
        currentUser={user}
        guides={guides}
        activeConversationId={activeConversationId}
        onViewConversation={setActiveConversationId}
        onSendMessage={handleSendMessage}
        onBack={() => setActiveConversationId(null)}
        addToast={addToast}
      />;
      default: return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} guides={guides} onExploreDestination={handleExploreDestination} />;
    }
  };
  
  const selectedGuide = guides.find(g => g.id === selectedGuideId);

  return (
      <div className="bg-light dark:bg-dark text-slate-800 dark:text-slate-200 min-h-screen font-sans">
        <Header user={user} currentPage={currentPage} onNavigate={handleNavigate} notifications={notifications} onUpdateNotifications={setNotifications} />
        <main className="container mx-auto p-4 md:p-8">
          {renderPage()}
        </main>
        <Footer onNavigate={handleNavigate} />
        
        {/* Modals */}
        {modal === 'booking' && selectedGuide && <BookingModal guide={selectedGuide} onClose={() => setModal(null)} onBook={handleConfirmBooking} addToast={addToast} />}
        {modal === 'stayBooking' && stayToBook && <StayBookingModal stay={stayToBook} onClose={() => setModal(null)} onBook={handleConfirmStayBooking} addToast={addToast} />}
        {modal === 'vendorBooking' && vendorToBook && <VendorBookingModal vendor={vendorToBook} onClose={() => setModal(null)} onBook={handleConfirmVendorBooking} addToast={addToast} />}
        {modal === 'placeDetails' && selectedPlace && <PlaceDetailsModal place={selectedPlace} onClose={() => setModal(null)} onToggleWishlist={handleToggleWishlist} />}
        {modal === 'sos' && <SOSModal onClose={() => setModal(null)} emergencyContact={user.emergencyContact} />}
        {modal === 'upgrade' && <UpgradeModal onClose={() => setModal(null)} onUpgrade={() => { updateAuthUser({ isPro: true }); setModal(null); addToast('Upgrade successful! Welcome to Pro.', 'success'); }}/>}
        {modal === 'itineraryBuilder' && <ItineraryBuilderModal placesCount={placesForItinerary.length} onClose={() => setModal(null)} onGenerate={handleGenerateFromWishlist} />}
        {modal === 'review' && bookingToReview && <ReviewModal booking={bookingToReview} guides={guides} onClose={() => { setModal(null); setBookingToReview(null); }} onSubmit={handleSubmitReview} />}
        {modal === 'costEstimation' && activeItinerary && <CostEstimationModal itinerary={activeItinerary} onClose={() => setModal(null)} />}
        {isTripModalOpen && activeItinerary && <LiveTripModal itinerary={activeItinerary} onClose={() => setIsTripModalOpen(false)} />}


        {/* Floating Action Buttons */}
        {user.role === 'user' && <Chatbot />}
        {user.role === 'user' && <SOSButton onSOS={() => setModal('sos')} />}

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-[100] space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
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
