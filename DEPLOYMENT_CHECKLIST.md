# Google OAuth Deployment Verification Checklist

## Pre-Deployment Checks

### 1. Supabase Configuration
- [ ] Go to Supabase Dashboard → Authentication → Providers → Google
- [ ] Verify Google provider is **enabled**
- [ ] Verify **Client ID** is set (from Google Cloud Console)
- [ ] Verify **Client Secret** is set (from Google Cloud Console)
- [ ] Click **Save**

### 2. Google Cloud Console Configuration
- [ ] Go to Google Cloud Console → APIs & Services → Credentials
- [ ] Verify OAuth 2.0 Client ID exists
- [ ] Verify **Authorized redirect URIs** includes:
  - `https://naysnsxwazrvxfbtmrbn.supabase.co/auth/v1/callback`
  - `http://localhost:5173/auth/v1/callback` (for local testing)
  - `https://www.upscwithnadiya.in/` (production)
- [ ] Verify **Authorized JavaScript origins** includes:
  - `https://naysnsxwazrvxfbtmrbn.supabase.co`
  - `http://localhost:5173` (for local testing)
  - `https://www.upscwithnadiya.in` (production)

### 3. Supabase Redirect URLs
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Verify **Site URL** is set to: `https://www.upscwithnadiya.in`
- [ ] Verify **Redirect URLs** includes:
  - `https://www.upscwithnadiya.in/**`
  - `http://localhost:5173/**` (for local testing)

### 4. Vercel Environment Variables
- [ ] Go to Vercel → Project → Settings → Environment Variables
- [ ] Verify `VITE_SUPABASE_URL` is set
- [ ] Verify `VITE_SUPABASE_ANON_KEY` is set
- [ ] Verify `VITE_GOOGLE_CLIENT_ID` is set (for Drive features)
- [ ] Click **Save** → **Redeploy** (required for `VITE_` vars)

### 5. Database Verification
- [ ] Run `sql-verification.sql` in Supabase SQL Editor
- [ ] Verify `profiles` table exists
- [ ] Verify `user_roles` table exists
- [ ] Verify foreign key constraints are correct
- [ ] Verify RLS policies allow authenticated inserts

## Deployment Steps

### 1. Commit Changes
```bash
git add src/lib/auth-context.tsx
git commit -m "Fix Google OAuth session handling with diagnostic logging"
git push
```

### 2. Deploy to Vercel
- [ ] Push to GitHub
- [ ] Vercel will auto-deploy
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

### 3. Post-Deployment Verification

### Browser Console Check
- [ ] Open browser console (F12)
- [ ] Navigate to `https://www.upscwithnadiya.in/login`
- [ ] Click "Sign in with Google"
- [ ] Verify console shows:
  - `=== signInWithGoogle ===`
  - `Redirect URL: https://www.upscwithnadiya.in/`
  - `OAuth initiated successfully, redirecting to Google`
- [ ] Complete Google authentication
- [ ] Verify console shows:
  - `=== onAuthStateChange ===`
  - `Event: SIGNED_IN`
  - `Session exists: true`
  - `STEP 1 - User found: [your-email]`
  - `STEP 12 - SUCCESS`

### Supabase Dashboard Check
- [ ] Go to Supabase Dashboard → Authentication → Users
- [ ] Verify new user appears after Google sign-in
- [ ] Verify user has Google identity linked
- [ ] Verify `profiles` table has corresponding record
- [ ] Verify `user_roles` table has student role assigned

### Functionality Check
- [ ] User is redirected to dashboard after login
- [ ] User can access protected routes
- [ ] User profile displays correctly
- [ ] Logout works correctly
- [ ] Re-login with Google works (session persistence)

## Troubleshooting

### If "STEP 0 - No session" appears:
1. Check Supabase Dashboard → Authentication → Providers → Google is enabled
2. Check Google Cloud Console redirect URIs match exactly
3. Check Vercel environment variables are set correctly
4. Check browser console for specific error messages

### If "Auth initialization timeout" appears:
1. Check network tab for failed requests to Supabase
2. Check Supabase URL is correct in environment variables
3. Check Supabase service is operational (status.supabase.com)
4. Check if ad-blocker is blocking Supabase requests

### If user appears in auth.users but not in profiles:
1. Check RLS policies on profiles table
2. Check foreign key constraint on user_id
3. Check for database errors in console logs
4. Manually run profile upsert in SQL Editor

### If role is not assigned:
1. Check RLS policies on user_roles table
2. Check foreign key constraint on user_id
3. Verify user_roles table exists
4. Manually run role upsert in SQL Editor

## Local Testing

To test locally before deploying:

1. Set environment variables in `.env.local`:
```env
VITE_SUPABASE_URL=https://naysnsxwazrvxfbtmrbn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

2. Add local redirect to Google Cloud Console:
- `http://localhost:5173/auth/v1/callback`
- `http://localhost:5173/**`

3. Add local redirect to Supabase Dashboard:
- `http://localhost:5173/**`

4. Run dev server:
```bash
npm run dev
```

5. Test Google sign-in at `http://localhost:5173/login`

## Production Rollback

If deployment breaks authentication:

1. Rollback code in Vercel:
   - Go to Vercel → Deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

2. Revert Supabase changes:
   - Disable Google provider temporarily
   - Restore previous redirect URLs if changed

3. Notify users of temporary Google sign-in outage
