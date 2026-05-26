export default async function handler(req, res) {
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

    const { email, name, frontendUrl } = req.body;

    console.log('=== Email Verification Request ===');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Frontend URL:', frontendUrl);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

    // Temporarily return success without sending email to test endpoint
    res.json({ message: 'Email endpoint working (email sending disabled for testing)', email, name });
  } catch (error) {
    console.error('=== Handler Error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    res.status(500).json({ message: 'Failed', error: error.message });
  }
}
