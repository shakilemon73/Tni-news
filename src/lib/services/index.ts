// Export all services
export { 
  supabase, 
  signIn, 
  signUp, 
  signOut, 
  getSession, 
  getCurrentUser, 
  getUserProfile, 
  getUserRole, 
  checkAdminAccess, 
  onAuthStateChange 
} from './supabase-service';
// Export from article-service with explicit naming to avoid conflicts
export {
  getArticles,
  getFeaturedArticles,
  getArticlesByCategory,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  bulkActionArticles,
  incrementArticleViews,
  slugExists,
  getNextSequentialArticleSlug,
} from './article-service';
export * from './category-service';
export * from './video-service';
export * from './settings-service';
export * from './menu-service';
export * from './theme-service';
export * from './widget-service';
// Export user-service with explicit renamed imports to avoid conflicts
export {
  getProfiles,
  getProfile,
  updateProfile,
  createProfile,
  createDefaultProfile
} from './user-service';
export * from './media-service';
export * from './comment-service';
export * from './notification-service';
export * from './epaper-service';
export * from './analytics-service';
export * from './user-interaction-service';
export * from './recommendation-service';
export * from './ai-service';
