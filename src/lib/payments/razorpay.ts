import { supabase } from "@/integrations/supabase/client";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Load Razorpay SDK dynamically
 */
export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

/**
 * Create a Razorpay order on the server
 */
export async function createRazorpayOrder(
  courseId: string,
  amount: number,
  userId: string
): Promise<RazorpayOrder> {
  try {
    // In production, this would call your backend API
    // For now, we'll create a placeholder order
    const response = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, amount, userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    // Fallback: create a mock order for development
    return {
      id: `order_${Date.now()}`,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${courseId}_${Date.now()}`,
      status: "created",
    };
  }
}

/**
 * Initiate Razorpay payment
 */
export async function initiateRazorpayPayment(
  courseId: string,
  amount: number,
  courseTitle: string,
  userEmail: string,
  userName: string
): Promise<boolean> {
  try {
    await loadRazorpayScript();

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const order = await createRazorpayOrder(courseId, amount, userId);

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "UPSC Nadiya",
      description: `Purchase: ${courseTitle}`,
      order_id: order.id,
      handler: async (response: any) => {
        // Verify payment on server
        const verified = await verifyRazorpayPayment(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );

        if (verified) {
          await createEnrollment(userId, courseId, response.razorpay_payment_id);
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: "#8b5cf6",
      },
      modal: {
        ondismiss: () => {
          console.log("Payment cancelled by user");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    return true;
  } catch (error) {
    console.error("Error initiating Razorpay payment:", error);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature
 */
export async function verifyRazorpayPayment(
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/payments/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, orderId, signature }),
    });

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    const data = await response.json();
    return data.verified;
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return false;
  }
}

/**
 * Create enrollment after successful payment
 */
async function createEnrollment(
  userId: string,
  courseId: string,
  paymentId: string
): Promise<void> {
  try {
    const { error } = await supabase.from("purchases").insert({
      user_id: userId,
      course_id: courseId,
      payment_id: paymentId,
      payment_method: "razorpay",
      status: "completed",
      created_at: new Date().toISOString(),
    } as any);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating enrollment:", error);
    throw error;
  }
}
