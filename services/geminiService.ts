import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Itinerary, PlaceSuggestion, PlaceDetails, CostEstimate } from '../types';

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