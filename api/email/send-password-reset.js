const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Store reset tokens temporarily
const resetTokens = new Map();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("Email configuration error:", error);
  } else {
    console.log("Email server is ready");
  }
});

module.exports = async function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Method not allowed",
      });
    }

    // Check env variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        message: "Email service is not configured",
      });
    }

    const { email, frontendUrl } = req.body;

    // Validation
    if (!email || !frontendUrl) {
      return res.status(400).json({
        message: "Email and frontendUrl are required",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Reset link
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Store token
    resetTokens.set(token, {
      email,
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
    });

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
};