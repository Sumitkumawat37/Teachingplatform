# Vercel Deployment Instructions

## Pre-Deployment Checklist

✅ All errors fixed:
- TypeScript types configured for environment variables
- Build configuration updated (base path fixed)
- API functions converted to CommonJS for Vercel compatibility
- Error handling added for missing email service
- API routes configured in vercel.json
- Local build tested successfully

## Deployment Steps

### Step 1: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Click **Import Git Repository**
4. Find and select: `Sumitkumawat37/teachingplatform`
5. Click **Import**
6. Vercel will auto-detect:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Click **Deploy**

### Step 2: Add Environment Variables

After deployment is complete:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_SUPABASE_URL = https://tzlpuvdabpulbnmlvkrl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = sb_publishable_qZ9K34o1htErZbaneF3X9w_58MjxbFP
```

**Optional (for email functionality):**
```
EMAIL_PASSWORD = your-gmail-app-password
```

4. Click **Save**

### Step 3: Redeploy with Environment Variables

1. Go to **Deployments** tab
2. Click the three dots (⋮) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## What's Included in This Deployment

### Frontend
- ✅ Vite + React application
- ✅ Neon theme with glassmorphism effects
- ✅ All pages (Home, Courses, Live Classes, etc.)
- ✅ Supabase authentication
- ✅ Google OAuth integration

### Backend (Serverless Functions)
- ✅ `/api/email/send-password-reset` - Password reset emails
- ✅ `/api/email/send-verification` - Email verification
- ✅ `/api/auth/reset-password` - Password reset with token

**Note:** Email functions will return 503 error if EMAIL_PASSWORD is not configured. The app will still work without email functionality.

## Troubleshooting

### Build Fails
- Check Vercel build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node.js version (should be 18+)

### Environment Variables Not Working
- Make sure variables are added in Vercel Dashboard (not in code)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### API Routes Not Working
- Verify vercel.json has rewrites configured
- Check API function logs in Vercel Dashboard
- Ensure functions use CommonJS (module.exports)

### Email Not Sending
- Add EMAIL_PASSWORD environment variable
- Use Gmail app-specific password (not regular password)
- Check function logs for specific errors

### 404 Errors
- Ensure repository is correctly linked
- Check that vercel.json is in project root
- Verify build output directory is "dist"

## Post-Deployment Testing

1. **Basic Functionality:**
   - Visit your Vercel URL
   - Test navigation between pages
   - Check responsive design

2. **Authentication:**
   - Test sign up with email
   - Test sign in with Google (if configured in Supabase)
   - Test password reset (if EMAIL_PASSWORD is set)

3. **API Endpoints:**
   - Check browser console for API errors
   - Test email verification (if configured)
   - Test password reset flow

## Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate to provision

## Cost

- **Free Tier**: Sufficient for most use cases
  - 100GB bandwidth/month
  - 100GB-hours serverless functions
  - Unlimited deployments

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Repository: https://github.com/Sumitkumawat37/teachingplatform
