# Universal Open Graph Solution for React SPAs

This folder contains solutions for making Open Graph meta tags work on **any hosting platform** when sharing articles on social media.

## The Problem

Social media crawlers (Facebook, Twitter, LinkedIn, WhatsApp, Telegram, etc.) don't execute JavaScript. They only read the initial HTML response. Since React SPAs render content client-side, these crawlers see only the default meta tags from `index.html`, not the dynamic article-specific tags.

## Solutions by Platform

| Platform | Files to Use |
|----------|--------------|
| 🔵 **Cloudflare Pages** | `cloudflare-worker/og-worker.js` |
| 🟢 **Netlify** | `netlify/edge-functions/og-redirect.ts` + `netlify.toml` |
| ⚫ **Vercel** | `api/og-meta.ts` + `vercel.json` |
| 🟣 **Any Platform** | `supabase/functions/og-meta/` (Universal) |

---

# 🔵 Cloudflare Pages Setup

## 1. Create the Worker

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Create Worker**
3. Name your worker (e.g., `og-meta-worker`)
4. Copy the contents of `og-worker.js` into the worker editor
5. Click **Save and Deploy**

## 2. Configure Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `SITE_URL` | Your production site URL | `https://yourdomain.com` |
| `SITE_NAME` | Your site name (Bengali) | `বাংলা টাইমস` |

## 3. Add Route

Add route `*/article/*` in Cloudflare Pages → Settings → Functions pointing to your worker.

---

# 🟢 Netlify Setup

## 1. Deploy Files

The `netlify.toml` and `netlify/edge-functions/og-redirect.ts` are already in your project.

## 2. Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `SITE_URL` | Your production URL |
| `SITE_NAME` | বাংলা টাইমস |

## 3. Deploy

Push to your Git repository - Netlify will automatically use the edge function.

---

# ⚫ Vercel Setup

## 1. Deploy Files

The `vercel.json` and `api/og-meta.ts` are already in your project.

## 2. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |
| `SITE_URL` | Your production URL |
| `SITE_NAME` | বাংলা টাইমস |

## 3. Configure Middleware (Optional)

For automatic bot detection, create `middleware.ts` in your project root.

---

# 🟣 Universal Supabase Edge Function

This works with **ANY** hosting platform!

## 1. Deploy the Edge Function

```bash
supabase functions deploy og-meta --no-verify-jwt
```

## 2. Set Secrets

```bash
supabase secrets set SITE_URL=https://yourdomain.com
supabase secrets set SITE_NAME="বাংলা টাইমস"
```

## 3. Use from Any Platform

Your OG endpoint will be:
```
https://YOUR_PROJECT.supabase.co/functions/v1/og-meta?slug=article-slug
```

Configure your hosting platform to redirect bot traffic to this URL for `/article/*` paths.

---

# Testing Your Setup

### Facebook Debugger
https://developers.facebook.com/tools/debug/

### Twitter Card Validator
https://cards-dev.twitter.com/validator

### LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/

### Manual Bot Simulation
```bash
curl -H "User-Agent: facebookexternalhit/1.1" https://yourdomain.com/article/your-slug
```

---

# Supported Bots

- Facebook (facebookexternalhit, Facebot)
- Twitter (Twitterbot)
- LinkedIn (LinkedInBot)
- WhatsApp
- Telegram (TelegramBot)
- Discord (Discordbot)
- Pinterest
- Slack (Slackbot)
- Reddit (redditbot)
- Google (Googlebot)
- And more...

---

# Troubleshooting

### OG tags still not showing
1. Clear cache using platform debuggers above
2. Verify Supabase credentials
3. Check edge function/worker logs

### Article not found
1. Ensure article status is "published"
2. Verify slug matches URL

### CORS errors
The Supabase edge function includes CORS headers for cross-origin requests.
