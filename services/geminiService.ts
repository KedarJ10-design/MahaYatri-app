import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Itinerary, PlaceSuggestion, PlaceDetails, CostEstimate, DetailedItinerary } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
    }
} else {
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

const parseJsonResponse = <T>(jsonText: string): T => {
    const cleanJsonText = jsonText.replace(/^```json\s*|```$/g, '').trim();
    try {
        return JSON.parse(cleanJsonText) as T;
    } catch (error) {
        console.error("Failed to parse JSON response:", cleanJsonText);
        throw new Error("Received an invalid JSON response from the AI.");
    }
};

const detailedItinerarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief, engaging summary of the entire trip." },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          date: { type: Type.STRING, description: "Date in YYYY-MM-DD format. Assume today is 2024-08-01 for calculations." },
          slots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timeWindow: { type: Type.STRING, description: "e.g., '9:00 AM - 1:00 PM'" },
                place: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                  },
                  required: ["name"],
                },
                activity: { type: Type.STRING, description: "A short description of the activity." },
                notes: { type: Type.STRING, description: "A helpful tip or note for this activity." },
                estimated_cost: { type: Type.NUMBER, description: "Cost in INR for one person." },
                travel: {
                  type: Type.OBJECT,
                  properties: {
                    from: { type: Type.STRING },
                    to: { type: Type.STRING },
                    distance_km: { type: Type.NUMBER },
                    duration_min: { type: Type.NUMBER },
                  },
                  required: ["from", "to", "distance_km", "duration_min"],
                },
              },
              required: ["timeWindow", "place", "activity", "notes", "estimated_cost", "travel"],
            },
          },
        },
        required: ["day", "date", "slots"],
      },
    },
    total_estimated_cost: { type: Type.NUMBER, description: "The sum of all estimated_cost fields for the whole group." },
  },
  required: ["summary", "days", "total_estimated_cost"],
};


const placeSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        places: {
            type: Type.ARRAY,
            description: "A list of 5 to 7 interesting places and activities for a tourist.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the place or activity." },
                    type: { type: Type.STRING, enum: ['Attraction', 'Hidden Gem', 'Restaurant', 'Activity'], description: "The category of the place." },
                    description: { type: Type.STRING, description: "A brief, one-sentence description." }
                },
                required: ["name", "type", "description"]
            }
        }
    },
    required: ["places"]
};

const placeDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        bestTimeToVisit: { type: Type.STRING, description: "A concise summary of the best time to visit (season, month, or time of day)." },
        weather: { type: Type.STRING, description: "A brief description of the typical weather at this location." },
        specialties: { type: Type.ARRAY, items: {type: Type.STRING}, description: "List of 2-3 local specialties (e.g., food, crafts, cultural aspects)." },
        tips: { type: Type.ARRAY, items: {type: Type.STRING}, description: "List of 2-3 essential do's and don'ts for visitors." }
    },
    required: ["bestTimeToVisit", "weather", "specialties", "tips"]
}

const costEstimationSchema = {
    type: Type.OBJECT,
    properties: {
        accommodation: {
            type: Type.OBJECT,
            properties: {
                amount: { type: Type.NUMBER, description: "Estimated cost in INR." },
                description: { type: Type.STRING, description: "Brief explanation of the cost (e.g., budget hotels)." }
            },
            required: ["amount", "description"]
        },
        food: {
            type: Type.OBJECT,
            properties: {
                amount: { type: Type.NUMBER, description: "Estimated cost in INR." },
                description: { type: Type.STRING, description: "Brief explanation (e.g., mix of street food and mid-range restaurants)." }
            },
             required: ["amount", "description"]
        },
        localTransport: {
            type: Type.OBJECT,
            properties: {
                amount: { type: Type.NUMBER, description: "Estimated cost in INR." },
                description: { type: Type.STRING, description: "Brief explanation (e.g., rickshaws, local buses)." }
            },
             required: ["amount", "description"]
        },
        activities: {
            type: Type.OBJECT,
            properties: {
                amount: { type: Type.NUMBER, description: "Estimated cost in INR." },
                description: { type: Type.STRING, description: "Brief explanation (e.g., entry fees, special tours)." }
            },
            required: ["amount", "description"]
        },
    },
    required: ["accommodation", "food", "localTransport", "activities"]
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

export const generateCustomItinerary = async (params: CustomItineraryParams): Promise<DetailedItinerary> => {
  if (!ai) throw new Error("Gemini AI service is not available. Please configure the API Key.");
  const primaryDestination = params.mustVisit[0]?.destination || 'Maharashtra';

  // Constructing the USER_PROMPT JSON object
  const userPrompt = {
    destination: primaryDestination,
    days: params.days,
    travelers: {
        adults: params.adults,
        children: params.children,
        seniors: params.seniors,
    },
    budget_style: params.budgetStyle,
    interests: params.interests || ["heritage", "food", "nature"],
    must_visit_places: params.mustVisit.map(p => `${p.name}, ${p.destination}`),
  };

  const prompt = `SYSTEM: You are an expert Maharashtra travel planner. Your response must be in JSON format and strictly adhere to the provided schema. Create a logical, exciting, and practical itinerary based on the user's request.

  Key Instructions:
  1.  **Group Composition**: If children are present, include child-friendly activities. If seniors are present, prioritize accessible locations and a relaxed pace.
  2.  **Budget**: The chosen 'budget_style' must significantly influence the type of activities, dining, and travel suggestions. 'budget' should focus on free activities and street food, while 'luxury' should include fine dining and premium experiences.
  3.  **Costing**: The 'estimated_cost' for each slot should be PER PERSON. The final 'total_estimated_cost' MUST be the grand total for the ENTIRE group (all adults, children, and seniors combined).
  4.  **Travel**: Ensure travel between slots is logical and account for travel time. 'from' should be the previous slot's place name, and 'to' should be the current slot's place name.
  
  USER_PROMPT:
  ${JSON.stringify(userPrompt, null, 2)}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: detailedItinerarySchema, temperature: 0.8 },
    });
    return parseJsonResponse<DetailedItinerary>(response.text);
  } catch (error) {
    console.error("Error generating custom itinerary:", error);
    throw new Error(`Failed to generate custom itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generatePlaceSuggestions = async (destination: string): Promise<PlaceSuggestion[]> => {
    if (!ai) throw new Error("Gemini AI service is not available. Please configure the API Key.");
    const prompt = `Provide a diverse list of tourist suggestions for ${destination}, Maharashtra. Include famous attractions, a hidden gem, a local restaurant, and a unique activity.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: placeSuggestionsSchema, temperature: 0.8 }
        });
        const result = parseJsonResponse<{ places: Omit<PlaceSuggestion, 'destination'>[] }>(response.text);
        return result.places.map(place => ({ ...place, destination }));
    } catch (error) {
        console.error("Error generating place suggestions:", error);
        throw new Error(`Failed to get suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const generatePlaceDetails = async (placeName: string, destination: string): Promise<PlaceDetails> => {
    if (!ai) throw new Error("Gemini AI service is not available. Please configure the API Key.");
    const prompt = `For a tourist visiting "${placeName}" in ${destination}, Maharashtra, provide essential details.`;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: placeDetailsSchema, temperature: 0.5 }
        });
        return parseJsonResponse<PlaceDetails>(response.text);
    } catch (error) {
        console.error("Error generating place details:", error);
        throw new Error(`Failed to get place details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const estimateTripCost = async (itinerary: DetailedItinerary): Promise<CostEstimate> => {
    if (!ai) throw new Error("Gemini AI service is not available. Please configure the API Key.");
    
    // Create a simplified text representation of the itinerary for the prompt
    const itineraryString = itinerary.days.map(day => 
        `Day ${day.day}: ${day.slots.map(slot => slot.place.name).join(' -> ')}`
    ).join('\n');

    const prompt = `Based on the following itinerary for ${itinerary.days.length} days, provide a reasonable, mid-range budget estimate for a solo traveler in INR. Break down the cost into four categories: accommodation, food, local transport, and activities.
    
    Itinerary:
    ${itineraryString}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: costEstimationSchema, temperature: 0.5 }
        });
        return parseJsonResponse<CostEstimate>(response.text);
    } catch (error) {
        console.error("Error estimating trip cost:", error);
        throw new Error(`Failed to estimate cost: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (!ai) throw new Error("Gemini AI service is not available. Please configure the API Key.");
    const prompt = `Translate the following text to ${targetLanguage}. Return only the translated text, without any introductory phrases, explanations, or quotation marks. The output should be the pure translation. Text to translate: "${text}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error translating text:", error);
        throw new Error(`Failed to translate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// Export the 'ai' instance for use in components like the chatbot
export { ai };