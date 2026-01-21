import { supabase } from '../supabase';

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  updated_at: string;
  created_at: string;
}

// Get all pages
export const getPages = async (): Promise<Page[]> => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('title', { ascending: true });
  
  if (error) throw error;
  return data as Page[];
};

// Get a single page by slug
export const getPageBySlug = async (slug: string): Promise<Page | null> => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Page | null;
};

// Get a single page by ID
export const getPageById = async (id: string): Promise<Page | null> => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Page | null;
};

// Update a page
export const updatePage = async (id: string, pageData: Partial<Page>): Promise<Page | null> => {
  const { data, error } = await supabase
    .from('pages')
    .update({
      ...pageData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Page;
};

// Create a new page
export const createPage = async (pageData: Partial<Page>): Promise<Page> => {
  const { data, error } = await supabase
    .from('pages')
    .insert({
      slug: pageData.slug,
      title: pageData.title || '',
      content: pageData.content || '',
      meta_description: pageData.meta_description || null
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Page;
};

// Delete a page
export const deletePage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
