import { supabase } from '../supabase';
import type { Category } from '../../types/database';

// Simple in-memory cache for categories
let categoriesCache: Category[] | null = null;
let categoriesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get all categories with caching
export const getCategories = async (): Promise<Category[]> => {
  // Return cached data if still valid
  if (categoriesCache && Date.now() - categoriesCacheTime < CACHE_DURATION) {
    return categoriesCache;
  }
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
    
    // Update cache
    categoriesCache = (data as Category[]) || [];
    categoriesCacheTime = Date.now();
    
    return categoriesCache;
  } catch (error) {
    console.error('Exception in getCategories:', error);
    throw error;
  }
};

// Clear the categories cache (useful after create/update/delete)
export const clearCategoriesCache = () => {
  categoriesCache = null;
  categoriesCacheTime = 0;
};

// Get a single category by ID
export const getCategory = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data as Category;
};

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  return data as Category | null;
};

// Create a new category
export const createCategory = async (category: Partial<Category>): Promise<Category> => {
  if (!category.name || !category.slug) {
    throw new Error('Category name and slug are required');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      parent_id: category.parent_id || null
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Clear cache after creation
  clearCategoriesCache();
  
  return data as Category;
};

// Update a category
export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Clear cache after update
  clearCategoriesCache();
  
  return data as Category;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  // Clear cache after deletion
  clearCategoriesCache();
};

// Get child categories
export const getChildCategories = async (parentId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('name');
  
  if (error) throw error;
  return (data as Category[]) || [];
};
