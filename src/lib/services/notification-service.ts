import { supabase } from '../supabase';

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

// Get all notifications (for admin)
export const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as Notification[]) || [];
};

// Get user notifications
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as Notification[]) || [];
};

// Get unread count
export const getUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  
  if (error) throw error;
  return count || 0;
};

// Create a notification
export const createNotification = async (notification: Partial<Notification>): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.user_id || null,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      link: notification.link || null
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Notification;
};

// Mark as read
export const markAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  
  if (error) throw error;
};

// Mark all as read
export const markAllAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);
  
  if (error) throw error;
};

// Delete a notification
export const deleteNotification = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Bulk delete notifications
export const bulkDeleteNotifications = async (ids: string[]): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
};
