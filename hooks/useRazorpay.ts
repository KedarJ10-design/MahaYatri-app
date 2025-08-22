import { useCallback } from 'react';

// In a real app, this would come from environment variables
const RAZORPAY_KEY_ID = 'rzp_test_YourKeyHere'; // Replace with a test key if you have one

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
    key: string;
    amount: number; // in paise
    currency: string;
    name: string;
    description: string;
    order_id?: string;
    prefill: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, any>;
    theme?: {
        color: string;
    };
    handler: (response: any) => void;
    modal: {
        ondismiss: () => void;
    };
}

interface CheckoutOptions {
    amount: number;
    currency: string;
    receipt: string;
    notes: Record<string, any>;
    prefill: {
        name: string;
        email: string;
    }
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

        return new Promise((resolve, reject) => {
            // In a real app, you would make an API call to your backend here
            // to create a Razorpay order and get the order_id.
            // For this simulation, we will proceed without an order_id,
            // which is possible in test mode.

            const razorpayOptions: RazorpayOptions = {
                key: RAZORPAY_KEY_ID,
                amount: options.amount,
                currency: options.currency,
                name: 'MahaYatri',
                description: 'Guide Contact Unlock',
                prefill: options.prefill,
                notes: options.notes,
                theme: {
                    color: '#FF642C',
                },
                handler: (response) => {
                    // This is called on successful payment
                    console.log('Razorpay Response:', response);
                    resolve(response);
                },
                modal: {
                    ondismiss: () => {
                        // This is called when the user closes the modal
                        console.log('Payment modal dismissed');
                        reject(new Error('Payment was cancelled.'));
                    },
                },
            };

            const rzp = new window.Razorpay(razorpayOptions);
            rzp.open();
        });
    }, [loadScript]);

    return { openCheckout };
};
