import { supabase } from '../../integrations/supabase/client';
import type { Article } from '@/types/database';

// ============ CONTENT-BASED RECOMMENDATION ALGORITHM ============

// Calculate similarity score between two articles based on tags and categories
export const calculateSimilarity = (article1: Article, article2: Article): number => {
  let score = 0;
  
  // Tag similarity (Jaccard coefficient)
  const tags1 = new Set(article1.tags || []);
  const tags2 = new Set(article2.tags || []);
  const tagIntersection = new Set([...tags1].filter(x => tags2.has(x)));
  const tagUnion = new Set([...tags1, ...tags2]);
  if (tagUnion.size > 0) {
    score += (tagIntersection.size / tagUnion.size) * 0.6; // 60% weight for tags
  }
  
  // Category similarity
  const cats1 = new Set(article1.category_ids || []);
  const cats2 = new Set(article2.category_ids || []);
  const catIntersection = new Set([...cats1].filter(x => cats2.has(x)));
  const catUnion = new Set([...cats1, ...cats2]);
  if (catUnion.size > 0) {
    score += (catIntersection.size / catUnion.size) * 0.4; // 40% weight for categories
  }
  
  return score;
};

// ============ TF-IDF-like KEYWORD EXTRACTION ============

// Simple keyword extraction from content
export const extractKeywords = (text: string): string[] => {
  // Remove HTML tags and special characters
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/[^\u0980-\u09FFa-zA-Z\s]/g, '');
  
  // Split into words and filter common words
  const words = cleanText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

// ============ USER PREFERENCE ANALYSIS ============

interface UserPreferenceProfile {
  preferredCategories: Record<string, number>;
  preferredTags: Record<string, number>;
  totalReads: number;
  avgReadDuration: number;
}

// Build user preference profile from reading history
export const buildUserProfile = async (userId: string): Promise<UserPreferenceProfile> => {
  try {
    const { data: history, error } = await supabase
      .from('reading_history')
      .select(`
        read_duration_seconds,
        article:articles (
          category_ids,
          tags
        )
      `)
      .eq('user_id', userId)
      .order('read_at', { ascending: false })
      .limit(50);
    
    if (error || !history) {
      return {
        preferredCategories: {},
        preferredTags: {},
        totalReads: 0,
        avgReadDuration: 0
      };
    }
    
    const preferredCategories: Record<string, number> = {};
    const preferredTags: Record<string, number> = {};
    let totalDuration = 0;
    let durationCount = 0;
    
    history.forEach((entry: any) => {
      const article = entry.article;
      if (!article) return;
      
      // Count category preferences
      (article.category_ids || []).forEach((catId: string) => {
        preferredCategories[catId] = (preferredCategories[catId] || 0) + 1;
      });
      
      // Count tag preferences
      (article.tags || []).forEach((tag: string) => {
        preferredTags[tag] = (preferredTags[tag] || 0) + 1;
      });
      
      // Track read duration
      if (entry.read_duration_seconds) {
        totalDuration += entry.read_duration_seconds;
        durationCount++;
      }
    });
    
    return {
      preferredCategories,
      preferredTags,
      totalReads: history.length,
      avgReadDuration: durationCount > 0 ? totalDuration / durationCount : 0
    };
  } catch (error) {
    console.error('Error building user profile:', error);
    return {
      preferredCategories: {},
      preferredTags: {},
      totalReads: 0,
      avgReadDuration: 0
    };
  }
};

// ============ RECOMMENDATION ALGORITHMS ============

// Get personalized recommendations for a user
export const getPersonalizedRecommendations = async (
  userId: string,
  limit: number = 10
): Promise<Article[]> => {
  try {
    // Build user profile
    const profile = await buildUserProfile(userId);
    
    // If no reading history, return popular articles
    if (profile.totalReads === 0) {
      return getTrendingArticles(limit);
    }
    
    // Get articles user hasn't read
    const { data: readArticles } = await supabase
      .from('reading_history')
      .select('article_id')
      .eq('user_id', userId);
    
    const readIds = new Set((readArticles || []).map((r: any) => r.article_id));
    
    // Get candidate articles
    const { data: candidates, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('publish_date', { ascending: false })
      .limit(100);
    
    if (error || !candidates) return [];
    
    // Filter out already read articles
    const unreadArticles = (candidates as Article[]).filter(a => !readIds.has(a.id));
    
    // Score articles based on user preferences
    const scoredArticles = unreadArticles.map(article => {
      let score = 0;
      
      // Category match score
      (article.category_ids || []).forEach(catId => {
        score += (profile.preferredCategories[catId] || 0) * 2;
      });
      
      // Tag match score
      (article.tags || []).forEach(tag => {
        score += (profile.preferredTags[tag] || 0) * 1.5;
      });
      
      // Recency boost (articles from last 24 hours get bonus)
      const publishDate = new Date(article.publish_date);
      const hoursSincePublish = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60);
      if (hoursSincePublish < 24) {
        score += 5;
      } else if (hoursSincePublish < 72) {
        score += 2;
      }
      
      // Popularity boost
      score += Math.log(article.views + 1) * 0.5;
      
      return { article, score };
    });
    
    // Sort by score and return top recommendations
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.article);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

// Get similar articles based on content
export const getSimilarArticles = async (
  articleId: string,
  limit: number = 5
): Promise<Article[]> => {
  try {
    // Get the source article
    const { data: sourceArticle, error: sourceError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();
    
    if (sourceError || !sourceArticle) return [];
    
    // Get candidate articles
    const { data: candidates, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('id', articleId)
      .order('publish_date', { ascending: false })
      .limit(50);
    
    if (error || !candidates) return [];
    
    // Calculate similarity scores
    const scoredArticles = (candidates as Article[]).map(article => ({
      article,
      score: calculateSimilarity(sourceArticle as Article, article)
    }));
    
    // Sort by similarity and return top matches
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.article);
  } catch (error) {
    console.error('Error getting similar articles:', error);
    return [];
  }
};

// Get trending articles based on views and recency
export const getTrendingArticles = async (limit: number = 10): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .gte('publish_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('views', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error getting trending articles:', error);
      return [];
    }
    
    return (data as Article[]) || [];
  } catch (error) {
    console.error('Error in getTrendingArticles:', error);
    return [];
  }
};

// ============ COLLABORATIVE FILTERING (Simple) ============

// Get articles that users with similar reading patterns also liked
export const getCollaborativeRecommendations = async (
  userId: string,
  limit: number = 5
): Promise<Article[]> => {
  try {
    // Get current user's reading history
    const { data: userHistory } = await supabase
      .from('reading_history')
      .select('article_id')
      .eq('user_id', userId);
    
    if (!userHistory || userHistory.length === 0) return [];
    
    const userArticleIds = userHistory.map((h: any) => h.article_id);
    
    // Find users who read similar articles
    const { data: similarUsers } = await supabase
      .from('reading_history')
      .select('user_id, article_id')
      .in('article_id', userArticleIds)
      .neq('user_id', userId);
    
    if (!similarUsers || similarUsers.length === 0) return [];
    
    // Count how many articles each similar user has in common
    const userSimilarity: Record<string, number> = {};
    similarUsers.forEach((entry: any) => {
      userSimilarity[entry.user_id] = (userSimilarity[entry.user_id] || 0) + 1;
    });
    
    // Get top similar users
    const topSimilarUserIds = Object.entries(userSimilarity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([uid]) => uid);
    
    if (topSimilarUserIds.length === 0) return [];
    
    // Get articles these similar users read that current user hasn't
    const { data: recommendations } = await supabase
      .from('reading_history')
      .select(`
        article_id,
        article:articles (*)
      `)
      .in('user_id', topSimilarUserIds)
      .not('article_id', 'in', `(${userArticleIds.join(',')})`)
      .limit(limit * 2);
    
    if (!recommendations) return [];
    
    // Deduplicate and return articles
    const uniqueArticles = new Map<string, Article>();
    recommendations.forEach((r: any) => {
      if (r.article && r.article.status === 'published') {
        uniqueArticles.set(r.article_id, r.article);
      }
    });
    
    return Array.from(uniqueArticles.values()).slice(0, limit);
  } catch (error) {
    console.error('Error getting collaborative recommendations:', error);
    return [];
  }
};

// ============ CATEGORY-BASED RECOMMENDATIONS ============

// Get popular articles in user's preferred categories
export const getCategoryRecommendations = async (
  userId: string,
  limit: number = 10
): Promise<Article[]> => {
  try {
    const profile = await buildUserProfile(userId);
    
    // Get top 3 preferred categories
    const topCategories = Object.entries(profile.preferredCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([catId]) => catId);
    
    if (topCategories.length === 0) {
      return getTrendingArticles(limit);
    }
    
    // Get articles from these categories
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .overlaps('category_ids', topCategories)
      .order('publish_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error getting category recommendations:', error);
      return [];
    }
    
    return (data as Article[]) || [];
  } catch (error) {
    console.error('Error in getCategoryRecommendations:', error);
    return [];
  }
};
