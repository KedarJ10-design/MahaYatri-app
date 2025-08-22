import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import TripPlannerPage from './components/TripPlannerPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import ExplorePage from './components/ExplorePage';
import PlaceDetailsModal from './components/PlaceDetailsModal';
import BookingModal from './components/BookingModal';
import Chatbot from './components/Chatbot';
import CostEstimationModal from './components/CostEstimationModal';
import SOSButton from './components/SOSButton';
import SOSModal from './components/SOSModal';
import UpgradeModal from './components/UpgradeModal';
import { Page, User, Guide, Booking, PlaceSuggestion, Itinerary } from './types';
import { mockUser, mockBookings } from './services/mockData';
import { ThemeProvider } from './hooks/useTheme';

export const AuthContext = React.createContext<{
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null);
  const [viewingPlace, setViewingPlace] = useState<PlaceSuggestion | null>(null);
  const [itineraryForCosting, setItineraryForCosting] = useState<Itinerary | null>(null);
  const [wishlist, setWishlist] = useState<PlaceSuggestion[]>([]);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);


  const login = useCallback((user: User) => {
    setActiveUser(user);
    setCurrentPage(Page.Home);
  }, []);

  const logout = useCallback(() => {
    setActiveUser(null);
    setCurrentPage(Page.Home);
  }, []);

  const authContextValue = useMemo(() => ({ user: activeUser, login, logout }), [activeUser, login, logout]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== Page.Profile) {
        setSelectedGuide(null); 
    }
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
    if (!activeUser) return;
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: activeUser.id,
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
    if (activeUser?.isPro) {
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
    if (activeUser) {
        setActiveUser(prev => prev ? { ...prev, isPro: true } : null);
        setIsUpgradeModalOpen(false);
    }
  }


  const renderPage = () => {
    if (!activeUser) {
      return <LoginPage onLogin={() => login(mockUser)} />;
    }
    switch (currentPage) {
      case Page.Home:
        return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} />;
      case Page.Search:
        return <SearchPage onViewGuide={handleViewGuide} />;
      case Page.TripPlanner:
        return <TripPlannerPage user={activeUser} onEstimateCost={handleEstimateCost} />;
      case Page.Explore:
        return <ExplorePage onViewPlace={handleViewPlace} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />;
      case Page.Profile:
        return <ProfilePage 
                  user={activeUser} 
                  guide={selectedGuide} 
                  bookings={bookings} 
                  onBookGuide={handleBookGuide}
                  onNavigate={handleNavigate}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onViewPlace={handleViewPlace}
                  onUpdateUser={setActiveUser}
                  onUpgrade={() => setIsUpgradeModalOpen(true)}
                />;
      default:
        return <HomePage onNavigate={handleNavigate} onViewGuide={handleViewGuide} />;
    }
  };

  const placeWithFavoriteStatus = useMemo(() => {
    if (!viewingPlace) return null;
    return {
      ...viewingPlace,
      isFavorite: wishlist.some(item => item.name === viewingPlace.name && item.destination === viewingPlace.destination)
    }
  }, [viewingPlace, wishlist]);

  return (
    <ThemeProvider>
      <AuthContext.Provider value={authContextValue}>
        <div className="min-h-screen flex flex-col bg-light dark:bg-dark text-dark dark:text-light transition-colors duration-300">
          {activeUser && <Header onNavigate={handleNavigate} currentPage={currentPage} />}
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
          {activeUser && <Footer />}
          {activeUser && <Chatbot />}
          {activeUser && <SOSButton onSOS={handleSos} />}
          {isSosModalOpen && activeUser && (
            <SOSModal
              onClose={() => setIsSosModalOpen(false)}
              emergencyContact={activeUser.emergencyContact}
            />
          )}
        </div>
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default App;