/**
 * Cloudflare Worker for Dynamic Open Graph Meta Tags
 * 
 * This worker intercepts requests from social media crawlers (Facebook, Twitter, LinkedIn, etc.)
 * and serves pre-rendered HTML with proper Open Graph meta tags for article pages.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Cloudflare Worker in your Cloudflare dashboard
 * 2. Copy this code into the worker
 * 3. Set the environment variables:
 *    - SUPABASE_URL: Your Supabase project URL
 *    - SUPABASE_ANON_KEY: Your Supabase anon/public key
 *    - SITE_URL: Your production site URL (e.g., https://yourdomain.com)
 *    - SITE_NAME: Your site name (e.g., "বাংলা টাইমস")
 * 4. Add a route to your Cloudflare Pages project that routes /article/* to this worker
 */

// List of known social media and search engine bot user agents
const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'Slackbot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
  'Slurp',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'Sogou',
  'Exabot',
  'ia_archiver',
  'Applebot',
  'redditbot',
  'Embedly',
  'Quora Link Preview',
  'showyoubot',
  'outbrain',
  'vkShare',
  'W3C_Validator',
];

/**
 * Check if the request is from a social media bot
 */
function isSocialMediaBot(userAgent) {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => lowerUA.includes(bot.toLowerCase()));
}

/**
 * Extract article slug/ID from the URL path
 */
function extractArticleId(pathname) {
  // Match /article/:id or /article/:slug patterns
  const match = pathname.match(/\/article\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch article data from Supabase
 */
async function fetchArticleData(articleId, env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return null;
  }
  
  // Try fetching by slug first, then by ID
  let query = `${supabaseUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(articleId)}&select=*&limit=1`;
  
  let response = await fetch(query, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });
  
  if (response.ok) {
    const data = await response.json();
    if (data && data.length > 0) {
      return data[0];
    }
  }
  
  // If not found by slug, try by ID (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(articleId)) {
    query = `${supabaseUrl}/rest/v1/articles?id=eq.${articleId}&select=*&limit=1`;
    
    response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0];
      }
    }
  }
  
  return null;
}

/**
 * Generate HTML with proper Open Graph meta tags
 */
function generateOGHtml(article, siteUrl, siteName, requestUrl) {
  const title = article.title || 'Article';
  const description = article.excerpt || article.title || '';
  const image = article.featured_image || `${siteUrl}/og-default.png`;
  const articleUrl = requestUrl;
  const publishDate = article.publish_date || article.created_at;
  const tags = article.tags || [];
  
  // Extract SEO metadata if available
  let seoTitle = title;
  let seoDescription = description;
  
  if (article.seo_metadata && typeof article.seo_metadata === 'object') {
    seoTitle = article.seo_metadata.title || title;
    seoDescription = article.seo_metadata.description || description;
  }
  
  // Escape HTML entities
  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  const tagsMetaTags = tags.map(tag => 
    `<meta property="article:tag" content="${escapeHtml(tag)}" />`
  ).join('\n    ');
  
  return `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(seoTitle)} | ${escapeHtml(siteName)}</title>
    <meta name="title" content="${escapeHtml(seoTitle)} | ${escapeHtml(siteName)}">
    <meta name="description" content="${escapeHtml(seoDescription)}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(articleUrl)}">
    <meta property="og:title" content="${escapeHtml(seoTitle)}">
    <meta property="og:description" content="${escapeHtml(seoDescription)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta property="og:site_name" content="${escapeHtml(siteName)}">
    <meta property="og:locale" content="bn_BD">
    ${publishDate ? `<meta property="article:published_time" content="${publishDate}">` : ''}
    ${tagsMetaTags}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${escapeHtml(articleUrl)}">
    <meta name="twitter:title" content="${escapeHtml(seoTitle)}">
    <meta name="twitter:description" content="${escapeHtml(seoDescription)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    
    <!-- Redirect to actual page for browsers -->
    <meta http-equiv="refresh" content="0;url=${escapeHtml(articleUrl)}">
    <link rel="canonical" href="${escapeHtml(articleUrl)}">
</head>
<body>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(seoDescription)}</p>
    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" />
    <p>Redirecting to <a href="${escapeHtml(articleUrl)}">${escapeHtml(articleUrl)}</a>...</p>
</body>
</html>`;
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    
    // Only process article pages
    if (!url.pathname.startsWith('/article/')) {
      // Pass through to the origin
      return fetch(request);
    }
    
    // Check if this is a social media bot
    if (!isSocialMediaBot(userAgent)) {
      // Not a bot, pass through to the origin (your SPA)
      return fetch(request);
    }
    
    // Extract article ID from URL
    const articleId = extractArticleId(url.pathname);
    if (!articleId) {
      return fetch(request);
    }
    
    try {
      // Fetch article data from Supabase
      const article = await fetchArticleData(articleId, env);
      
      if (!article) {
        // Article not found, pass through
        return fetch(request);
      }
      
      // Generate OG-enriched HTML
      const siteUrl = env.SITE_URL || url.origin;
      const siteName = env.SITE_NAME || 'বাংলা টাইমস';
      const html = generateOGHtml(article, siteUrl, siteName, request.url);
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (error) {
      console.error('Error generating OG tags:', error);
      // On error, pass through to origin
      return fetch(request);
    }
  },
};
