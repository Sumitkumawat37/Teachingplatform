import { supabase } from "@/integrations/supabase/client";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export interface StripeSession {
  id: string;
  payment_intent: string;
  amount_total: number;
  currency: string;
  status: string;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

/**
 * Load Stripe SDK dynamically
 */
export function loadStripeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Stripe SDK"));
    document.body.appendChild(script);
  });
}

/**
 * Create a Stripe checkout session on the server
 */
export async function createStripeCheckoutSession(
  courseId: string,
  amount: number,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<StripeSession> {
  try {
    const response = await fetch("/api/payments/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, amount, userId, successUrl, cancelUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Stripe checkout session");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    // Fallback: create a mock session for development
    return {
      id: `cs_test_${Date.now()}`,
      payment_intent: `pi_test_${Date.now()}`,
      amount_total: amount * 100, // Stripe expects amount in cents
      currency: "usd",
      status: "open",
    };
  }
}

/**
 * Initiate Stripe payment
 */
export async function initiateStripePayment(
  courseId: string,
  amount: number,
  courseTitle: string,
  userEmail: string
): Promise<string> {
  try {
    await loadStripeScript();

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const successUrl = `${window.location.origin}/courses/${courseId}?payment=success`;
    const cancelUrl = `${window.location.origin}/courses/${courseId}?payment=cancelled`;

    const session = await createStripeCheckoutSession(
      courseId,
      amount,
      userId,
      successUrl,
      cancelUrl
    );

    // Redirect to Stripe Checkout
    const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw error;
    }

    return session.id;
  } catch (error) {
    console.error("Error initiating Stripe payment:", error);
    throw error;
  }
}

/**
 * Verify Stripe payment status
 */
export async function verifyStripePayment(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/payments/stripe/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    const data = await response.json();
    return data.paid;
  } catch (error) {
    console.error("Error verifying Stripe payment:", error);
    return false;
  }
}

/**
 * Create enrollment after successful Stripe payment
 */
export async function createStripeEnrollment(
  userId: string,
  courseId: string,
  sessionId: string
): Promise<void> {
  try {
    const { error } = await supabase.from("purchases").insert({
      user_id: userId,
      course_id: courseId,
      payment_id: sessionId,
      payment_method: "stripe",
      status: "completed",
      created_at: new Date().toISOString(),
    } as any);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating Stripe enrollment:", error);
    throw error;
  }
}
