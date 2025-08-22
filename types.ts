export enum Page {
  Home = 'HOME',
  Search = 'SEARCH',
  TripPlanner = 'TRIP_PLANNER',
  Profile = 'PROFILE',
  Explore = 'EXPLORE',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  preferences: string[];
  emergencyContact: {
    name: string;
    phone: string;
  };
  isPro: boolean;
  points: number;
}

export interface Guide {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  specialties: string[];
  bio: string;
  pricePerDay: number;
  isVerified: boolean;
  gallery: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

export interface Itinerary {
  destination: string;
  duration: number;
  itinerary: ItineraryDay[];
}

export enum BookingStatus {
  Upcoming = 'UPCOMING',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export interface Booking {
  id: string;
  userId: string;
  guideId: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  pointsEarned: number;
}

export interface PlaceSuggestion {
  name: string;
  type: 'Attraction' | 'Hidden Gem' | 'Restaurant' | 'Activity';
  description: string;
  destination: string;
  isFavorite?: boolean;
}

export interface PlaceDetails {
    bestTimeToVisit: string;
    weather: string;
    specialties: string[];
    tips: string[];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
}

export interface CostEstimate {
  [category: string]: {
    amount: number;
    description: string;
  };
}

export interface Reward {
    id: string;
    title: string;
    description: string;
    pointsRequired: number;
    icon: React.ReactNode;
}