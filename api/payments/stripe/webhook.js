import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const sig = req.headers["stripe-signature"];
    const payload = req.body;

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig, stripeWebhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    console.log("Stripe webhook event:", event.type);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { metadata } = session;

      const courseId = metadata.course_id;
      const userId = metadata.user_id;

      if (!courseId || !userId) {
        console.error("Missing course_id or user_id in session metadata");
        return res.status(400).json({ message: "Missing required data" });
      }

      // Check if enrollment already exists
      const { data: existingPurchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .eq("payment_id", session.payment_intent)
        .single();

      if (existingPurchase) {
        console.log("Enrollment already exists, skipping");
        return res.status(200).json({ message: "Already processed" });
      }

      // Create enrollment
      const { error: insertError } = await supabase.from("purchases").insert({
        user_id: userId,
        course_id: courseId,
        payment_id: session.payment_intent,
        payment_method: "stripe",
        amount: session.amount_total / 100, // Convert from cents to dollars
        currency: session.currency,
        status: "completed",
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating enrollment:", insertError);
        return res.status(500).json({ message: "Failed to create enrollment" });
      }

      console.log("Enrollment created successfully for user:", userId, "course:", courseId);
    }

    // Handle payment_intent.failed event
    if (event.type === "payment_intent.failed") {
      const paymentIntent = event.data.object;
      console.log("Payment failed:", paymentIntent.id);

      // Log failed payment for analytics
      await supabase.from("payment_failures").insert({
        payment_id: paymentIntent.id,
        error_code: paymentIntent.last_payment_error?.code,
        error_description: paymentIntent.last_payment_error?.message,
        created_at: new Date().toISOString(),
      });
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
