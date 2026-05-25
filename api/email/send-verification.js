const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store verification tokens in memory (in production, use Vercel KV or a database)
const resetTokens = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nadiyakhan0205@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = async function handler(req, res) {
  console.log('Email API called:', req.method, req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if email service is configured
  console.log('EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
  if (!process.env.EMAIL_PASSWORD) {
    console.error('EMAIL_PASSWORD not set');
    return res.status(503).json({ 
      message: 'Email service not configured. Please add EMAIL_PASSWORD environment variable.' 
    });
  }

  try {
    const { email, name, frontendUrl } = req.body;
    console.log('Email request:', { email, name, frontendUrl });

    if (!email || !frontendUrl) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Email and frontendUrl are required' });
    }

    // Test transporter connection
    console.log('Testing transporter connection...');
    await transporter.verify();
    console.log('Transporter verified successfully');

    // Generate a verification token
    const token = crypto.randomBytes(32).toString('hex');
    const verifyLink = `${frontendUrl}/verify-email?token=${token}`;
    console.log('Generated token, verify link:', verifyLink);

    // Store token with expiration (24 hours)
    resetTokens.set(`verify_${token}`, {
      email,
      expiresAt: Date.now() + 86400000 // 24 hours
    });

    // Send email
    const mailOptions = {
      from: 'nadiyakhan0205@gmail.com',
      to: email,
      subject: 'Email Verification - UPSC Nadiya',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Email Verification</h2>
          <p>Welcome to UPSC Nadiya, ${name || 'Student'}!</p>
          <p>Please verify your email address to complete your registration.</p>
          <p>Click the link below to verify your email:</p>
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #ec4899); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    console.log('Sending email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ message: 'Failed to send verification email', error: error.message });
  }
};
