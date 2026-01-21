# Deployment Guide

This guide covers deploying your বাংলা টাইমস news portal to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
1. Supabase project connected (for database, auth, storage)
2. Environment variables ready

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Your Supabase anon/public key |
| `SITE_URL` | For OG | Your production site URL |
| `SITE_NAME` | For OG | Site name (বাংলা টাইমস) |

---

## 🔵 Cloudflare Pages (Recommended)

### Quick Deploy

1. Connect your GitHub repository to Cloudflare Pages

2. **CRITICAL: Override auto-detected build settings in Dashboard:**
   
   Go to **Settings → Build & Deployment → Build configurations** and set:
   
   | Setting | Value |
   |---------|-------|
   | Build command | `npm ci && npm run build` |
   | Build output directory | `dist` |
   
   Then go to **Settings → Environment Variables** and add:
   
   | Variable | Value |
   |----------|-------|
   | `SKIP_DEPENDENCY_INSTALL` | `true` |
   | `NODE_VERSION` | `18` |
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | Your Supabase anon/public key |
   | `SITE_URL` | Your production URL (e.g., https://yourdomain.com) |
   | `SITE_NAME` | বাংলা টাইমস |

3. **Why these settings?** The project has a `bun.lockb` file which triggers Cloudflare's auto-detection of Bun. Setting `SKIP_DEPENDENCY_INSTALL=true` prevents the `bun install --frozen-lockfile` error and lets `npm ci` handle dependencies.

4. Deploy - Open Graph is handled automatically by Pages Functions

### Files Used
- `wrangler.toml` - Cloudflare Pages configuration
- `functions/[[path]].ts` - Pages Function for OG meta tags (auto-deployed)
- `functions/tsconfig.json` - TypeScript config for Pages Functions
- `public/_redirects` - SPA routing fallback

---

## 🟢 Netlify

### Quick Deploy

1. Connect your GitHub repository to Netlify
2. Build settings are auto-configured via `netlify.toml`
3. Add environment variables in Site settings → Environment variables

### Files Used
- `netlify.toml` - Build config + edge function routing
- `netlify/edge-functions/og-redirect.ts` - OG meta tags
- `public/_redirects` - SPA routing fallback

---

## ⚫ Vercel

### Quick Deploy

1. Import your GitHub repository to Vercel
2. Framework will be auto-detected as Vite
3. Add environment variables in Project Settings → Environment Variables

### Files Used
- `vercel.json` - Build config + API routing
- `api/og-meta.ts` - OG meta serverless function

---

## 🟡 GitHub Pages

### Setup

1. Add to `vite.config.ts`:
```ts
export default defineConfig({
  base: '/your-repo-name/',
  // ... rest of config
})
```

2. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. Enable GitHub Pages in repository Settings → Pages

⚠️ **Note**: GitHub Pages doesn't support server-side OG tags. Use the Supabase Edge Function approach.

---

## 🔴 Firebase Hosting

### Setup

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. Deploy: `firebase deploy`

---

## 🟠 AWS Amplify

### Setup

1. Connect your repository in AWS Amplify Console
2. Configure build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. Add environment variables in App settings → Environment variables

---

## Open Graph for Social Sharing

For all platforms, you need server-side OG tag generation for social media sharing to work properly.

### Universal Solution (Works Everywhere)

Deploy the Supabase Edge Function:

```bash
# Deploy the og-meta function
supabase functions deploy og-meta --no-verify-jwt

# Set required secrets
supabase secrets set SITE_URL=https://yourdomain.com
supabase secrets set SITE_NAME="বাংলা টাইমস"
```

Then configure your hosting platform to redirect bot traffic to:
```
https://YOUR_PROJECT.supabase.co/functions/v1/og-meta?slug=ARTICLE_SLUG
```

See `cloudflare-worker/README.md` for detailed platform-specific instructions.

---

## Post-Deployment Checklist

- [ ] Verify site loads correctly
- [ ] Test user registration/login
- [ ] Test article creation in admin panel
- [ ] Test social sharing with [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (usually automatic)
- [ ] Set up monitoring/analytics
