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
}
