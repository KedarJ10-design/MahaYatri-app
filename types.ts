import React from 'react';

export enum Page {
    Home = 'HOME',
    Search = 'SEARCH',
    TripPlanner = 'TRIP_PLANNER',
    Itinerary = 'ITINERARY',
    Profile = 'PROFILE',
    Explore = 'EXPLORE',
    Chat = 'CHAT',
    Admin = 'ADMIN',
    GuideDashboard = 'GUIDE_DASHBOARD',
    About = 'ABOUT',
    Contact = 'CONTACT',
    PrivacyPolicy = 'PRIVACY_POLICY',
    Stays = 'STAYS',
    Vendors = 'VENDORS',
    FAQ = 'FAQ',
}

export type UserRole = 'user' | 'guide' | 'admin';

// A convention for Firestore Timestamps serialized to strings.
type FirestoreTimestampString = string;

export interface Verifiable {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  gallery: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
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
  status: 'active' | 'suspended';
  hasPendingApplication: boolean;
  wishlist: PlaceSuggestion[];
  followingGuideIds: string[];
  friends: string[];
  fcmToken?: string;
}

export type AvailabilityStatus = 'unavailable_morning' | 'unavailable_afternoon' | 'unavailable_full';

export interface Guide extends Verifiable {
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
  availability: Record<string, AvailabilityStatus>; // YYYY-MM-DD -> status
  followersCount: number;
  coordinates: {
      lat: number;
      lng: number;
  };
}

export interface Vendor extends Verifiable {
  type: 'Restaurant' | 'Street Food' | 'Cafe';
  cuisine: string[];
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$';
  availability: Record<string, boolean>; // YYYY-MM-DD -> true/false
}

export interface Stay extends Verifiable {
    type: 'Hotel' | 'Homestay' | 'Resort';
    rating: number;
    reviewCount: number;
    pricePerNight: number;
    amenities: string[];
    availability: Record<string, boolean>; // YYYY-MM-DD -> true/false
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
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

// --- Refactored Booking Type ---
// Base interface with common properties for all booking types.
interface BaseBooking {
  id: string;
  userId: string;
  guideId: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  pointsEarned: number;
}

// Discriminated union based on status for improved type safety.
export type PendingBooking = BaseBooking & { status: BookingStatus.Pending; };
export type ConfirmedBooking = BaseBooking & { status: BookingStatus.Confirmed; };
export type CancelledBooking = BaseBooking & { status: BookingStatus.Cancelled; };
export type CompletedBooking = BaseBooking & {
  status: BookingStatus.Completed;
  hasBeenReviewed: boolean; // This is now a required field for completed bookings.
};

// The final Booking type is a union of all possible states.
export type Booking = PendingBooking | ConfirmedBooking | CompletedBooking | CancelledBooking;
// ---------------------------------

export interface StayBooking {
  id: string;
  userId: string;
  stayId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  status: BookingStatus;
}

export interface VendorBooking {
  id: string;
  userId: string;
  vendorId: string;
  date: string;
  time: string;
  guests: number;
  specialRequest?: string;
  status: BookingStatus;
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

// From Final Prompt - Hardened Schemas
export interface Payment {
  id: string;
  orderId: string;
  provider: 'razorpay' | 'google_play' | 'app_store';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed';
  gatewayResponse: Record<string, unknown>; // Safer than 'any'
  createdAt: FirestoreTimestampString;
}

export interface GuideAccess {
  id: string;
  userRef: string; // doc path to user
  guideRef: string; // doc path to guide
  unlockedAt: FirestoreTimestampString;
  expiresAt?: FirestoreTimestampString;
  paymentRef: string; // doc path to payment
}

// New types for Direct Messaging
export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string; // 'user-1' or 'guide-1'
  text: string;
  timestamp: number;
  translatedText?: string;
}

export interface Conversation {
  id: string;
  guideId: string;
  userId: string;
  lastMessageTimestamp: number;
  unreadCount: number;
}

// New type for Reviews
export interface Review {
  id: string;
  guideId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// New Production-Grade Itinerary Type
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

// New types for UI enhancements
export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  type: 'booking' | 'message' | 'system';
  timestamp: number;
}

// New types for Friend System
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export interface FriendRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: FriendRequestStatus;
    createdAt: FirestoreTimestampString;
}

// New type for Q&A System
export interface Question {
    id: string;
    guideId: string;
    userId: string; // ID of the user who asked
    questionText: string;
    answerText?: string; // The guide's answer
    createdAt: FirestoreTimestampString;
    answeredAt?: FirestoreTimestampString;
}