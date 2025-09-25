import { User, Guide, Vendor, Stay, Booking, CostEstimate, Conversation, DirectMessage, Review } from '../types';

// In a production environment, this file would be empty or not exist.
// For this refactor, we are emptying the arrays to simulate the removal of mock data.

export const mockTouristUser: User = {} as User;
export const mockGuideUser: User & Guide = {} as User & Guide;
export const mockAdminUser: User = {} as User;
export const otherUsers: User[] = [];
export const mockUsers: User[] = [];
export const mockGuides: Guide[] = [];
export const mockBookings: Booking[] = [];
export const mockVendors: Vendor[] = [];
export const mockStays: Stay[] = [];
export const mockCostEstimate: CostEstimate = {};
export const mockConversations: Conversation[] = [];
export const mockMessages: DirectMessage[] = [];
export const mockReviews: Review[] = [];
