import { create } from 'zustand';
import { Guide, Vendor, Stay, User, Booking, Review } from '../types';

interface AppDataState {
  guides: Guide[];
  vendors: Vendor[];
  stays: Stay[];
  allUsers: User[];
  bookings: Booking[];
  reviews: Review[];
  setData: (data: Partial<Omit<AppDataState, 'setData'>>) => void;
}

export const useAppStore = create<AppDataState>((set) => ({
  guides: [],
  vendors: [],
  stays: [],
  allUsers: [],
  bookings: [],
  reviews: [],
  setData: (data) => set((state) => ({ ...state, ...data })),
}));
