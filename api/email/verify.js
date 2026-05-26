import { getToken, deleteToken } from "./token-storage.js";
import { createClient } from "@supabase/supabase-js";

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

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Get token data from shared storage
    const tokenData = getToken(token);

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: "Token not found or expired",
      });
    }

    // Check if token is expired
    if (tokenData.expiresAt < Date.now()) {
      deleteToken(token);
      return res.status(400).json({
        success: false,
        message: "Token has expired",
      });
    }

    // Find user by email in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", tokenData.email)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user's email_confirmed_at in auth.users via Supabase Admin
    // Since we can't directly update auth.users from client, we'll use Supabase Auth API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.user_id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("Error confirming email:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to confirm email",
      });
    }

    // Delete the token after successful verification
    deleteToken(token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}