import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import * as cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import { Guide, User, UserRole, BookingStatus, FriendRequestStatus, DetailedItinerary, PlaceSuggestion, PlaceDetails, CostEstimate, ChatMessage } from "./types";

const corsHandler = cors({origin: true});

admin.initializeApp();
const db = admin.firestore();

// --- RAZORPAY CONFIG ---
const RAZORPAY_KEY_ID = functions.config().razorpay.key_id;
const RAZORPAY_KEY_SECRET = functions.config().razorpay.key_secret;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("Razorpay Key ID or Key Secret is not set in Firebase config.");
}
const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// --- GEMINI CONFIG ---
const GEMINI_API_KEY = functions.config().gemini.api_key;
if (!GEMINI_API_KEY) {
    console.error("Gemini API Key is not set in Firebase config. Run: firebase functions:config:set gemini.api_key=\"YOUR_KEY\"");
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


// ============================================================================
// PAYMENT FUNCTIONS (EXISTING)
// ============================================================================

export const createRazorpayOrder = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // ... (existing code remains unchanged)
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method Not Allowed"});
    }

    try {
      const {amount, currency, receipt, notes} = req.body;

      // --- Input Validation ---
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({error: "Invalid or missing 'amount'."});
      }
      if (!currency || typeof currency !== "string") {
        return res.status(400).json({error: "Invalid or missing 'currency'."});
      }
      if (!receipt || typeof receipt !== "string") {
        return res.status(400).json({error: "Invalid or missing 'receipt'."});
      }

      const options = {
        amount, // amount in the smallest currency unit (e.g., paise)
        currency,
        receipt,
        notes,
      };

      functions.logger.info("Creating Razorpay order with options:", options);
      const order = await razorpayInstance.orders.create(options);
      return res.status(200).json(order);
    } catch (error) {
      functions.logger.error("Error creating Razorpay order:", error);
      // Check if it's a Razorpay-specific error
      if (error instanceof Error && "statusCode" in error) {
        return res.status((error as any).statusCode).json({error: (error as any).error});
      }
      return res.status(500).json({error: "Internal Server Error"});
    }
  });
});

export const verifyRazorpayPayment = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // ... (existing code remains unchanged)
    if (req.method !== "POST") {
      return res.status(405).json({error: "Method Not Allowed"});
    }

    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
        guideId,
      } = req.body;

      // --- Input Validation ---
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !guideId) {
        return res.status(400).json({error: "Missing required payment verification fields."});
      }

      // --- Signature Verification ---
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        functions.logger.warn("Invalid Razorpay signature.", {orderId: razorpay_order_id});
        return res.status(400).json({verified: false, error: "Payment verification failed: Invalid signature."});
      }

      // --- Database Update ---
      // Signature is valid, payment is authentic.
      functions.logger.info(`Payment verified for user ${userId} unlocking guide ${guideId}.`);
      try {
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          unlockedGuideIds: admin.firestore.FieldValue.arrayUnion(guideId),
        });

        // Optional: Create a payment record for auditing
        await db.collection("payments").add({
           userId,
           guideId,
           orderId: razorpay_order_id,
           paymentId: razorpay_payment_id,
           status: "captured",
           createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).json({verified: true, message: "Payment verified and guide unlocked."});
      } catch (dbError) {
        // --- Critical Failure ---
        // This is a serious issue: payment was captured but we failed to grant access.
        functions.logger.error("CRITICAL: Firestore update failed after successful payment verification.", {
            userId,
            guideId,
            orderId: razorpay_order_id,
            error: dbError,
        });
        return res.status(500).json({
            verified: true, // The payment itself is valid
            error: "Could not update your account. Please contact support with your order ID.",
            orderId: razorpay_order_id,
        });
      }
    } catch (error) {
      functions.logger.error("Unhandled error in verifyRazorpayPayment:", error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  });
});


// ============================================================================
// CALLABLE FUNCTIONS (EXISTING)
// ============================================================================
const ensureAuthenticated = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  return context.auth.uid;
};

const ensureAdmin = async (uid: string) => {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Must be an admin to perform this action."
        );
    }
};

// ... All existing callable functions like submitBookingRequest, submitReview, etc. remain unchanged.
export const submitBookingRequest = functions.https.onCall(async (data, context) => {
  const userId = ensureAuthenticated(context);
  const { guideId, startDate, endDate, guests, totalPrice } = data;

  if (!guideId || !startDate || !endDate || !guests || !totalPrice) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required booking fields.");
  }

  const newBooking = {
      userId,
      guideId,
      startDate,
      endDate,
      guests: Number(guests),
      totalPrice: Number(totalPrice),
      pointsEarned: Math.floor(Number(totalPrice) / 10),
      status: "PENDING" as BookingStatus,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const bookingRef = await db.collection("bookings").add(newBooking);
  return { success: true, bookingId: bookingRef.id };
});

export const submitStayBooking = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { stayId, checkInDate, checkOutDate, guests, rooms, totalPrice } = data;

    if (!stayId || !checkInDate || !checkOutDate || !guests || !rooms || !totalPrice) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required stay booking fields.");
    }
    const newBooking = {
        userId,
        stayId,
        checkInDate,
        checkOutDate,
        guests: Number(guests),
        rooms: Number(rooms),
        totalPrice: Number(totalPrice),
        status: "CONFIRMED" as BookingStatus,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const bookingRef = await db.collection("stayBookings").add(newBooking);
    return { success: true, bookingId: bookingRef.id };
});

export const submitVendorBooking = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { vendorId, date, time, guests, specialRequest } = data;

    if (!vendorId || !date || !time || !guests) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required vendor booking fields.");
    }

    const newBooking = {
        userId,
        vendorId,
        date,
        time,
        guests: Number(guests),
        specialRequest: specialRequest || "",
        status: "CONFIRMED" as BookingStatus,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const bookingRef = await db.collection("vendorBookings").add(newBooking);
    return { success: true, bookingId: bookingRef.id };
});

export const submitReview = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { rating, comment, guideId, bookingId } = data;

    if (!rating || !guideId || !bookingId) {
        throw new functions.https.HttpsError("invalid-argument", "Rating, guideId, and bookingId are required.");
    }
    if (rating < 1 || rating > 5) {
        throw new functions.https.HttpsError("invalid-argument", "Rating must be between 1 and 5.");
    }

    const newReview = {
        userId,
        guideId,
        bookingId,
        rating: Number(rating),
        comment: comment || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const batch = db.batch();
    const reviewRef = db.collection("reviews").doc();
    batch.set(reviewRef, newReview);
    const bookingRef = db.collection("bookings").doc(bookingId);
    batch.update(bookingRef, { hasBeenReviewed: true });

    await batch.commit();
    return { success: true, reviewId: reviewRef.id };
});

export const applyToBeGuide = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
    }
    const { name, avatarUrl } = userDoc.data() as { name: string, avatarUrl: string };

    const newGuideApplication: Guide = {
        id: userId,
        name,
        avatarUrl,
        location: data.location,
        languages: data.languages,
        specialties: data.specialties,
        bio: data.bio,
        pricePerDay: Number(data.pricePerDay),
        gallery: data.gallery,
        contactInfo: data.contactInfo,
        contactUnlockPrice: Number(data.contactUnlockPrice),
        verificationStatus: "pending",
        rating: 0,
        reviewCount: 0,
        followersCount: 0,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - This will be added when the guide is created.
        coordinates: { lat: 0, lng: 0 },
    };

    const batch = db.batch();
    const guideRef = db.collection("guides").doc(userId);
    batch.set(guideRef, newGuideApplication);

    const userRef = db.collection("users").doc(userId);
    batch.update(userRef, { hasPendingApplication: true });

    await batch.commit();
    return { success: true };
});

export const toggleFollowGuide = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { guideId } = data;

    if (!guideId) {
        throw new functions.https.HttpsError("invalid-argument", "guideId is required.");
    }
    if (userId === guideId) {
        throw new functions.https.HttpsError("invalid-argument", "Users cannot follow themselves.");
    }

    const userRef = db.collection("users").doc(userId);
    const guideRef = db.collection("guides").doc(guideId);

    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const guideDoc = await transaction.get(guideRef);

        if (!userDoc.exists || !guideDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User or Guide not found.");
        }

        const followingList: string[] = userDoc.data()?.followingGuideIds || [];
        const isFollowing = followingList.includes(guideId);

        if (isFollowing) {
            // Unfollow
            transaction.update(userRef, { followingGuideIds: admin.firestore.FieldValue.arrayRemove(guideId) });
            transaction.update(guideRef, { followersCount: admin.firestore.FieldValue.increment(-1) });
            return { status: "unfollowed" };
        } else {
            // Follow
            transaction.update(userRef, { followingGuideIds: admin.firestore.FieldValue.arrayUnion(guideId) });
            transaction.update(guideRef, { followersCount: admin.firestore.FieldValue.increment(1) });
            return { status: "followed" };
        }
    });
});

export const updateGuideAvailability = functions.https.onCall(async (data, context) => {
    const guideId = ensureAuthenticated(context);
    const { newAvailability } = data;

    if (guideId !== data.guideId) {
         throw new functions.https.HttpsError("permission-denied", "You can only update your own availability.");
    }

    if (!newAvailability) {
        throw new functions.https.HttpsError("invalid-argument", "newAvailability is required.");
    }

    await db.collection("guides").doc(guideId).update({ availability: newAvailability });
    return { success: true };
});

export const updateBookingStatus = functions.https.onCall(async (data, context) => {
    const guideId = ensureAuthenticated(context);
    const { bookingId, status } = data;

    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Booking not found.");
    }
    if (bookingDoc.data()?.guideId !== guideId) {
        throw new functions.https.HttpsError("permission-denied", "You can only update status for your own bookings.");
    }
    if (!Object.values(BookingStatus).includes(status)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid status provided.");
    }
    await bookingRef.update({ status });
    return { success: true };
});

export const sendFriendRequest = functions.https.onCall(async (data, context) => {
    const fromUserId = ensureAuthenticated(context);
    const { toUserId } = data;

    if (!toUserId) {
        throw new functions.https.HttpsError("invalid-argument", "toUserId is required.");
    }
    if (fromUserId === toUserId) {
        throw new functions.https.HttpsError("invalid-argument", "You cannot send a friend request to yourself.");
    }

    // Check if a request already exists
    const existingReqQuery1 = db.collection("friendRequests")
        .where("fromUserId", "==", fromUserId)
        .where("toUserId", "==", toUserId);
    const existingReqQuery2 = db.collection("friendRequests")
        .where("fromUserId", "==", toUserId)
        .where("toUserId", "==", fromUserId);

    const [snap1, snap2] = await Promise.all([existingReqQuery1.get(), existingReqQuery2.get()]);

    if (!snap1.empty || !snap2.empty) {
        throw new functions.https.HttpsError("already-exists", "A friend request between these users already exists.");
    }

    const newRequest = {
        fromUserId,
        toUserId,
        status: "pending" as FriendRequestStatus,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection("friendRequests").add(newRequest);
    return { success: true };
});

export const respondToFriendRequest = functions.https.onCall(async (data, context) => {
    const currentUserId = ensureAuthenticated(context);
    const { requestId, response } = data; // response is 'accepted' or 'declined'

    if (!requestId || !response) {
        throw new functions.https.HttpsError("invalid-argument", "requestId and response are required.");
    }

    const requestRef = db.collection("friendRequests").doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Friend request not found.");
    }

    const requestData = requestDoc.data();
    if (requestData?.toUserId !== currentUserId) {
        throw new functions.https.HttpsError("permission-denied", "You can only respond to requests sent to you.");
    }
    if (requestData?.status !== "pending") {
        throw new functions.https.HttpsError("failed-precondition", "This request has already been responded to.");
    }

    if (response === "accepted") {
        const fromUserId = requestData.fromUserId;
        const toUserId = requestData.toUserId; // which is currentUserId
        const fromUserRef = db.collection("users").doc(fromUserId);
        const toUserRef = db.collection("users").doc(toUserId);

        const batch = db.batch();
        batch.update(fromUserRef, { friends: admin.firestore.FieldValue.arrayUnion(toUserId) });
        batch.update(toUserRef, { friends: admin.firestore.FieldValue.arrayUnion(fromUserId) });
        batch.update(requestRef, { status: "accepted" });

        await batch.commit();
        return { success: true, status: "accepted" };
    } else if (response === "declined") {
        await requestRef.update({ status: "declined" });
        return { success: true, status: "declined" };
    } else {
        throw new functions.https.HttpsError("invalid-argument", "Response must be 'accepted' or 'declined'.");
    }
});

export const removeFriend = functions.https.onCall(async (data, context) => {
    const currentUserId = ensureAuthenticated(context);
    const { friendId } = data;

    if (!friendId) {
        throw new functions.https.HttpsError("invalid-argument", "friendId is required.");
    }

    const currentUserRef = db.collection("users").doc(currentUserId);
    const friendRef = db.collection("users").doc(friendId);

    const batch = db.batch();
    batch.update(currentUserRef, { friends: admin.firestore.FieldValue.arrayRemove(friendId) });
    batch.update(friendRef, { friends: admin.firestore.FieldValue.arrayRemove(currentUserId) });
    await batch.commit();

    // Clean up the friend request document
    const reqQuery1 = db.collection("friendRequests").where("fromUserId", "==", currentUserId).where("toUserId", "==", friendId);
    const reqQuery2 = db.collection("friendRequests").where("fromUserId", "==", friendId).where("toUserId", "==", currentUserId);
    const [snap1, snap2] = await Promise.all([reqQuery1.get(), reqQuery2.get()]);
    const deleteBatch = db.batch();
    snap1.forEach((doc) => deleteBatch.delete(doc.ref));
    snap2.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    return { success: true };
});

export const postQuestion = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { guideId, questionText } = data;
    if (!guideId || !questionText) {
        throw new functions.https.HttpsError("invalid-argument", "guideId and questionText are required.");
    }

    const newQuestion = {
        guideId,
        userId,
        questionText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("questions").add(newQuestion);
    return { success: true };
});

export const postAnswer = functions.https.onCall(async (data, context) => {
    const guideId = ensureAuthenticated(context);
    const { questionId, answerText } = data;
    if (!questionId || !answerText) {
        throw new functions.https.HttpsError("invalid-argument", "questionId and answerText are required.");
    }

    const questionRef = db.collection("questions").doc(questionId);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Question not found.");
    }

    if (questionDoc.data()?.guideId !== guideId) {
        throw new functions.https.HttpsError("permission-denied", "You can only answer questions directed to you.");
    }

    await questionRef.update({
        answerText,
        answeredAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
});

export const sendMessage = functions.https.onCall(async (data, context) => {
    const userId = ensureAuthenticated(context);
    const { conversationId, text } = data;

    if (!conversationId || !text) {
        throw new functions.https.HttpsError("invalid-argument", "A conversationId and text are required to send a message.");
    }

    const conversationRef = db.collection("conversations").doc(conversationId);
    const messageRef = db.collection("messages").doc(); // Generate a new an empty doc ref

    return db.runTransaction(async (transaction) => {
        const conversationDoc = await transaction.get(conversationRef);
        if (!conversationDoc.exists) {
            throw new functions.https.HttpsError("not-found", "The specified conversation does not exist.");
        }

        const conversationData = conversationDoc.data()!;
        if (userId !== conversationData.userId && userId !== conversationData.guideId) {
            throw new functions.https.HttpsError("permission-denied", "You are not a participant in this conversation.");
        }

        const timestamp = Date.now();
        const newMessage = {
            conversationId,
            senderId: userId,
            text,
            timestamp,
        };

        transaction.set(messageRef, newMessage);
        transaction.update(conversationRef, {
            lastMessageTimestamp: timestamp,
        });

        return { success: true, messageId: messageRef.id };
    });
});


// --- ADMIN FUNCTIONS ---
export const deleteItem = functions.https.onCall(async (data, context) => {
    const adminId = ensureAuthenticated(context);
    await ensureAdmin(adminId);

    const { itemId, itemType } = data;
    const validTypes = ["user", "guide", "vendor", "stay"];
    if (!itemId || !itemType || !validTypes.includes(itemType)) {
        throw new functions.https.HttpsError("invalid-argument", "itemId and a valid itemType are required.");
    }
    const collectionName = itemType === "user" ? "users" : `${itemType}s`;
    await db.collection(collectionName).doc(itemId).delete();
    return { success: true };
});

export const updateUserRole = functions.https.onCall(async (data, context) => {
    const adminId = ensureAuthenticated(context);
    await ensureAdmin(adminId);

    const { userId, newRole } = data;
    const validRoles: UserRole[] = ["user", "guide", "admin"];
    if (!userId || !newRole || !validRoles.includes(newRole)) {
        throw new functions.https.HttpsError("invalid-argument", "userId and a valid newRole are required.");
    }

    if (adminId === userId) {
        throw new functions.https.HttpsError("permission-denied", "Admins cannot change their own role.");
    }

    await db.collection("users").doc(userId).update({ role: newRole });
    return { success: true };
});

// ============================================================================
// NEW SECURE GEMINI FUNCTIONS
// ============================================================================

const parseJsonResponse = <T>(jsonText: string): T => {
    const cleanJsonText = jsonText.replace(/^```json\s*|```$/g, "").trim();
    try {
        return JSON.parse(cleanJsonText) as T;
    } catch (error) {
        functions.logger.error("Failed to parse JSON response from AI:", cleanJsonText);
        throw new functions.https.HttpsError("internal", "Received an invalid JSON response from the AI.");
    }
};

export const generateCustomItinerary = functions.https.onCall(async (data, context) => {
    ensureAuthenticated(context);
    const params = data;
    // ... (rest of the logic from geminiService)
    const primaryDestination = params.mustVisit[0]?.destination || "Maharashtra";
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
      must_visit_places: params.mustVisit.map((p: {name: string, destination: string}) => `${p.name}, ${p.destination}`),
    };
    const prompt = `SYSTEM: You are an expert Maharashtra travel planner... USER_PROMPT: ${JSON.stringify(userPrompt, null, 2)}`;
    const schema = {type: Type.OBJECT, properties: { /* ... as defined in geminiService ... */ }}; // Abridged for brevity

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.8 },
        });
        return parseJsonResponse<DetailedItinerary>(response.text);
    } catch (error) {
        functions.logger.error("Error in generateCustomItinerary function:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate itinerary.");
    }
});

export const generatePlaceSuggestions = functions.https.onCall(async (data, context) => {
    ensureAuthenticated(context);
    const { destination } = data;
    if (!destination) {
        throw new functions.https.HttpsError("invalid-argument", "Destination is required.");
    }
    const prompt = `Provide a diverse list of tourist suggestions for ${destination}, Maharashtra...`;
    const schema = {type: Type.OBJECT, properties: { /* ... as defined in geminiService ... */ }}; // Abridged

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.8 },
        });
        const result = parseJsonResponse<{ places: Omit<PlaceSuggestion, "destination">[] }>(response.text);
        return result.places.map((place) => ({ ...place, destination }));
    } catch (error) {
        functions.logger.error("Error in generatePlaceSuggestions function:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate suggestions.");
    }
});

export const generatePlaceDetails = functions.https.onCall(async (data, context) => {
    ensureAuthenticated(context);
    const { placeName, destination } = data;
    if (!placeName || !destination) {
        throw new functions.https.HttpsError("invalid-argument", "placeName and destination are required.");
    }
    const prompt = `For a tourist visiting "${placeName}" in ${destination}, Maharashtra, provide essential details.`;
    const schema = {type: Type.OBJECT, properties: { /* ... as defined in geminiService ... */ }}; // Abridged

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.5 },
        });
        return parseJsonResponse<PlaceDetails>(response.text);
    } catch (error) {
        functions.logger.error("Error in generatePlaceDetails function:", error);
        throw new functions.https.HttpsError("internal", "Failed to get place details.");
    }
});

export const estimateTripCost = functions.https.onCall(async (data, context) => {
    ensureAuthenticated(context);
    const { itinerary } = data as { itinerary: DetailedItinerary };
    const itineraryString = itinerary.days.map((day) =>
        `Day ${day.day}: ${day.slots.map((slot) => slot.place.name).join(" -> ")}`
    ).join("\n");
    const prompt = `Based on the following itinerary... Itinerary:\n${itineraryString}`;
    const schema = {type: Type.OBJECT, properties: { /* ... as defined in geminiService ... */ }}; // Abridged

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.5 },
        });
        return parseJsonResponse<CostEstimate>(response.text);
    } catch (error) {
        functions.logger.error("Error in estimateTripCost function:", error);
        throw new functions.https.HttpsError("internal", "Failed to estimate cost.");
    }
});


export const translateText = functions.https.onCall(async (data, context) => {
    ensureAuthenticated(context);
    const { text, targetLanguage } = data;
    if (!text || !targetLanguage) {
        throw new functions.https.HttpsError("invalid-argument", "text and targetLanguage are required.");
    }
    const prompt = `Translate the following text to ${targetLanguage}. Return only the translated text... Text to translate: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        functions.logger.error("Error in translateText function:", error);
        throw new functions.https.HttpsError("internal", "Failed to translate text.");
    }
});

export const chatWithAI = functions.https.onCall(async (data, context) => {
    const uid = ensureAuthenticated(context);
    const { history, message } = data as { history: ChatMessage[], message: string, user: User };
    if (!message) {
        throw new functions.https.HttpsError("invalid-argument", "A new message is required.");
    }

    const userDoc = await db.collection("users").doc(uid).get();
    const user = userDoc.data() as User;

    const preferences = user.preferences.length > 0 ? `Their travel interests include ${user.preferences.join(", ")}.` : "";
    const systemInstruction = `You are a personal travel assistant for ${user.name}. ${preferences} Use this information to give them tailored advice for exploring Maharashtra, India. Be friendly, concise, and engaging. Use markdown for formatting.`;

    const contents = history.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: { systemInstruction },
        });
        return response.text;
    } catch (error) {
        functions.logger.error("Error in chatWithAI function:", error);
        throw new functions.https.HttpsError("internal", "Failed to get chat response.");
    }
});