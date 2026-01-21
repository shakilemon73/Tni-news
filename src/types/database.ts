
import type { Json } from '../integrations/supabase/types';
import type { MenuItem } from './admin';

export interface Article {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_ids: string[];
  tags: string[];
  featured_image?: string;
  image_credit?: string;
  gallery_images?: string[];
  gallery_credits?: string[];
  status: 'draft' | 'published' | 'archived';
  publish_date: string;
  seo_metadata: {
    title: string;
    description: string;
    keywords: string[];
  } | Json;
  created_at: string;
  updated_at: string;
  excerpt?: string;
  slug?: string;
  views?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoPost {
  id: string;
  title: string;
  video_url: string;
  thumbnail: string;
  description: string;
  category_ids: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publish_date: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  logo: string;
  favicon: string;
  social_media: Record<string, string>;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  gemini_api_key?: string | null;
  updated_at: string;
}

export interface Menu {
  id: string;
  name: string;
  items: Json;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  file_url: string;
  config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Widget {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}
