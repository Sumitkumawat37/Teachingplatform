import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(payload, signature) {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", razorpayWebhookSecret)
    .update(payload)
    .digest("hex");
  return expectedSignature === signature;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const signature = req.headers["x-razorpay-signature"];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Invalid Razorpay webhook signature");
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.body;
    console.log("Razorpay webhook event:", event.event);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const { notes } = payment;

      // Extract courseId and userId from notes
      const courseId = notes.course_id;
      const userId = notes.user_id;

      if (!courseId || !userId) {
        console.error("Missing course_id or user_id in payment notes");
        return res.status(400).json({ message: "Missing required data" });
      }

      // Check if enrollment already exists
      const { data: existingPurchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .eq("payment_id", payment.id)
        .single();

      if (existingPurchase) {
        console.log("Enrollment already exists, skipping");
        return res.status(200).json({ message: "Already processed" });
      }

      // Create enrollment
      const { error: insertError } = await supabase.from("purchases").insert({
        user_id: userId,
        course_id: courseId,
        payment_id: payment.id,
        payment_method: "razorpay",
        amount: payment.amount / 100, // Convert from paise to rupees
        currency: payment.currency,
        status: "completed",
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error creating enrollment:", insertError);
        return res.status(500).json({ message: "Failed to create enrollment" });
      }

      console.log("Enrollment created successfully for user:", userId, "course:", courseId);
    }

    // Handle payment.failed event
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      console.log("Payment failed:", payment.id);

      // Log failed payment for analytics
      await supabase.from("payment_failures").insert({
        payment_id: payment.id,
        error_code: payment.error_code,
        error_description: payment.error_description,
        created_at: new Date().toISOString(),
      });
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
