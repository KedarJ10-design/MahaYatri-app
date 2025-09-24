import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import * as cors from "cors";
import { Guide, UserRole, BookingStatus } from "./types";

const corsHandler = cors({origin: true});

admin.initializeApp();
const db = admin.firestore();

// Set these in your Firebase environment
// firebase functions:config:set razorpay.key_id="YOUR_KEY_ID"
// firebase functions:config:set razorpay.key_secret="YOUR_KEY_SECRET"
const RAZORPAY_KEY_ID = functions.config().razorpay.key_id;
const RAZORPAY_KEY_SECRET = functions.config().razorpay.key_secret;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("Razorpay Key ID or Key Secret is not set in Firebase config.");
}

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay order.
 * Expects amount, currency, receipt, and notes.
 */
export const createRazorpayOrder = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
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

/**
 * Verifies a Razorpay payment and updates user data in Firestore.
 * Expects razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, guideId.
 */
export const verifyRazorpayPayment = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
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
// NEW CALLABLE FUNCTIONS
// ============================================================================

// Helper to check for authentication
const ensureAuthenticated = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }
  return context.auth.uid;
};

// Helper to check for admin role
const ensureAdmin = async (uid: string) => {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Must be an admin to perform this action."
        );
    }
};

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
      status: "PENDING",
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
        status: "CONFIRMED",
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
        status: "CONFIRMED",
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
    };

    const batch = db.batch();
    const guideRef = db.collection("guides").doc(userId);
    batch.set(guideRef, newGuideApplication);

    const userRef = db.collection("users").doc(userId);
    batch.update(userRef, { hasPendingApplication: true });

    await batch.commit();
    return { success: true };
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
