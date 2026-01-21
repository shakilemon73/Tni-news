import type { Context } from "https://edge.netlify.com";

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
 * Extract article slug from URL path
 */
function extractArticleSlug(pathname: string): string | null {
  const match = pathname.match(/\/article\/([^\/]+)/);
  return match ? match[1] : null;
}

export default async function handler(req: Request, context: Context) {
  const url = new URL(req.url);
  const userAgent = req.headers.get("User-Agent");

  // Only process article pages
  if (!url.pathname.startsWith("/article/")) {
    return context.next();
  }

  // Check if this is a social media bot
  if (!isSocialMediaBot(userAgent)) {
    return context.next();
  }

  const articleSlug = extractArticleSlug(url.pathname);
  if (!articleSlug) {
    return context.next();
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
  const siteUrl = Deno.env.get("SITE_URL") || url.origin;
  const siteName = Deno.env.get("SITE_NAME") || "বাংলা টাইমস";

  if (!supabaseUrl) {
    console.error("Supabase URL not configured");
    return context.next();
  }

  try {
    // Redirect to the Supabase edge function for OG meta generation
    const ogUrl = `${supabaseUrl}/functions/v1/og-meta?slug=${encodeURIComponent(articleSlug)}&site_url=${encodeURIComponent(siteUrl)}&site_name=${encodeURIComponent(siteName)}`;
    
    const response = await fetch(ogUrl);
    
    if (response.ok) {
      const html = await response.text();
      return new Response(html, {
        headers: {
          "Content-Type": "text/html;charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching OG meta:", error);
  }

  return context.next();
}

export const config = {
  path: "/article/*",
};
