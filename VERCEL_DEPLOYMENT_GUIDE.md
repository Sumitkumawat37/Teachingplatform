# Vercel Deployment Guide - Single Project

This guide explains how to deploy your complete UPSC Nadiya platform (frontend + backend) on Vercel as a single project using serverless functions.

## Architecture Overview

- **Frontend**: Vite + React (built to `dist/`)
- **Backend**: Vercel Serverless Functions (in `api/` directory)
- **Database**: Supabase (already configured)
- **Email Service**: Nodemailer via serverless functions

## Prerequisites

1. Vercel account (free tier works)
2. GitHub repository with your code
3. Supabase project (already set up)
4. Gmail app-specific password for email service

## Step 1: Environment Variables

Set these environment variables in Vercel:

### Required Environment Variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/public key
- `EMAIL_PASSWORD`: Gmail app-specific password (not your regular password)
- `VITE_RAZORPAY_KEY_ID`: Razorpay key ID for payment integration (rzp_test_T2lnMYwkSird1N)

### How to get Gmail App-Specific Password:
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new password
4. Use this password in `EMAIL_PASSWORD` variable

## Step 2: Deploy to Vercel

### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (create new)
# - Project name: upsc-nadiya (or your preferred name)
# - Directory: . (current directory)
# - Override settings? No
```

### Option B: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables
6. Click "Deploy"

## Step 3: Configure Environment Variables in Vercel

After deployment:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add the following variables:

```
VITE_SUPABASE_URL = your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY = your-supabase-anon-key
EMAIL_PASSWORD = your-gmail-app-password
VITE_RAZORPAY_KEY_ID = rzp_test_T2lnMYwkSird1N
```

4. Redeploy after adding variables

## Step 4: Update API Endpoints (Already Done)

The following changes have been made to use Vercel serverless functions:

### Updated Files:
- `src/lib/auth-context.tsx` - Updated email endpoints to use `/api/email/*`
- `vercel.json` - Added API routes configuration
- `api/email/send-password-reset.js` - New serverless function
- `api/email/send-verification.js` - New serverless function
- `api/auth/reset-password.js` - New serverless function

### API Endpoints:
- Email Verification: `POST /api/email/send-verification`
- Password Reset: `POST /api/email/send-password-reset`
- Reset Password: `POST /api/auth/reset-password`

## Step 5: Test the Deployment

1. Visit your Vercel URL (e.g., `https://upsc-nadiya.vercel.app`)
2. Test user registration (should send verification email)
3. Test password reset (should send reset email)
4. Test all main features

## Step 6: Custom Domain (Optional)

1. Go to project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel

## Important Notes

### Token Storage
Currently, reset tokens are stored in memory. For production, consider:
- **Vercel KV** (Redis) - Free tier available
- **Supabase** - Store tokens in a dedicated table
- **Database** - Any database service

### Email Service Limitations
- Free Gmail account has daily sending limits
- For high volume, consider:
  - SendGrid (free tier available)
  - Mailgun (free tier available)
  - AWS SES (pay-as-you-go)

### CORS Configuration
Serverless functions include CORS headers to allow cross-origin requests.

## Troubleshooting

### Email Not Sending
- Check `EMAIL_PASSWORD` is correct (app-specific password)
- Check Vercel function logs
- Verify Gmail 2FA is enabled

### Build Errors
- Ensure all dependencies are in `package.json`
- Check Node.js version in Vercel settings
- Review build logs in Vercel dashboard

### API Routes Not Working
- Verify `vercel.json` configuration
- Check API function syntax
- Review function logs in Vercel dashboard

## Alternative Deployment Options

### Option 2: Separate Backend on Vercel
If you prefer to keep backend separate:

1. Create a new Vercel project for backend
2. Deploy Express server as serverless functions
3. Update `VITE_BACKEND_URL` in frontend
4. Configure CORS between projects

### Option 3: Backend on Render/Railway
- Deploy backend on Render (free tier)
- Deploy frontend on Vercel
- Set `VITE_BACKEND_URL` to Render URL

## Cost Estimate

### Vercel Free Tier:
- **Frontend**: Unlimited deployments, 100GB bandwidth/month
- **Serverless Functions**: 100GB-hours/month
- **Total**: $0/month (within limits)

### Paid Tier (if needed):
- Pro: $20/month (more bandwidth, faster builds)
- Enterprise: Custom pricing

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Nodemailer Docs: https://nodemailer.com/
