import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import Razorpay from "razorpay";
import * as cors from "cors";

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
