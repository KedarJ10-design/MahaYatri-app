
import create from 'zustand';
import { Page, DetailedItinerary, ToastMessage, Guide, Stay, Vendor, Booking, Verifiable } from '../types';
import { persist, createJSONStorage } from 'zustand/middleware';

type ModalPayload =
  | { type: 'booking', guide: Guide }
  | { type: 'stayBooking', stay: Stay }
  | { type: 'vendorBooking', vendor: Vendor }
  | { type: 'review', booking: Booking }
  | { type: 'guideDetails', guide: Guide }
  | { type: 'verification', item: Verifiable }
  | { type: 'addItem', itemType: 'guide' | 'vendor' | 'stay' }
  | { type: 'costEstimation', itinerary: DetailedItinerary }
  | { type: 'liveTrip', itinerary: DetailedItinerary }
  | { type: 'sos' }
  | { type: 'upgrade' }
  | { type: 'guideApplication' }
  | { type: 'confirmation', title: string, message: React.ReactNode, onConfirm: () => void, confirmButtonText?: string, confirmButtonVariant?: 'primary' | 'danger' }
  | null;

interface AppState {
  currentPage: Page;
  itinerary: DetailedItinerary | null;
  toasts: ToastMessage[];
  modal: ModalPayload;
  navigate: (page: Page) => void;
  setItinerary: (itinerary: DetailedItinerary | null) => void;
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: number) => void;
  openModal: (payload: ModalPayload) => void;
  closeModal: () => void;
}

// Zustand store for global app state
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: Page.Home,
      itinerary: null,
      toasts: [],
      modal: null,
      navigate: (page) => {
        // When navigating, reset itinerary unless going to the itinerary page itself
        const shouldKeepItinerary = page === Page.Itinerary || page === Page.TripPlanner;
        set({ 
          currentPage: page, 
          itinerary: shouldKeepItinerary ? get().itinerary : null 
        });
      },
      setItinerary: (itinerary) => set({ 
        itinerary, 
        currentPage: itinerary ? Page.Itinerary : Page.TripPlanner 
      }),
      addToast: (message, type) => {
        const newToast: ToastMessage = { id: Date.now(), message, type };
        set(state => ({ toasts: [...state.toasts, newToast] }));
      },
      removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
      openModal: (payload) => set({ modal: payload }),
      closeModal: () => set({ modal: null }),
    }),
    {
      name: 'mahayatri-app-storage',
      storage: createJSONStorage(() => localStorage), // Persist state in localStorage
      partialize: (state) => ({ 
        // Only persist the itinerary, as other state is transient
        itinerary: state.itinerary 
      }),
    }
  )
);
