import nodemailer from "nodemailer";
import crypto from "crypto";

function createResetToken(email) {
  const secret = process.env.EMAIL_PASS;
  const payload = Buffer.from(JSON.stringify({
    email,
    expiresAt: Date.now() + 1000 * 60 * 60,
  })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  try {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: "Email service is not configured" });
    }

    const { email, frontendUrl } = req.body;

    if (!email || !frontendUrl) {
      return res.status(400).json({ message: "Email and frontendUrl are required" });
    }

    // Generate self-signed token (no shared storage needed)
    const token = createResetToken(email);
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    console.log("Sending password reset email to:", email);

    // Send email
    await transporter.sendMail({
      from: `"UPSC Nadiya" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - UPSC Nadiya",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          
          <h2 style="color: #6366f1;">
            Reset Your Password
          </h2>

          <p>Hello,</p>

          <p>
            We received a request to reset your password for your UPSC Nadiya account.
          </p>

          <div style="margin: 30px 0;">
            <a 
              href="${resetLink}"
              style="
                background: linear-gradient(135deg, #6366f1, #ec4899);
                color: white;
                padding: 14px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
              "
            >
              Reset Password
            </a>
          </div>

          <p>
            This link will expire in <strong>1 hour</strong>.
          </p>

          <p>
            If you did not request this password reset, you can safely ignore this email.
          </p>

          <hr style="margin: 30px 0;" />

          <p style="font-size: 12px; color: #666;">
            UPSC Nadiya Team
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });

  } catch (error) {
    console.error("Password reset email error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send reset email",
    });
  }
}