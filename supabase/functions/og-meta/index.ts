import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  'Slurp',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'Applebot',
  'redditbot',
  'Embedly',
  'vkShare',
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
 * Escape HTML entities
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
function ensureAbsoluteUrl(url: string | null | undefined, siteUrl: string): string {
  if (!url) return `${siteUrl}/og-default.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Generate HTML with proper Open Graph meta tags
 */
function generateOGHtml(
  article: any,
  siteUrl: string,
  siteName: string,
  articleSlug: string
): string {
  const title = article.title || 'Article';
  const description = article.excerpt || article.title || '';
  const image = ensureAbsoluteUrl(article.featured_image, siteUrl);
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

  // Truncate description to optimal length
  const truncatedDescription = seoDescription.length > 160 
    ? seoDescription.substring(0, 157) + '...' 
    : seoDescription;

  const tagsMetaTags = tags
    .slice(0, 5)
    .map((tag: string) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`)
    .join('\n    ');

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const articleSlug = url.searchParams.get("slug");
    const articleId = url.searchParams.get("id");
    const siteUrl = url.searchParams.get("site_url") || Deno.env.get("SITE_URL") || "https://example.com";
    const siteName = url.searchParams.get("site_name") || Deno.env.get("SITE_NAME") || "বাংলা টাইমস";

    if (!articleSlug && !articleId) {
      return new Response(
        JSON.stringify({ error: "Article slug or id is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch article by slug or id
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "published");

    if (articleSlug) {
      query = query.eq("slug", articleSlug);
    } else if (articleId) {
      query = query.eq("id", articleId);
    }

    const { data: article, error } = await query.single();

    if (error || !article) {
      // Return a basic fallback HTML for not found
      return new Response(
        JSON.stringify({ error: "Article not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Generate OG HTML
    const html = generateOGHtml(article, siteUrl, siteName, articleSlug || article.slug);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
