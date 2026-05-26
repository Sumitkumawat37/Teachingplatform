const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store verification tokens in memory (in production, use Vercel KV or a database)
const resetTokens = new Map();

module.exports = async function handler(req, res) {
  try {
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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Environment variables missing');
      console.log('EMAIL_USER:', !!process.env.EMAIL_USER);
      console.log('EMAIL_PASS:', !!process.env.EMAIL_PASS);
      return res.status(503).json({ 
        message: 'Email service not configured. Please add EMAIL_USER and EMAIL_PASS environment variables.' 
      });
    }

    console.log('Creating email transporter...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true,
      logger: true
    });
    
    console.log('Transporter created successfully');

    const { email, name, frontendUrl } = req.body;

    console.log('=== Email Verification Request ===');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Frontend URL:', frontendUrl);

    if (!email || !frontendUrl) {
      return res.status(400).json({ message: 'Email and frontendUrl are required' });
    }

    // Generate a verification token
    const token = crypto.randomBytes(32).toString('hex');
    const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

    console.log('Generated token:', token.substring(0, 10) + '...');
    console.log('Verify link:', verifyLink);

    // Store token with expiration (24 hours)
    resetTokens.set(`verify_${token}`, {
      email,
      expiresAt: Date.now() + 86400000 // 24 hours
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    console.log('Email accepted by:', info.accepted);
    console.log('Email rejected by:', info.rejected);
    console.log('Email response:', info.response);
    res.json({ message: 'Verification email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('=== Handler Error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to send verification email', error: error.message, code: error.code });
  }
};
