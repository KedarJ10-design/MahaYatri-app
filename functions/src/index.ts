import * as admin from "firebase-admin";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import * as cors from "cors";
import * as functions from "firebase-functions/v1";
import { GoogleGenAI, Type } from "@google/genai";
import { Guide, User, UserRole, BookingStatus, FriendRequestStatus, DetailedItinerary, PlaceSuggestion, PlaceDetails, CostEstimate, ChatMessage, Booking, DirectMessage, Conversation } from "./types";
// FIX: Import Response type from express to correctly type the response object in onRequest functions.
import { Response } from "express";

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
// FIX: Explicitly type `req` and `res` to ensure compatibility with cors middleware and express response methods.
export const createRazorpayOrder = functions.https.onRequest((req: functions.https.Request, res: Response) => {
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

// FIX: Explicitly type `req` and `res` to ensure compatibility with cors middleware and express response methods.
export const verifyRazorpayPayment = functions.https.onRequest((req: functions.https.Request, res: Response) => {
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
        return response.text;
    } catch (error) {
        functions.logger.error("Gemini API call failed:", error);
        throw new functions.https.HttpsError("internal", "The AI service failed to respond.");
    }
};

export const chatWithAI = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const uid = ensureAuthenticated(context);
    try {
        const { history, message } = data as { history: ChatMessage[], message: string };
        if (!message) {
            throw new functions.https.HttpsError("invalid-argument", "A new message is required.");
        }
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User not found.");
        }
        const user = userDoc.data() as User;
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