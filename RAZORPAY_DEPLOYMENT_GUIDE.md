# Razorpay Integration Deployment Guide

Since Supabase CLI is not installed on this machine, follow these manual steps to complete the Razorpay integration.

## Step 1: Deploy Edge Functions via Supabase Dashboard

### Option A: Using Supabase CLI (Recommended)
If you have access to a machine with Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref naysnsxwazrvxfbtmrbn

# Deploy the edge functions
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment

# Set environment variables
supabase secrets set RAZORPAY_KEY_ID=rzp_test_T2lnMYwkSird1N
supabase secrets set RAZORPAY_KEY_SECRET=tCMIf4xz3wcX0tys6jocpZFt
```

### Option B: Manual Deployment via Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `naysnsxwazrvxfbtmrbn`

2. **Create Edge Function: razorpay-create-order**
   - Go to Edge Functions → Create new function
   - Function name: `razorpay-create-order`
   - Copy the content from `supabase/functions/razorpay-create-order/index.ts`
   - Paste it into the function editor
   - Click Deploy

3. **Create Edge Function: razorpay-verify-payment**
   - Go to Edge Functions → Create new function
   - Function name: `razorpay-verify-payment`
   - Copy the content from `supabase/functions/razorpay-verify-payment/index.ts`
   - Paste it into the function editor
   - Click Deploy

4. **Set Environment Variables**
   - Go to Edge Functions → Settings
   - Add environment variable:
     - Name: `RAZORPAY_KEY_ID`
     - Value: `rzp_test_T2lnMYwkSird1N`
   - Add environment variable:
     - Name: `RAZORPAY_KEY_SECRET`
     - Value: `tCMIf4xz3wcX0tys6jocpZFt`
   - Click Save

## Step 2: Add Frontend Environment Variable to Vercel

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variable**
   - Go to Settings → Environment Variables
   - Add new variable:
     - Name: `VITE_RAZORPAY_KEY_ID`
     - Value: `rzp_test_T2lnMYwkSird1N`
     - Environment: Production, Preview, Development
   - Click Save

3. **Redeploy**
   - Go to Deployments
   - Click Redeploy to apply the new environment variable

## Step 3: Add Razorpay Checkout Component to a Page

Add the checkout component to any page where you want to accept payments. For example, in `CourseDetailPage.tsx`:

```tsx
import { RazorpayCheckout } from '@/components/RazorpayCheckout';

// In your component JSX:
<RazorpayCheckout 
  amount={course.price} // Amount in INR
  onSuccess={(paymentId, orderId) => {
    console.log('Payment successful:', paymentId, orderId);
    // Handle success - update database, show success message, etc.
    // You might want to call Supabase to update course enrollment
  }}
  onFailure={(error) => {
    console.error('Payment failed:', error);
    // Handle failure - show error message
  }}
  buttonText="Enroll Now"
/>
```

## Step 4: Test the Integration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to the page with the checkout button**

3. **Click the Pay button**
   - Razorpay checkout modal should open
   - Use test card details:
     - Card Number: 4111 1111 1111 1111
     - Expiry: Any future date (e.g., 12/25)
     - CVV: Any 3 digits (e.g., 123)
     - OTP: Any 6 digits (e.g., 123456)

4. **Verify Payment**
   - Check browser console for success/failure messages
   - Verify the `onSuccess` callback is triggered
   - Check Supabase Edge Functions logs for any errors

## Step 5: Verify Edge Functions are Working

1. **Test create-order function**
   ```bash
   curl -X POST https://naysnsxwazrvxfbtmrbn.supabase.co/functions/v1/razorpay-create-order \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "currency": "INR", "receipt": "test_order"}'
   ```

2. **Test verify-payment function**
   ```bash
   curl -X POST https://naysnsxwazrvxfbtmrbn.supabase.co/functions/v1/razorpay-verify-payment \
     -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"razorpay_order_id": "test", "razorpay_payment_id": "test", "razorpay_signature": "test"}'
   ```

## Troubleshooting

### Edge Function Not Found
- Verify the function name matches exactly
- Check Supabase Dashboard → Edge Functions to confirm deployment

### CORS Errors
- The edge functions already have CORS headers configured
- If you still see CORS errors, check the Supabase project settings

### Environment Variables Not Working
- Verify variables are set in Supabase Edge Functions settings
- Redeploy the edge functions after setting variables
- Check the function logs for errors

### Payment Verification Fails
- Ensure RAZORPAY_KEY_SECRET is set correctly in Supabase
- Check the signature generation logic in the verify function
- Verify the payment was actually successful in Razorpay dashboard

## Production Checklist

Before going live with Razorpay:

- [ ] Switch from test mode to live mode in Razorpay dashboard
- [ ] Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET with live credentials
- [ ] Update VITE_RAZORPAY_KEY_ID with live key ID
- [ ] Test with real payment (small amount)
- [ ] Set up webhooks in Razorpay for payment notifications
- [ ] Implement database updates on successful payment
- [ ] Add error handling and user feedback
- [ ] Test on mobile devices
- [ ] Verify all edge cases (payment failure, cancellation, etc.)
