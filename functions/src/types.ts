// This file can be used to share types between your client and functions
// To use it, you might need to adjust your build process, for example by
// placing it in a shared directory. For this project, we'll just duplicate
// the necessary types for simplicity.

export type UserRole = 'user' | 'guide' | 'admin';

export enum BookingStatus {
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

// FIX: Added missing type definitions for Booking, DirectMessage, Conversation, and added fcmToken to the User type.
export interface Booking {
    id?: string;
    userId: string;
    guideId: string;
    startDate: string;
    endDate: string;
    guests: number;
    totalPrice: number;
    status: BookingStatus;
    pointsEarned: number;
    hasBeenReviewed?: boolean;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  guideId: string;
  userId: string;
  lastMessageTimestamp: number;
  unreadCount: number;
}

export interface PlaceSuggestion {
  name: string;
  type: 'Attraction' | 'Hidden Gem' | 'Restaurant' | 'Activity';
  description: string;
  destination: string;
  isFavorite?: boolean;
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
  unlockedGuideIds: string[];
  role: UserRole;
  redeemedRewardIds: string[];
  status?: 'active' | 'suspended';
  hasPendingApplication?: boolean;
  wishlist?: PlaceSuggestion[];
  followingGuideIds?: string[];
  friends?: string[];
  fcmToken?: string;
}

export interface Guide {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  gallery: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: number;
  reviewCount: number;
  languages: string[];
  specialties: string[];
  bio: string;
  pricePerDay: number;
  contactInfo: {
    phone: string;
    email: string;
  };
  contactUnlockPrice: number;
  availability?: Record<string, boolean>;
  followersCount?: number;
}

export type FriendRequestStatus = "pending" | "accepted" | "declined";

export interface Question {
    id: string;
    guideId: string;
    userId: string;
    questionText: string;
    answerText?: string;
    createdAt: any;
    answeredAt?: any;
}

export interface TravelInfo {
    from: string;
    to: string;
    distance_km: number;
    duration_min: number;
}

export interface ItinerarySlot {
    timeWindow: string;
    place: {
        id?: string;
        name: string;
        coords?: string;
    };
    activity: string;
    notes: string;
    estimated_cost: number;
    travel: TravelInfo;
}

export interface ItineraryDayDetailed {
    day: number;
    date: string;
    slots: ItinerarySlot[];
    suggested_guide_ids?: string[];
}

export interface DetailedItinerary {
    summary: string;
    days: ItineraryDayDetailed[];
    total_estimated_cost: number;
    mapImageUrl?: string; // For offline map caching
}

export interface PlaceDetails {
    bestTimeToVisit: string;
    weather: string;
    specialties: string[];
    tips: string[];
}

export interface CostEstimate {
  [category: string]: {
    amount: number;
    description: string;
  };
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}