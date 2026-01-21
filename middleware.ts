import { next, rewrite } from '@vercel/edge';

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
];

/**
 * Check if the request is from a social media bot
 */
function isSocialMediaBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => lowerUA.includes(bot.toLowerCase()));
}

export const config = {
  // Only run middleware on article pages
  matcher: '/article/:path*',
};

export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent');
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if this is a social media bot
  if (isSocialMediaBot(userAgent)) {
    // Extract article slug from path
    const match = pathname.match(/\/article\/([^?\/]+)/);
    const articleSlug = match ? decodeURIComponent(match[1]) : null;

    if (articleSlug) {
      // Rewrite bot requests to the OG meta API
      const ogUrl = new URL('/api/og-meta', request.url);
      ogUrl.searchParams.set('slug', articleSlug);
      ogUrl.searchParams.set('force', '1'); // Force OG HTML generation
      
      // Use rewrite to serve OG HTML while keeping the original URL
      return rewrite(ogUrl);
    }
  }

  // For regular users, continue to the React app
  return next();
}
