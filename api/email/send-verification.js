const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Store verification tokens temporarily
const verificationTokens = new Map();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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

    const { email, name, frontendUrl } = req.body;

    if (!email || !frontendUrl) {
      return res.status(400).json({
        message: "Email and frontendUrl are required",
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Verification link
    const verificationLink =
      `${frontendUrl}/verify-email?token=${token}`;

    // Store token
    verificationTokens.set(token, {
      email,
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
    });

    // Send Email
    await transporter.sendMail({
      from: `"UPSC Nadiya" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Account - UPSC Nadiya",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">

          <h2 style="color: #6366f1;">
            Verify Your Email
          </h2>

          <p>Hello ${name || "User"},</p>

          <p>
            Thank you for registering on UPSC Nadiya.
          </p>

          <p>
            Please verify your email address by clicking the button below:
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${verificationLink}"
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
              Verify Email
            </a>
          </div>

          <p>
            This verification link will expire in 1 hour.
          </p>

          <p>
            If you did not create this account, you can ignore this email.
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
      message: "Verification email sent successfully",
    });

  } catch (error) {
    console.error("Verification email error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};