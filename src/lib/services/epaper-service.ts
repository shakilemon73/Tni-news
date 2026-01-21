import { supabase } from '../supabase';
import { Article, Category } from '@/types/database';

export interface EPaper {
  id: string;
  title: string;
  publish_date: string;
  pdf_url: string;
  thumbnail: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface GenerateEPaperOptions {
  date: string;
  categoryIds?: string[];
  articleLimit?: number;
}

// Get all e-papers
export const getEPapers = async (status?: string): Promise<EPaper[]> => {
  let query = supabase
    .from('epapers')
    .select('*')
    .order('publish_date', { ascending: false });
  
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return (data as EPaper[]) || [];
};

// Get a single e-paper
export const getEPaper = async (id: string): Promise<EPaper | null> => {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as EPaper;
};

// Get e-paper by date
export const getEPaperByDate = async (date: string): Promise<EPaper | null> => {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .eq('publish_date', date)
    .eq('status', 'published')
    .maybeSingle();
  
  if (error) throw error;
  return data as EPaper | null;
};

// Get latest published e-paper
export const getLatestEPaper = async (): Promise<EPaper | null> => {
  const { data, error } = await supabase
    .from('epapers')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data as EPaper | null;
};

// Get available e-paper dates (for calendar)
export const getEPaperDates = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('epapers')
    .select('publish_date')
    .eq('status', 'published')
    .order('publish_date', { ascending: false });
  
  if (error) throw error;
  return (data || []).map(item => item.publish_date);
};

// Create an e-paper
export const createEPaper = async (epaper: Partial<EPaper>): Promise<EPaper> => {
  const { data, error } = await supabase
    .from('epapers')
    .insert({
      title: epaper.title,
      publish_date: epaper.publish_date,
      pdf_url: epaper.pdf_url,
      thumbnail: epaper.thumbnail || null,
      status: epaper.status || 'draft'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as EPaper;
};

// Update an e-paper
export const updateEPaper = async (id: string, epaper: Partial<EPaper>): Promise<EPaper> => {
  const { data, error } = await supabase
    .from('epapers')
    .update(epaper)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as EPaper;
};

// Delete an e-paper
export const deleteEPaper = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('epapers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Upload PDF to storage
export const uploadEPaperPDF = async (file: File, filename: string): Promise<string> => {
  const filePath = `epapers/${filename}`;
  
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Upload blob to storage (for generated PDFs)
export const uploadEPaperBlob = async (blob: Blob, filename: string): Promise<string> => {
  const filePath = `epapers/${filename}`;
  
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, blob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf'
    });
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Fetch articles for e-paper generation
export const fetchArticlesForEPaper = async (options: GenerateEPaperOptions): Promise<Article[]> => {
  const { date, categoryIds, articleLimit = 30 } = options;
  
  // Build query
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(articleLimit);
  
  // Filter by date if provided
  if (date) {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;
    query = query.gte('publish_date', startOfDay).lte('publish_date', endOfDay);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  let articles = (data as Article[]) || [];
  
  // Filter by categories if provided
  if (categoryIds && categoryIds.length > 0) {
    articles = articles.filter(article => 
      article.category_ids?.some(catId => categoryIds.includes(catId))
    );
  }
  
  // If no articles found for specific date, get latest articles
  if (articles.length === 0) {
    let fallbackQuery = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(articleLimit);
    
    const { data: fallbackData } = await fallbackQuery;
    articles = (fallbackData as Article[]) || [];
    
    // Filter by categories
    if (categoryIds && categoryIds.length > 0) {
      articles = articles.filter(article => 
        article.category_ids?.some(catId => categoryIds.includes(catId))
      );
    }
  }
  
  return articles;
};

// Fetch all categories
export const fetchCategoriesForEPaper = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return (data as Category[]) || [];
};
