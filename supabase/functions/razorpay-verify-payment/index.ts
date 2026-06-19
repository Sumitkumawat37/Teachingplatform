import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.208.0/crypto/mod.ts"
import { encodeHex } from "https://deno.land/std@0.208.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get Razorpay key secret from environment variables
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate expected signature
    const expectedSignature = `${razorpay_order_id}|${razorpay_payment_id}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(keySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(expectedSignature))
    const generatedSignature = encodeHex(signature)

    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ 
        error: 'Invalid signature',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Signature is valid, payment verified
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Payment verified successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to verify payment',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
