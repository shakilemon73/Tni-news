import { supabase } from '../supabase';
import type { VideoPost } from '../../types/database';

// Re-export type
export type { VideoPost };

// Get all video posts
export const getVideoPosts = async (): Promise<VideoPost[]> => {
  const { data, error } = await supabase
    .from('video_posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as VideoPost[]) || [];
};

// Alias for getVideoPosts
export const getVideos = getVideoPosts;

// Get published video posts
export const getPublishedVideoPosts = async (limit?: number): Promise<VideoPost[]> => {
  let query = supabase
    .from('video_posts')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false });
    
  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data as VideoPost[]) || [];
};

// Get a single video post
export const getVideoPost = async (id: string): Promise<VideoPost | null> => {
  const { data, error } = await supabase
    .from('video_posts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as VideoPost;
};

// Create a new video post
export const createVideoPost = async (videoPost: Partial<VideoPost>): Promise<VideoPost> => {
  if (!videoPost.title || !videoPost.video_url) {
    throw new Error('Video title and URL are required');
  }

  const { data, error } = await supabase
    .from('video_posts')
    .insert({
      title: videoPost.title,
      video_url: videoPost.video_url,
      thumbnail: videoPost.thumbnail || null,
      description: videoPost.description || null,
      category_ids: videoPost.category_ids || [],
      tags: videoPost.tags || [],
      status: videoPost.status || 'draft',
      publish_date: videoPost.publish_date || new Date().toISOString()
    })
    .select()
    .maybeSingle();
  
  if (error) throw error;
  if (!data) throw new Error('Failed to create video post');
  return data as VideoPost;
};

// Update a video post
export const updateVideoPost = async (id: string, videoPost: Partial<VideoPost>): Promise<VideoPost> => {
  const { data, error } = await supabase
    .from('video_posts')
    .update(videoPost)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  if (!data) throw new Error('Failed to update video post');
  return data as VideoPost;
};

// Delete a video post
export const deleteVideoPost = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('video_posts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Aliases for convenience
export const createVideo = createVideoPost;
export const updateVideo = updateVideoPost;
export const deleteVideo = deleteVideoPost;

// Get videos by category
export const getVideosByCategory = async (categoryId: string, limit = 10): Promise<VideoPost[]> => {
  const { data, error } = await supabase
    .from('video_posts')
    .select('*')
    .contains('category_ids', [categoryId])
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data as VideoPost[]) || [];
};
