import { functions } from './firebase';
import { PlaceSuggestion, PlaceDetails, CostEstimate, DetailedItinerary } from '../types';

// Helper to invoke a callable function and handle the response.
const callFunction = async <T>(name: string, data: any): Promise<T> => {
    if (!functions) {
        throw new Error("Firebase Functions are not initialized. AI features are unavailable in mock mode.");
    }
    try {
        const func = functions.httpsCallable(name);
        const result = await func(data);
        return result.data as T;
    } catch (error: unknown) {
        console.error(`Error calling function '${name}':`, error);
        // Provide a more user-friendly error message
        const message = error instanceof Error ? error.message : `An error occurred while calling ${name}.`;
        throw new Error(message);
    }
};

interface CustomItineraryParams {
  days: number;
  mustVisit: { name: string; destination: string }[];
  interests?: string[];
  adults: number;
  children: number;
  seniors: number;
  budgetStyle: 'budget' | 'mid-range' | 'luxury';
}

export const generateCustomItinerary = (params: CustomItineraryParams): Promise<DetailedItinerary> => {
  return callFunction<DetailedItinerary>('generateCustomItinerary', params);
};

export const generatePlaceSuggestions = (destination: string): Promise<PlaceSuggestion[]> => {
  return callFunction<PlaceSuggestion[]>('generatePlaceSuggestions', { destination });
};

export const generatePlaceDetails = (placeName: string, destination: string): Promise<PlaceDetails> => {
  return callFunction<PlaceDetails>('generatePlaceDetails', { placeName, destination });
};

export const estimateTripCost = (itinerary: DetailedItinerary): Promise<CostEstimate> => {
  return callFunction<CostEstimate>('estimateTripCost', { itinerary });
};

export const translateText = (text: string, targetLanguage: string): Promise<string> => {
  return callFunction<string>('translateText', { text, targetLanguage });
};

// FIX: Added missing 'submitBookingRequest' function to call the corresponding Firebase Function.
export const submitBookingRequest = (params: any): Promise<{ success: boolean; bookingId: string; }> => {
    return callFunction('submitBookingRequest', params);
};
