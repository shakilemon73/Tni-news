
// Admin panel user interface
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'contributor';
  full_name?: string;
  avatar_url?: string;
}

// Article editor interface
export interface ArticleEditorProps {
  id?: string;
  mode: 'create' | 'edit';
}

// Common select option interface
export interface SelectOption {
  value: string;
  label: string;
}

// File upload response
export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// Dashboard stats
export interface DashboardStats {
  totalArticles: number;
  totalCategories: number;
  totalVideos: number;
  totalViews: number;
  recentArticles: {
    id: string;
    title: string;
    views: number;
    date: string;
  }[];
  popularArticles: {
    id: string;
    title: string;
    views: number;
  }[];
}

// Custom table column settings
export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number | React.ReactNode);
  className?: string;
}

// Menu item interface for navigation
export interface MenuItem {
  id: string;
  label: string;
  url: string;
  parent_id: string | null;
}
