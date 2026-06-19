# Razorpay Live Credentials Update

## New Live Credentials

**Live API Key:** `rzp_live_T2zp6fcK4ON1f0`
**Live Key Secret:** `RNwIn1flyEiGt66FrbC9TFVY`

## Files to Update

### 1. Environment Variables (.env.local)

Add or update the following in your `.env.local` file:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_T2zp6fcK4ON1f0
```

### 2. Supabase Edge Functions Environment Variables

Update the environment variables in Supabase Dashboard:

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. For each function (razorpay-create-order, razorpay-verify-payment), add:
   - `RAZORPAY_KEY_ID`: `rzp_live_T2zp6fcK4ON1f0`
   - `RAZORPAY_KEY_SECRET`: `RNwIn1flyEiGt66FrbC9TFVY`

### 3. Vercel Environment Variables

Update the environment variables in Vercel Dashboard:

1. Go to Vercel Dashboard
2. Navigate to Project Settings → Environment Variables
3. Add or update:
   - `VITE_RAZORPAY_KEY_ID`: `rzp_live_T2zp6fcK4ON1f0`

## Steps to Apply

1. **Update Local Environment**
   ```bash
   # Edit .env.local
   VITE_RAZORPAY_KEY_ID=rzp_live_T2zp6fcK4ON1f0
   ```

2. **Update Supabase Edge Functions**
   - Go to Supabase Dashboard
   - Navigate to Edge Functions
   - Select razorpay-create-order
   - Add environment variables:
     - RAZORPAY_KEY_ID = rzp_live_T2zp6fcK4ON1f0
     - RAZORPAY_KEY_SECRET = RNwIn1flyEiGt66FrbC9TFVY
   - Repeat for razorpay-verify-payment

3. **Update Vercel Environment**
   - Go to Vercel Dashboard
   - Navigate to Project Settings → Environment Variables
   - Add VITE_RAZORPAY_KEY_ID = rzp_live_T2zp6fcK4ON1f0
   - Redeploy the application

4. **Test Payment Flow**
   - Test the payment flow on staging/production
   - Verify order creation
   - Verify payment verification
   - Check enrollment creation

## Security Notes

- **Never commit the live key secret to version control**
- **The key secret should only be stored in Supabase Edge Functions environment variables**
- **The public key (VITE_RAZORPAY_KEY_ID) is safe to expose in client-side code**
- **Rotate credentials if they are ever compromised**

## Verification

After updating credentials, verify:

1. Order creation works
2. Payment verification works
3. Enrollments are created after successful payment
4. Mentoring payment works
5. No errors in Supabase Edge Functions logs
