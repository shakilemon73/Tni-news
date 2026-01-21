import { supabase } from '../supabase';

export interface Comment {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string;
  author_email: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

// Get all comments (for admin)
export const getComments = async (status?: string): Promise<Comment[]> => {
  let query = supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return (data as Comment[]) || [];
};

// Get comments for an article
export const getArticleComments = async (articleId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as Comment[]) || [];
};

// Create a comment
// NOTE: We intentionally do NOT call `.select()` here.
// With RLS, newly inserted comments are `pending` and are not selectable by anon/authenticated users,
// so requesting a returned row can fail even though the INSERT succeeded.
export const createComment = async (comment: Partial<Comment>): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .insert({
      article_id: comment.article_id,
      user_id: comment.user_id || null,
      author_name: comment.author_name,
      author_email: comment.author_email || null,
      content: comment.content,
      parent_id: comment.parent_id || null,
      status: 'pending',
    });

  if (error) throw error;
};

// Update comment status
export const updateCommentStatus = async (id: string, status: string): Promise<Comment> => {
  const { data, error } = await supabase
    .from('comments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Comment;
};

// Delete a comment
export const deleteComment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Bulk update comments
export const bulkUpdateComments = async (ids: string[], status: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .update({ status })
    .in('id', ids);
  
  if (error) throw error;
};

// Get comment count by status
export const getCommentStats = async (): Promise<{ pending: number; approved: number; rejected: number }> => {
  const { data, error } = await supabase
    .from('comments')
    .select('status');
  
  if (error) throw error;
  
  const stats = { pending: 0, approved: 0, rejected: 0 };
  (data || []).forEach((comment: { status: string }) => {
    if (comment.status === 'pending') stats.pending++;
    else if (comment.status === 'approved') stats.approved++;
    else if (comment.status === 'rejected') stats.rejected++;
  });
  
  return stats;
};
