// Edge-compatible Open Graph meta tag generator for social media crawlers

export const config = {
  runtime: 'edge',
};

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
  'redditbot',
  'Embedly',
  'vkShare',
  'Applebot',
  'Slurp',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'Sogou',
  'ia_archiver',
  'Quora Link Preview',
  'showyoubot',
  'outbrain',
  'W3C_Validator',
];

/**
 * Check if the request is from a social media bot
 */
function isSocialMediaBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => lowerUA.includes(bot.toLowerCase()));
}

/**
 * Escape HTML entities for safe rendering
 */
function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Ensure image URL is absolute
 */
function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

interface SiteSettings {
  site_name: string;
  site_description?: string | null;
  logo?: string | null;
  favicon?: string | null;
}

/**
 * Fetch site settings from Supabase
 */
async function fetchSiteSettings(supabaseUrl: string, supabaseKey: string): Promise<SiteSettings | null> {
  try {
    const query = `${supabaseUrl}/rest/v1/settings?select=site_name,site_description,logo,favicon&order=id.asc&limit=1`;
    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

/**
 * Generate HTML with proper Open Graph meta tags
 */
function generateOGHtml(
  article: any,
  siteUrl: string,
  settings: SiteSettings | null,
  articleSlug: string
): string {
  const siteName = settings?.site_name || 'বাংলা টাইমস';
  const siteDescription = settings?.site_description || '';
  const defaultImage = `${siteUrl}/og-default.png`;
  const logoUrl = ensureAbsoluteUrl(settings?.logo, siteUrl, `${siteUrl}/logo.png`);
  const faviconUrl = ensureAbsoluteUrl(settings?.favicon, siteUrl, `${siteUrl}/favicon.ico`);
  
  const title = article.title || 'Article';
  const description = article.excerpt || article.title || '';
  const image = ensureAbsoluteUrl(article.featured_image, siteUrl, defaultImage);
  const articleUrl = `${siteUrl}/article/${articleSlug}`;
  const publishDate = article.publish_date || article.created_at;
  const tags = article.tags || [];

  // Extract SEO metadata if available
  let seoTitle = title;
  let seoDescription = description;

  if (article.seo_metadata && typeof article.seo_metadata === 'object') {
    seoTitle = article.seo_metadata.title || title;
    seoDescription = article.seo_metadata.description || description;
  }

  // Truncate description to optimal length for social media
  const truncatedDescription = seoDescription.length > 160 
    ? seoDescription.substring(0, 157) + '...' 
    : seoDescription;

  const tagsMetaTags = tags
    .slice(0, 5) // Limit to 5 tags
    .map((tag: string) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`)
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Favicon from Supabase settings -->
    <link rel="icon" type="image/x-icon" href="${escapeHtml(faviconUrl)}">
    <link rel="shortcut icon" href="${escapeHtml(faviconUrl)}">
    <link rel="apple-touch-icon" href="${escapeHtml(logoUrl)}">
    
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
    
    <!-- WhatsApp specific -->
    <meta property="og:image:type" content="image/jpeg">
    
    <!-- LinkedIn specific -->
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="627">
    
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
          "url": "${escapeHtml(logoUrl)}"
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

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent');
  
  // Extract slug from query params or path
  let articleSlug = url.searchParams.get('slug') || url.searchParams.get('id');
  
  // Also check if it's coming from a rewrite
  const pathname = url.pathname;
  if (!articleSlug && pathname.includes('/article/')) {
    const match = pathname.match(/\/article\/([^?\/]+)/);
    if (match) {
      articleSlug = decodeURIComponent(match[1]);
    }
  }

  // For bot requests or when force param is present, serve OG HTML
  // Regular users coming from middleware will have 'force' param set
  const isBot = isSocialMediaBot(userAgent);
  const forceOG = url.searchParams.has('force');
  
  // If neither a bot nor force param, redirect to article page
  if (!isBot && !forceOG) {
    const articlePath = articleSlug ? `/article/${articleSlug}` : '/';
    return Response.redirect(new URL(articlePath, url.origin).toString(), 302);
  }
  
  if (!articleSlug) {
    return new Response(JSON.stringify({ error: 'Article slug or id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || url.origin;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase config. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.');
    return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch site settings for logo/favicon
    const settings = await fetchSiteSettings(supabaseUrl, supabaseKey);
    
    // Try fetching article by slug first
    const query = `${supabaseUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(articleSlug)}&status=eq.published&select=*&limit=1`;
    
    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      console.error('Supabase error:', response.status, await response.text());
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      // Try by ID if slug didn't work (check if it's a UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(articleSlug)) {
        const idQuery = `${supabaseUrl}/rest/v1/articles?id=eq.${articleSlug}&status=eq.published&select=*&limit=1`;
        const idResponse = await fetch(idQuery, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });

        if (idResponse.ok) {
          const idData = await idResponse.json();
          if (idData && idData.length > 0) {
            const html = generateOGHtml(idData[0], siteUrl, settings, idData[0].slug || articleSlug);
            return new Response(html, {
              status: 200,
              headers: {
                'Content-Type': 'text/html;charset=UTF-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
              },
            });
          }
        }
      }
      
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const html = generateOGHtml(data[0], siteUrl, settings, articleSlug);
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
