import { supabase } from '../../integrations/supabase/client';

// ============ SAVED ARTICLES ============

export interface SavedArticle {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface SavedArticleWithDetails extends SavedArticle {
  article?: {
    id: string;
    title: string;
    slug: string | null;
    excerpt: string | null;
    featured_image: string | null;
    publish_date: string;
    category_ids: string[] | null;
  };
}

// Save an article
export const saveArticle = async (userId: string, articleId: string): Promise<SavedArticle> => {
  try {
    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_articles' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle();
    
    if (existing) {
      throw new Error('Article already saved');
    }
    
    const { data, error } = await supabase
      .from('saved_articles' as any)
      .insert({ user_id: userId, article_id: articleId })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving article:', error);
      throw new Error('সংরক্ষণ করতে সমস্যা হয়েছে। টেবিল বিদ্যমান নাও থাকতে পারে।');
    }
    return data as unknown as SavedArticle;
  } catch (error: any) {
    if (error.message === 'Article already saved') throw error;
    console.error('Error in saveArticle:', error);
    throw new Error('সংরক্ষণ ফিচারটি এখনও সক্রিয় করা হয়নি।');
  }
};

// Unsave an article
export const unsaveArticle = async (userId: string, articleId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('saved_articles' as any)
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);
    
    if (error) {
      console.error('Error unsaving article:', error);
    }
  } catch (error) {
    console.error('Error in unsaveArticle:', error);
  }
};

// Check if article is saved
export const isArticleSaved = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('saved_articles' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking saved status:', error);
      return false;
    }
    return !!data;
  } catch (error) {
    console.error('Error in isArticleSaved:', error);
    return false;
  }
};

// Get all saved articles for a user
export const getSavedArticles = async (userId: string): Promise<SavedArticleWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_articles' as any)
      .select(`
        id,
        user_id,
        article_id,
        created_at,
        article:articles (
          id,
          title,
          slug,
          excerpt,
          featured_image,
          publish_date,
          category_ids
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching saved articles:', error);
      return []; // Return empty array if table doesn't exist
    }
    return (data as unknown as SavedArticleWithDetails[]) || [];
  } catch (error) {
    console.error('Error in getSavedArticles:', error);
    return [];
  }
};

// ============ READING HISTORY ============

export interface ReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  read_at: string;
  read_duration_seconds: number | null;
}

export interface ReadingHistoryWithDetails extends ReadingHistory {
  article?: {
    id: string;
    title: string;
    slug: string | null;
    excerpt: string | null;
    featured_image: string | null;
    publish_date: string;
    category_ids: string[] | null;
  };
}

// Add to reading history
export const addToReadingHistory = async (
  userId: string, 
  articleId: string,
  readDuration?: number
): Promise<ReadingHistory | null> => {
  try {
    // Check if already exists - update if so
    const { data: existing } = await supabase
      .from('reading_history' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .maybeSingle();
    
    if (existing) {
      // Update existing entry with new read_at time
      const { data, error } = await supabase
        .from('reading_history' as any)
        .update({ 
          read_at: new Date().toISOString(),
          read_duration_seconds: readDuration || null
        })
        .eq('id', (existing as any).id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating reading history:', error);
        return null;
      }
      return data as unknown as ReadingHistory;
    }
    
    // Insert new entry
    const { data, error } = await supabase
      .from('reading_history' as any)
      .insert({ 
        user_id: userId, 
        article_id: articleId,
        read_duration_seconds: readDuration || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding to reading history:', error);
      return null;
    }
    return data as unknown as ReadingHistory;
  } catch (error) {
    console.error('Error in addToReadingHistory:', error);
    return null;
  }
};

// Get reading history for a user
export const getReadingHistory = async (userId: string, limit?: number): Promise<ReadingHistoryWithDetails[]> => {
  try {
    let query = supabase
      .from('reading_history' as any)
      .select(`
        id,
        user_id,
        article_id,
        read_at,
        read_duration_seconds,
        article:articles (
          id,
          title,
          slug,
          excerpt,
          featured_image,
          publish_date,
          category_ids
        )
      `)
      .eq('user_id', userId)
      .order('read_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching reading history:', error);
      return [];
    }
    return (data as unknown as ReadingHistoryWithDetails[]) || [];
  } catch (error) {
    console.error('Error in getReadingHistory:', error);
    return [];
  }
};

// Clear reading history for a user
export const clearReadingHistory = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reading_history' as any)
      .delete()
      .eq('user_id', userId);
    
    if (error) console.error('Error clearing reading history:', error);
  } catch (error) {
    console.error('Error in clearReadingHistory:', error);
  }
};

// Delete single reading history entry
export const deleteReadingHistoryEntry = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reading_history' as any)
      .delete()
      .eq('id', id);
    
    if (error) console.error('Error deleting history entry:', error);
  } catch (error) {
    console.error('Error in deleteReadingHistoryEntry:', error);
  }
};
