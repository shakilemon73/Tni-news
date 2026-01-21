import { supabase } from '../supabase';
import { Article } from '@/types/database';

// Define the filter interface for better type safety
interface ArticleFilters {
  status?: string;
  category_id?: string;
  search?: string;
}

// Get all articles with optional filters
export const getArticles = async (filters: ArticleFilters = {}) => {
  let query = supabase.from('articles').select('*');
  
  // Apply filters if provided
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.category_id) {
    query = query.contains('category_ids', [filters.category_id]);
  }
  
  if (filters.search) {
    // Search in title, excerpt, and content
    query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }
  
  // Order by publish date (newest first) or created date if no publish date
  query = query.order('publish_date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

// Get featured articles
export const getFeaturedArticles = async (limit = 5) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
};

// Get articles by category
export const getArticlesByCategory = async (categoryId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .contains('category_ids', [categoryId])
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data || [];
};

// Get a single article by id or slug
export const getArticle = async (idOrSlug: string) => {
  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUUID = uuidRegex.test(idOrSlug);
  
  let data = null;
  let error = null;
  
  // Try to find by ID first if it looks like a UUID
  if (isUUID) {
    const result = await supabase
      .from('articles')
      .select('*')
      .eq('id', idOrSlug)
      .maybeSingle();
    
    data = result.data;
    error = result.error;
  }
  
  // If not found by ID (or not a UUID), try by slug
  if (!data && !error) {
    const result = await supabase
      .from('articles')
      .select('*')
      .eq('slug', idOrSlug)
      .maybeSingle();
      
    data = result.data;
    error = result.error;
  }
  
  if (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
  
  return data;
};

// Check if a slug already exists (used by admin/editor UI)
export const slugExists = async (slug: string): Promise<boolean> => {
  const cleaned = slug.trim();
  if (!cleaned) return false;

  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', cleaned)
    .limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
};

// Generate next sequential slug like "article-1", "article-2", ...
// NOTE: This is only meant for admin/editor article creation flows.
export const getNextSequentialArticleSlug = async (prefix = 'article'): Promise<string> => {
  const safePrefix = prefix.trim() || 'article';

  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .like('slug', `${safePrefix}-%`);

  if (error) throw error;

  let max = 0;
  for (const row of data || []) {
    const s = (row as { slug?: string }).slug;
    if (!s) continue;
    const match = s.match(new RegExp(`^${safePrefix}-(\\d+)$`));
    if (!match) continue;
    const n = Number.parseInt(match[1], 10);
    if (Number.isFinite(n) && n > max) max = n;
  }

  return `${safePrefix}-${max + 1}`;
};

// Create a new article
export const createArticle = async (articleData: Partial<Article>) => {
  // Ensure required fields
  if (!articleData.title || !articleData.slug || !articleData.author_id) {
    throw new Error('Title, slug and author_id are required');
  }

  // Validate title length
  if (articleData.title.length > 500) {
    throw new Error('Title must be less than 500 characters');
  }

  // Validate slug - allow Bengali chars, alphanumeric, and hyphens
  const slugRegex = /^[\u0980-\u09FFa-z0-9-]+$/;
  if (!slugRegex.test(articleData.slug)) {
    throw new Error('Slug can only contain Bengali characters, lowercase letters, numbers, and hyphens');
  }

  const insertData = {
    title: articleData.title.trim(),
    slug: articleData.slug.trim(),
    content: articleData.content || '',
    excerpt: articleData.excerpt?.trim() || null,
    author_id: articleData.author_id,
    category_ids: articleData.category_ids || [],
    tags: articleData.tags || [],
    featured_image: articleData.featured_image || null,
    image_credit: articleData.image_credit?.trim() || null,
    gallery_images: articleData.gallery_images || [],
    gallery_credits: articleData.gallery_credits || [],
    status: articleData.status || 'draft',
    publish_date: articleData.publish_date || new Date().toISOString(),
    seo_metadata: articleData.seo_metadata || { title: '', description: '', keywords: [] },
    views: articleData.views || 0
  };

  const { data, error } = await supabase
    .from('articles')
    .insert(insertData)
    .select()
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

// Update an existing article
export const updateArticle = async (id: string, articleData: Partial<Article>) => {
  const { data, error } = await supabase
    .from('articles')
    .update(articleData)
    .eq('id', id)
    .select()
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

// Delete an article
export const deleteArticle = async (id: string) => {
  const { data, error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

// Implement the bulk action for articles
export const bulkActionArticles = async (ids: string[], action: string) => {
  let status;
  
  switch (action) {
    case 'publish':
      status = 'published';
      break;
    case 'archive':
      status = 'archived';
      break;
    case 'draft':
      status = 'draft';
      break;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
  
  const { data, error } = await supabase
    .from('articles')
    .update({ status })
    .in('id', ids)
    .select();
    
  if (error) throw error;
  return data || [];
};

// Increment article views
export const incrementArticleViews = async (id: string) => {
  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('views')
    .eq('id', id)
    .single();
    
  if (fetchError) throw fetchError;
  
  const newViewCount = (article?.views || 0) + 1;
  
  const { data, error } = await supabase
    .from('articles')
    .update({ views: newViewCount })
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data;
};
