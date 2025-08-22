import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Itinerary, PlaceSuggestion, PlaceDetails, CostEstimate, DetailedItinerary } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY! });

const parseJsonResponse = <T>(jsonText: string): T => {
    const cleanJsonText = jsonText.replace(/^```json\s*|```$/g, '').trim();
    try {
        return JSON.parse(cleanJsonText) as T;
    } catch (error) {
        console.error("Failed to parse JSON response:", cleanJsonText);
        throw new Error("Received an invalid JSON response from the AI.");
    }
};

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    duration: { type: Type.INTEGER },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["day", "title", "activities"]
      }
    }
  },
  required: ["destination", "duration", "itinerary"]
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
    total_estimated_cost: { type: Type.NUMBER, description: "The sum of all estimated_cost fields." },
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


export const generateItinerary = async (
  destination: string,
  days: number,
  interests: string
): Promise<Itinerary> => {
  if (!API_KEY) throw new Error("Gemini API key is not configured.");
  const prompt = `Create a detailed ${days}-day travel itinerary for ${destination}, Maharashtra, focusing on ${interests}.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: itinerarySchema, temperature: 0.7, },
    });
    return parseJsonResponse<Itinerary>(response.text);
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error(`Failed to generate itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

interface CustomItineraryParams {
  days: number;
  mustVisit: { name: string; destination: string }[];
  interests?: string[];
  budget?: number;
}

export const generateCustomItinerary = async (params: CustomItineraryParams): Promise<DetailedItinerary> => {
  if (!API_KEY) throw new Error("Gemini API key is not configured.");
  const primaryDestination = params.mustVisit[0]?.destination || 'Maharashtra';

  // Constructing the USER_PROMPT JSON object
  const userPrompt = {
    origin: primaryDestination,
    days: params.days,
    interests: params.interests || ["heritage", "food", "nature"],
    dates: { start: "2024-08-01", end: `2024-08-${String(params.days).padStart(2, '0')}` },
    budget: { currency: "INR", per_person: params.budget || 15000 },
    transport: ["car", "train"],
    preferred_language: "en",
    constraints: {
      max_drive_hours_per_day: 4,
      must_visit: params.mustVisit.map(p => `${p.name}, ${p.destination}`),
    }
  };

  const prompt = `SYSTEM: You are an expert Maharashtra travel planner. Return JSON only that strictly adheres to the provided schema. The user's request is below. Create a logical and exciting itinerary.
  
  USER_PROMPT:
  ${JSON.stringify(userPrompt, null, 2)}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema: detailedItinerarySchema, temperature: 0.7 },
    });
    return parseJsonResponse<DetailedItinerary>(response.text);
  } catch (error) {
    console.error("Error generating custom itinerary:", error);
    throw new Error(`Failed to generate custom itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generatePlaceSuggestions = async (destination: string): Promise<PlaceSuggestion[]> => {
    if (!API_KEY) throw new Error("Gemini API key is not configured.");
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
    if (!API_KEY) throw new Error("Gemini API key is not configured.");
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

export const estimateTripCost = async (itinerary: Itinerary): Promise<CostEstimate> => {
    if (!API_KEY) throw new Error("Gemini API key is not configured.");
    const itineraryString = itinerary.itinerary.map(day => `Day ${day.day}: ${day.activities.join(', ')}`).join('\n');
    const prompt = `Based on the following ${itinerary.duration}-day itinerary for ${itinerary.destination}, provide a reasonable, mid-range budget estimate for a solo traveler in INR. Break down the cost into four categories: accommodation, food, local transport, and activities.
    
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
    if (!API_KEY) throw new Error("Gemini API key is not configured.");
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