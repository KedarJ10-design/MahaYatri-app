

import * as admin from "firebase-admin";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import * as cors from "cors";
import * as functions from "firebase-functions/v1";
import { GoogleGenAI, Type } from "@google/genai";
import { Guide, User, UserRole, BookingStatus, FriendRequestStatus, DetailedItinerary, PlaceSuggestion, PlaceDetails, CostEstimate, ChatMessage, Booking, DirectMessage, Conversation } from "./types";

const corsHandler = cors({origin: true});

admin.initializeApp();
const db = admin.firestore();

// --- RAZORPAY CONFIG ---
const RAZORPAY_KEY_ID = functions.config().razorpay?.key_id;
const RAZORPAY_KEY_SECRET = functions.config().razorpay?.key_secret;
let razorpayInstance: Razorpay | undefined;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("Razorpay Key ID or Key Secret is not set in Firebase config.");
} else {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
}


// --- GEMINI CONFIG ---
const GEMINI_API_KEY = functions.config().gemini?.api_key;
let ai: GoogleGenAI | undefined;
if (!GEMINI_API_KEY) {
    console.error("Gemini API Key is not set in Firebase config. Run: firebase functions:config:set gemini.api_key=\"YOUR_KEY\"");
} else {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}


// ============================================================================
// PAYMENT FUNCTIONS
// ============================================================================
export const createRazorpayOrder = functions.https.onRequest((req: any, res: any) => {
  corsHandler(req, res, async () => {
    if (!razorpayInstance) {
        functions.logger.error("Razorpay is not configured.");
        return res.status(500).json({ error: "Payment service is not configured." });
    }
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method Not Allowed"});
    }
    try {
      const {amount, currency, receipt, notes} = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0 || !currency || !receipt) {
        return res.status(400).json({error: "Invalid or missing parameters."});
      }
      const options = { amount, currency, receipt, notes };
      functions.logger.info("Creating Razorpay order with options:", options);
      const order = await razorpayInstance.orders.create(options);
      return res.status(200).json(order);
    } catch (error) {
      functions.logger.error("Error creating Razorpay order:", error);
      if (error instanceof Error && "statusCode" in error) {
        return res.status((error as any).statusCode).json({error: (error as any).error});
      }
      return res.status(500).json({error: "Internal Server Error"});
    }
  });
});

export const verifyRazorpayPayment = functions.https.onRequest((req: any, res: any) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method Not Allowed"});
    }
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, guideId } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !guideId) {
        return res.status(400).json({error: "Missing required payment verification fields."});
      }
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body).digest("hex");
      if (expectedSignature !== razorpay_signature) {
        functions.logger.warn("Invalid Razorpay signature.", {orderId: razorpay_order_id});
        return res.status(400).json({verified: false, error: "Payment verification failed: Invalid signature."});
      }
      functions.logger.info(`Payment verified for user ${userId} unlocking guide ${guideId}.`);
      try {
        const userRef = db.collection("users").doc(userId);
        await userRef.update({ unlockedGuideIds: admin.firestore.FieldValue.arrayUnion(guideId) });
        await db.collection("payments").add({ userId, guideId, orderId: razorpay_order_id, paymentId: razorpay_payment_id, status: "captured", createdAt: admin.firestore.FieldValue.serverTimestamp() });
        return res.status(200).json({verified: true, message: "Payment verified and guide unlocked."});
      } catch (dbError) {
        functions.logger.error("CRITICAL: Firestore update failed after successful payment verification.", { userId, guideId, orderId: razorpay_order_id, error: dbError });
        return res.status(500).json({ verified: true, error: "Could not update your account. Please contact support with your order ID.", orderId: razorpay_order_id });
      }
    } catch (error) {
      functions.logger.error("Unhandled error in verifyRazorpayPayment:", error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  });
});

// ============================================================================
// CALLABLE FUNCTIONS
// ============================================================================
const ensureAuthenticated = (context: functions.https.CallableContext) => {
  if (!context.auth) { throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated."); }
  return context.auth.uid;
};

export const submitBookingRequest = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const userId = ensureAuthenticated(context);
    try {
        const { guideId, startDate, endDate, guests, totalPrice } = data;
        if (!guideId || !startDate || !endDate || !guests || !totalPrice) {
            throw new functions.https.HttpsError("invalid-argument", "Missing required booking fields.");
        }
        const newBooking = { userId, guideId, startDate, endDate, guests: Number(guests), totalPrice: Number(totalPrice), pointsEarned: Math.floor(Number(totalPrice) / 10), status: "PENDING" as BookingStatus, createdAt: admin.firestore.FieldValue.serverTimestamp() };
        const bookingRef = await db.collection("bookings").add(newBooking);
        functions.logger.info(`New booking created: ${bookingRef.id} by user ${userId}`);
        return { success: true, bookingId: bookingRef.id };
    } catch (error) {
        functions.logger.error("Error in submitBookingRequest:", { userId, data, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "An error occurred while submitting the booking request.");
    }
});

export const applyToBeGuide = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const userId = ensureAuthenticated(context);
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User profile not found.");
        }
        const { name, avatarUrl } = userDoc.data() as { name: string, avatarUrl: string };
        const newGuideApplication = { id: userId, name, avatarUrl, location: data.location, languages: data.languages, specialties: data.specialties, bio: data.bio, pricePerDay: Number(data.pricePerDay), gallery: data.gallery, contactInfo: data.contactInfo, contactUnlockPrice: Number(data.contactUnlockPrice), verificationStatus: "pending" as const, rating: 0, reviewCount: 0, followersCount: 0, coordinates: { lat: 0, lng: 0 }, availability: {} };
        const batch = db.batch();
        batch.set(db.collection("guides").doc(userId), newGuideApplication);
        batch.update(db.collection("users").doc(userId), { hasPendingApplication: true });
        await batch.commit();
        functions.logger.info(`New guide application submitted for user ${userId}`);
        return { success: true };
    } catch(error) {
        functions.logger.error("Error in applyToBeGuide:", { userId, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Failed to submit guide application.");
    }
});

export const sendMessage = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const userId = ensureAuthenticated(context);
    const { conversationId, text } = data;
    try {
        if (!conversationId || !text) {
            throw new functions.https.HttpsError("invalid-argument", "A conversationId and text are required.");
        }
        const conversationRef = db.collection("conversations").doc(conversationId);
        const messageRef = db.collection("messages").doc();
        await db.runTransaction(async (transaction) => {
            const conversationDoc = await transaction.get(conversationRef);
            if (!conversationDoc.exists) {
                throw new functions.https.HttpsError("not-found", "The specified conversation does not exist.");
            }
            const conversationData = conversationDoc.data()!;
            if (userId !== conversationData.userId && userId !== conversationData.guideId) {
                throw new functions.https.HttpsError("permission-denied", "You are not a participant in this conversation.");
            }
            const timestamp = Date.now();
            transaction.set(messageRef, { conversationId, senderId: userId, text, timestamp });
            transaction.update(conversationRef, { lastMessageTimestamp: timestamp });
        });
        return { success: true, messageId: messageRef.id };
    } catch(error) {
        functions.logger.error("Error in sendMessage:", { userId, conversationId, error });
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Could not send message.");
    }
});


// ============================================================================
// AI FUNCTIONS
// ============================================================================

const callAI = async (prompt: string, schema?: any) => {
    if (!ai) {
        throw new functions.https.HttpsError("failed-precondition", "AI service is not configured.");
    }
    try {
        const config: any = { temperature: 0.7 };
        if (schema) {
            config.responseMimeType = "application/json";
            config.responseSchema = schema;
        }
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt, config });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        functions.logger.error("Gemini API call failed:", error);
        throw new functions.https.HttpsError("internal", "The AI service failed to respond.");
    }
};

export const generateCustomItinerary = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    ensureAuthenticated(context);
    const { days, mustVisit, interests, adults, children, seniors, budgetStyle } = data;
    const prompt = `Create a detailed ${days}-day travel itinerary for a trip to ${mustVisit[0].destination}, Maharashtra. The group consists of ${adults} adults, ${children} children, and ${seniors} seniors. Their interests include ${interests.join(", ")}. The budget is ${budgetStyle}. If provided, they must visit ${mustVisit[0].name}. For each day, provide a date (starting from tomorrow), and a series of time-slotted activities. For each slot, include the place name, a brief activity description, any relevant notes, an estimated cost in INR, and the travel details (from, to, distance in km, duration in minutes) from the previous slot. Also provide a brief overall summary and a total estimated cost for the trip. The response must be valid JSON.`;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            days: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.INTEGER },
                        date: { type: Type.STRING, description: "Format: YYYY-MM-DD" },
                        slots: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    timeWindow: { type: Type.STRING },
                                    place: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } },
                                    activity: { type: Type.STRING },
                                    notes: { type: Type.STRING },
                                    estimated_cost: { type: Type.NUMBER },
                                    travel: { type: Type.OBJECT, properties: { from: { type: Type.STRING }, to: { type: Type.STRING }, distance_km: { type: Type.NUMBER }, duration_min: { type: Type.INTEGER } } }
                                }
                            }
                        }
                    }
                }
            },
            total_estimated_cost: { type: Type.NUMBER }
        }
    };
    return callAI(prompt, schema);
});

export const generatePlaceSuggestions = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    ensureAuthenticated(context);
    const { destination } = data;
    const prompt = `Suggest 6 interesting and diverse place suggestions for a tourist visiting ${destination}, Maharashtra. Include a mix of Attractions, Hidden Gems, Restaurants, and Activities. For each, provide a name, type, a brief, compelling description, and the destination. The response must be valid JSON.`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['Attraction', 'Hidden Gem', 'Restaurant', 'Activity'] },
                description: { type: Type.STRING },
                destination: { type: Type.STRING }
            }
        }
    };
    return callAI(prompt, schema);
});

export const generatePlaceDetails = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    ensureAuthenticated(context);
    const { placeName, destination } = data;
    const prompt = `Provide detailed information for a tourist about "${placeName}" in ${destination}, Maharashtra. Include the best time to visit, a brief weather overview, a list of local specialties to try there, and a few practical tips for visitors. The response must be valid JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            bestTimeToVisit: { type: Type.STRING },
            weather: { type: Type.STRING },
            specialties: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    };
    return callAI(prompt, schema);
});

export const estimateTripCost = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    ensureAuthenticated(context);
    const { itinerary } = data as { itinerary: DetailedItinerary };
    const prompt = `Based on the following itinerary, provide a cost breakdown for a solo traveler with a mid-range budget. Categorize the costs into 'accommodation', 'food', 'localTransport', and 'activities'. For each category, provide a total amount in INR and a brief description of what it covers. Itinerary: ${JSON.stringify(itinerary)}. The response must be valid JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            accommodation: { type: Type.OBJECT, properties: { amount: { type: Type.NUMBER }, description: { type: Type.STRING } } },
            food: { type: Type.OBJECT, properties: { amount: { type: Type.NUMBER }, description: { type: Type.STRING } } },
            localTransport: { type: Type.OBJECT, properties: { amount: { type: Type.NUMBER }, description: { type: Type.STRING } } },
            activities: { type: Type.OBJECT, properties: { amount: { type: Type.NUMBER }, description: { type: Type.STRING } } }
        }
    };
    return callAI(prompt, schema);
});

export const translateText = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    ensureAuthenticated(context);
    const { text, targetLanguage } = data;
    const prompt = `Translate the following text to ${targetLanguage}: "${text}"`;
    if (!ai) {
        throw new functions.https.HttpsError("failed-precondition", "AI service is not configured.");
    }
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    return response.text;
});


export const chatWithAI = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const uid = ensureAuthenticated(context);
    try {
        const { history, message, user } = data as { history: ChatMessage[], message: string, user: User };
        if (!message) {
            throw new functions.https.HttpsError("invalid-argument", "A new message is required.");
        }
        const preferences = user.preferences.length > 0 ? `Their travel interests include ${user.preferences.join(", ")}.` : "";
        const systemInstruction = `You are a personal travel assistant for ${user.name}. ${preferences} Use this information to give them tailored advice for exploring Maharashtra, India. Be friendly, concise, and engaging. Use markdown for formatting.`;
        const contents = history.map((msg) => ({ role: msg.sender === "user" ? "user" : "model", parts: [{ text: msg.text }] }));
        contents.push({ role: "user", parts: [{ text: message }] });
        
        if (!ai) {
             throw new functions.https.HttpsError("failed-precondition", "AI service is not configured.");
        }
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents, config: { systemInstruction }});
        return response.text;
    } catch (error) {
        functions.logger.error("Error in chatWithAI function:", error);
        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError("internal", "Failed to get chat response.");
    }
});

// ============================================================================
// SOCIAL & Q&A FUNCTIONS
// ============================================================================
export const postQuestion = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { guideId, questionText } = data;
    if (!guideId || !questionText) {
        throw new functions.https.HttpsError("invalid-argument", "Missing guideId or questionText.");
    }
    const question = { guideId, userId, questionText, createdAt: admin.firestore.FieldValue.serverTimestamp() };
    await db.collection("questions").add(question);
    return { success: true };
});

export const postAnswer = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { questionId, answerText } = data;
    if (!questionId || !answerText) {
        throw new functions.https.HttpsError("invalid-argument", "Missing questionId or answerText.");
    }
    const questionRef = db.collection("questions").doc(questionId);
    const questionDoc = await questionRef.get();
    if (!questionDoc.exists || questionDoc.data()?.guideId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "You cannot answer this question.");
    }
    await questionRef.update({ answerText, answeredAt: admin.firestore.FieldValue.serverTimestamp() });
    return { success: true };
});

export const sendFriendRequest = functions.https.onCall(async (data, context) => {
    const fromUserId = ensureAuthenticated(context);
    const { toUserId } = data;
    if (!toUserId) throw new functions.https.HttpsError("invalid-argument", "toUserId is required.");
    if (fromUserId === toUserId) throw new functions.https.HttpsError("invalid-argument", "You cannot send a friend request to yourself.");

    const request = { fromUserId, toUserId, status: "pending", createdAt: admin.firestore.FieldValue.serverTimestamp() };
    await db.collection("friendRequests").add(request);
    return { success: true };
});

export const respondToFriendRequest = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { requestId, response } = data as { requestId: string, response: 'accepted' | 'declined' };
    if (!requestId || !response) throw new functions.https.HttpsError("invalid-argument", "requestId and response are required.");

    const requestRef = db.collection("friendRequests").doc(requestId);
    const requestDoc = await requestRef.get();
    if (!requestDoc.exists || requestDoc.data()?.toUserId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "This request is not for you.");
    }
    
    if (response === 'accepted') {
        const fromUserId = requestDoc.data()?.fromUserId;
        const fromUserRef = db.collection("users").doc(fromUserId);
        const toUserRef = db.collection("users").doc(userId);
        
        const batch = db.batch();
        batch.update(fromUserRef, { friends: admin.firestore.FieldValue.arrayUnion(userId) });
        batch.update(toUserRef, { friends: admin.firestore.FieldValue.arrayUnion(fromUserId) });
        batch.update(requestRef, { status: "accepted" });
        await batch.commit();
    } else {
        await requestRef.update({ status: "declined" });
    }
    return { success: true };
});

export const removeFriend = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { friendId } = data;
    if (!friendId) throw new functions.https.HttpsError("invalid-argument", "friendId is required.");

    const userRef = db.collection("users").doc(userId);
    const friendRef = db.collection("users").doc(friendId);

    const batch = db.batch();
    batch.update(userRef, { friends: admin.firestore.FieldValue.arrayRemove(friendId) });
    batch.update(friendRef, { friends: admin.firestore.FieldValue.arrayRemove(userId) });
    await batch.commit();

    return { success: true };
});


// ============================================================================
// PUSH NOTIFICATION TRIGGERS
// ============================================================================

export const sendPushNotification = functions.firestore.document("users/{userId}/notifications/{notificationId}").onCreate(async (snap, context) => {
    const { userId } = context.params;
    const notification = snap.data();

    if (!notification) {
        functions.logger.error("Notification document data was empty.", { userId, notificationId: snap.id });
        return;
    }
    
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            functions.logger.warn(`User document ${userId} not found for notification.`);
            return;
        }
        
        const token = userDoc.data()?.fcmToken;
        if (token) {
            const payload: admin.messaging.Message = {
                token,
                notification: {
                    title: notification.title || "New Notification",
                    body: notification.body || "You have a new update from MahaYatri.",
                },
                webpush: {
                    notification: {
                        icon: "https://mahayatri.app/pwa-192x192.png",
                    },
                    fcmOptions: {
                        link: notification.link || "/",
                    },
                },
            };
            await admin.messaging().send(payload);
            functions.logger.info(`Notification sent to user ${userId}`);
        } else {
            functions.logger.info(`User ${userId} does not have an FCM token.`);
        }
    } catch (error) {
        functions.logger.error(`Failed to send notification to user ${userId}`, { error, notificationId: snap.id });
        if ((error as any).code === "messaging/registration-token-not-registered") {
            await db.collection("users").doc(userId).update({ fcmToken: admin.firestore.FieldValue.delete() });
        }
    }
});


export const onNewBookingNotification = functions.firestore.document("bookings/{bookingId}").onCreate(async (snap) => {
    const booking = snap.data() as Booking;
    try {
        const touristDoc = await db.collection("users").doc(booking.userId).get();
        const touristName = touristDoc.data()?.name || "A tourist";
        
        const notificationData = {
            title: "New Booking Request!",
            body: `${touristName} has requested a tour from ${booking.startDate} to ${booking.endDate}.`,
            link: "/dashboard",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(booking.guideId).collection("notifications").add(notificationData);
    } catch (error) {
        functions.logger.error("Error creating new booking notification document:", { bookingId: snap.id, error });
    }
});

export const onNewMessageNotification = functions.firestore.document("messages/{messageId}").onCreate(async (snap) => {
    const message = snap.data() as DirectMessage;
    try {
        const conversationDoc = await db.collection("conversations").doc(message.conversationId).get();
        if (!conversationDoc.exists) return;
        
        const conversation = conversationDoc.data() as Conversation;
        const senderDoc = await db.collection("users").doc(message.senderId).get();
        const senderName = senderDoc.data()?.name || "Someone";
        const recipientId = conversation.userId === message.senderId ? conversation.guideId : conversation.userId;

        const notificationData = {
            title: `New message from ${senderName}`,
            body: message.text,
            link: "/chat",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("users").doc(recipientId).collection("notifications").add(notificationData);
    } catch (error) {
        functions.logger.error("Error creating new message notification document:", { messageId: snap.id, error });
    }
});