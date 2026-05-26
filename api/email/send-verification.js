import nodemailer from "nodemailer";
import crypto from "crypto";
import { setToken } from "./token-storage.js";

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
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

    const { email, name } = req.body;

    const frontendUrl = process.env.FRONTEND_URL;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Verification link
    const verificationLink =
      `${frontendUrl}/verify-email?token=${token}`;

    // Store token using shared storage
    setToken(token, email);

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
            This link will expire in 1 hour.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });

  } catch (error) {
    console.error("=== FULL ERROR ===");
    console.error(error);
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}