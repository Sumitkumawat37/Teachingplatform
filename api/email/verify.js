import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function verifyToken(token) {
  try {
    const secret = process.env.EMAIL_PASS;
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;

    const payload = token.substring(0, lastDot);
    const sig = token.substring(lastDot + 1);
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");

    if (sig !== expectedSig) return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.expiresAt < Date.now()) return null;

    return data;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({
        success: false,
        message: "Verification service is not configured",
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const rawToken = req.query.token;

    if (!rawToken) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    const tokenData = verifyToken(rawToken);

    if (!tokenData) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link" });
    }

    // Find user by email in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", tokenData.email)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Confirm email via Supabase Admin
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.user_id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("Error confirming email:", updateError);
      return res.status(500).json({ success: false, message: "Failed to confirm email" });
    }

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}