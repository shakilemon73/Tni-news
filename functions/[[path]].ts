/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Pages Function for Dynamic Open Graph Meta Tags
 * 
 * This function intercepts requests from social media crawlers
 * and serves pre-rendered HTML with proper Open Graph meta tags.
 * 
 * Environment Variables (set in Cloudflare Pages dashboard):
 *   - SUPABASE_URL: Your Supabase project URL
 *   - SUPABASE_ANON_KEY: Your Supabase anon/public key
 *   - SITE_URL: Your production site URL
 *   - SITE_NAME: Your site name (বাংলা টাইমস)
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SITE_URL?: string;
  SITE_NAME?: string;
}

// Social media and search engine bot user agents
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

function isSocialMediaBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => lowerUA.includes(bot.toLowerCase()));
}

function extractArticleSlug(pathname: string): string | null {
  const match = pathname.match(/\/article\/([^\/\?]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  featured_image?: string;
  publish_date?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  seo_metadata?: {
    title?: string;
    description?: string;
  };
}

async function fetchArticleData(articleSlug: string, env: Env): Promise<Article | null> {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured');
    return null;
  }
  
  // Try fetching by slug first
  let query = `${supabaseUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(articleSlug)}&status=eq.published&select=*&limit=1`;
  
  let response = await fetch(query, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });
  
  if (response.ok) {
    const data = await response.json() as Article[];
    if (data && data.length > 0) {
      return data[0];
    }
  }
  
  // If not found by slug, try by UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(articleSlug)) {
    query = `${supabaseUrl}/rest/v1/articles?id=eq.${articleSlug}&status=eq.published&select=*&limit=1`;
    
    response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json() as Article[];
      if (data && data.length > 0) {
        return data[0];
      }
    }
  }
  
  return null;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureAbsoluteUrl(url: string | undefined, siteUrl: string): string {
  if (!url) return `${siteUrl}/og-default.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function generateOGHtml(article: Article, siteUrl: string, siteName: string, requestUrl: string): string {
  const title = article.title || 'Article';
  const description = article.excerpt || article.title || '';
  const image = ensureAbsoluteUrl(article.featured_image, siteUrl);
  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const publishDate = article.publish_date || article.created_at;
  const tags = article.tags || [];
  
  let seoTitle = title;
  let seoDescription = description;
  
  if (article.seo_metadata && typeof article.seo_metadata === 'object') {
    seoTitle = article.seo_metadata.title || title;
    seoDescription = article.seo_metadata.description || description;
  }
  
  // Truncate description to optimal length
  const truncatedDescription = seoDescription.length > 160 
    ? seoDescription.substring(0, 157) + '...' 
    : seoDescription;
  
  const tagsMetaTags = tags.slice(0, 5).map(tag => 
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
    <meta name="description" content="${escapeHtml(truncatedDescription)}">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(articleUrl)}">
    <meta property="og:title" content="${escapeHtml(seoTitle)}">
    <meta property="og:description" content="${escapeHtml(truncatedDescription)}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:secure_url" content="${escapeHtml(image)}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta property="og:site_name" content="${escapeHtml(siteName)}">
    <meta property="og:locale" content="bn_BD">
    ${publishDate ? `<meta property="article:published_time" content="${publishDate}">` : ''}
    ${article.updated_at ? `<meta property="article:modified_time" content="${article.updated_at}">` : ''}
    ${tagsMetaTags}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${escapeHtml(articleUrl)}">
    <meta name="twitter:title" content="${escapeHtml(seoTitle)}">
    <meta name="twitter:description" content="${escapeHtml(truncatedDescription)}">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:site" content="@banglatimes">
    
    <!-- WhatsApp / LinkedIn -->
    <meta property="og:image:type" content="image/jpeg">
    
    <!-- Redirect to actual page for browsers -->
    <meta http-equiv="refresh" content="0;url=${escapeHtml(articleUrl)}">
    <link rel="canonical" href="${escapeHtml(articleUrl)}">
    
    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${escapeHtml(seoTitle).replace(/"/g, '\\"')}",
      "description": "${escapeHtml(truncatedDescription).replace(/"/g, '\\"')}",
      "image": ["${escapeHtml(image)}"],
      "datePublished": "${publishDate || ''}",
      "dateModified": "${article.updated_at || publishDate || ''}",
      "publisher": {
        "@type": "Organization",
        "name": "${escapeHtml(siteName)}",
        "logo": {
          "@type": "ImageObject",
          "url": "${siteUrl}/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${escapeHtml(articleUrl)}"
      }
    }
    </script>
</head>
<body>
    <article>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(truncatedDescription)}</p>
      <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" width="1200" height="630" />
      <p>Redirecting to <a href="${escapeHtml(articleUrl)}">${escapeHtml(articleUrl)}</a>...</p>
    </article>
</body>
</html>`;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  
  // Only intercept article pages for bots
  if (!url.pathname.startsWith('/article/')) {
    return next();
  }
  
  // If not a social media bot, serve the SPA
  if (!isSocialMediaBot(userAgent)) {
    return next();
  }
  
  // Extract article slug
  const articleSlug = extractArticleSlug(url.pathname);
  if (!articleSlug) {
    return next();
  }
  
  try {
    const article = await fetchArticleData(articleSlug, env);
    
    if (!article) {
      return next();
    }
    
    const siteUrl = env.SITE_URL || url.origin;
    const siteName = env.SITE_NAME || 'বাংলা টাইমস';
    const html = generateOGHtml(article, siteUrl, siteName, request.url);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating OG tags:', error);
    return next();
  }
};
