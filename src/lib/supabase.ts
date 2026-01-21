
// Re-export the supabase client for consistent imports
export { supabase } from '../integrations/supabase/client';

// Import and re-export article-service functions
import {
  getArticles,
  getFeaturedArticles,
  getArticlesByCategory,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  bulkActionArticles,
  incrementArticleViews
} from './services/article-service';

// Re-export all article service functions
export {
  getArticles,
  getFeaturedArticles,
  getArticlesByCategory,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  bulkActionArticles,
  incrementArticleViews
};

// Re-export functions from other services
export { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from './services/category-service';
