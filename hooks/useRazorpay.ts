import { useCallback } from 'react';

// The base URL for functions changes depending on environment (local emulator vs deployed).
const getFunctionsUrl = () => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    if (isDevelopment) {
        // This must match your Firebase project ID and function region from firebase.json
        return 'http://127.0.0.1:5001/mahayatri-app/us-central1';
    } else {
        // Use the deployed function URL structure with a valid project ID
        return 'https://us-central1-mahayatri-app.cloudfunctions.net';
    }
};

// This is ONLY for the client-side Razorpay SDK. A public test key is acceptable.
const RAZORPAY_KEY_ID = 'rzp_test_1ABC2def3GHI4j';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, any>;
    theme?: {
        color: string;
    };
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) => void;
    modal: {
        ondismiss: () => void;
    };
}

interface CheckoutOptions {
    amount: number; // in paise
    currency: string;
    receipt: string;
    notes: Record<string, any>;
    prefill: {
        name: string;
        email: string;
    };
    userId: string;
    guideId: string;
}

export const useRazorpay = () => {
    const loadScript = useCallback((src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                return resolve();
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script ${src}`));
            document.body.appendChild(script);
        });
    }, []);

    const openCheckout = useCallback(async (options: CheckoutOptions): Promise<any> => {
        await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        const baseUrl = getFunctionsUrl();

        return new Promise(async (resolve, reject) => {
            try {
                // Step 1: Call backend to create a Razorpay order
                const orderResponse = await fetch(`${baseUrl}/createRazorpayOrder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: options.amount,
                        currency: options.currency,
                        receipt: options.receipt,
                        notes: options.notes,
                    }),
                });

                const orderData = await orderResponse.json();
                if (!orderResponse.ok) {
                    throw new Error(`Failed to create order: ${orderData.error || 'Server error'}`);
                }
                
                // Step 2: Configure and open Razorpay checkout
                const razorpayOptions: RazorpayOptions = {
                    key: RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'MahaYatri',
                    description: 'Guide Contact Unlock Payment',
                    order_id: orderData.id,
                    prefill: options.prefill,
                    notes: options.notes,
                    theme: { color: '#FF642C' },
                    handler: async (response) => {
                        // Step 3: Payment successful, call backend to verify
                        try {
                           const verificationResponse = await fetch(`${baseUrl}/verifyRazorpayPayment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...response,
                                    userId: options.userId,
                                    guideId: options.guideId,
                                }),
                           });
                           
                           const verificationData = await verificationResponse.json();

                           if (verificationResponse.ok && verificationData.verified) {
                               resolve(response);
                           } else {
                               reject(new Error(verificationData.error || 'Payment verification failed. Please contact support.'));
                           }
                        } catch (err) {
                            reject(new Error('An error occurred while verifying your payment.'));
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment was cancelled.'));
                        },
                    },
                };

                const rzp = new window.Razorpay(razorpayOptions);
                rzp.open();
            } catch (err: unknown) {
                reject(err instanceof Error ? err : new Error('An unexpected error occurred during checkout.'));
            }
        });
    }, [loadScript]);

    return { openCheckout };
};