const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store reset tokens in memory (in production, use Vercel KV or a database)
const resetTokens = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nadiyakhan0205@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if email service is configured
  if (!process.env.EMAIL_PASSWORD) {
    return res.status(503).json({ 
      message: 'Email service not configured. Please add EMAIL_PASSWORD environment variable.' 
    });
  }

  try {
    const { email, frontendUrl } = req.body;

    if (!email || !frontendUrl) {
      return res.status(400).json({ message: 'Email and frontendUrl are required' });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Store token with expiration (1 hour)
    resetTokens.set(token, {
      email,
      expiresAt: Date.now() + 3600000 // 1 hour
    });

    // Send email
    const mailOptions = {
      from: 'nadiyakhan0205@gmail.com',
      to: email,
      subject: 'Password Reset - UPSC Nadiya',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>You requested a password reset for your UPSC Nadiya account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
};
