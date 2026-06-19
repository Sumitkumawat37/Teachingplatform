# Security Headers Configuration

## Vercel Configuration

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://apis.google.com https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://www.google.com https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com; frame-src 'self' https://www.google.com https://checkout.razorpay.com https://www.googletagmanager.com; media-src 'self' https: blob:; object-src 'none'; base-uri 'self'; form-action 'self';"
        }
      ]
    }
  ]
}
```

## vite.config.ts Security Headers

Add to `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
```

## Security Headers Explained

### X-DNS-Prefetch-Control
Controls DNS prefetching. Set to "on" to enable.

### Strict-Transport-Security (HSTS)
Enforces HTTPS connections. Max age of 2 years with subdomain inclusion and preload.

### X-Frame-Options
Prevents clickjacking. Set to SAMEORIGIN to only allow framing from same origin.

### X-Content-Type-Options
Prevents MIME type sniffing. Set to nosniff.

### X-XSS-Protection
Enables XSS filtering. Set to "1; mode=block" for maximum protection.

### Referrer-Policy
Controls how much referrer information is sent. strict-origin-when-cross-origin is recommended.

### Permissions-Policy
Controls which browser features can be used. Disables camera, microphone, and geolocation by default.

### Content-Security-Policy (CSP)
Controls which resources can be loaded. Strict CSP prevents XSS attacks.

## CSP Directives Explained

- `default-src 'self'`: Default policy allows only same-origin resources
- `script-src`: Allows scripts from self, inline, eval, Google, Razorpay, GTM, GA
- `style-src`: Allows styles from self, inline, Google Fonts
- `img-src`: Allows images from self, data URLs, HTTPS, blobs
- `font-src`: Allows fonts from self, Google Fonts
- `connect-src`: Allows API calls to Supabase, Google, Razorpay, GTM, GA
- `frame-src`: Allows frames from self, Google, Razorpay, GTM
- `media-src`: Allows media from self, HTTPS, blobs
- `object-src`: Disables plugins (none)
- `base-uri`: Restricts base URL to same origin
- `form-action`: Restricts form submissions to same origin
