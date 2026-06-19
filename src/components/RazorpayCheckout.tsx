import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { trackEnrollNowClick, trackCoursePurchase } from '@/lib/analytics';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  amount: number; // Amount in INR (will be converted to paise)
  currency?: string;
  courseId?: string;
  courseTitle?: string;
  onSuccess?: (paymentId: string, orderId: string) => void;
  onFailure?: (error: string) => void;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function RazorpayCheckout({
  amount,
  currency = 'INR',
  courseId,
  courseTitle,
  onSuccess,
  onFailure,
  buttonText = 'Pay Now',
  className = '',
  disabled = false,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    // Track Enroll Now click
    if (courseId && courseTitle) {
      trackEnrollNowClick(courseId, courseTitle, amount);
    }

    try {
      const amountInPaise = Math.round(amount * 100); // Convert to paise

      // Step 1: Create order via Supabase Edge Function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          amount: amountInPaise,
          currency,
          receipt: `order_${Date.now()}`,
        },
      });

      if (orderError) {
        throw new Error(orderError.message || 'Failed to create order');
      }

      if (!orderData || !orderData.order_id) {
        throw new Error('Invalid order response');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'UPSC by Nadiya Ma\'am',
        description: 'Course Payment',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // Step 3: Verify payment via Supabase Edge Function
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });

          if (verifyError || !verifyData?.success) {
            const errorMsg = verifyError?.message || 'Payment verification failed';
            setError(errorMsg);
            onFailure?.(errorMsg);
            return;
          }

          // Payment successful
          if (courseId && courseTitle) {
            trackCoursePurchase(courseId, courseTitle, amount);
          }
          onSuccess?.(response.razorpay_payment_id, response.razorpay_order_id);
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#8B5CF6',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            onFailure?.('Payment cancelled by user');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        const errorMsg = response.error?.description || 'Payment failed';
        setError(errorMsg);
        onFailure?.(errorMsg);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMsg);
      onFailure?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`bg-gradient-to-r from-violet-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? 'Processing...' : buttonText}
      </button>
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
