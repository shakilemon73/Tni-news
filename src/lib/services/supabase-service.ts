import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Re-export supabase for other services
export { supabase, uuidv4 };

// Authentication
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  // SECURITY: Strip any 'role' field from metadata to prevent privilege escalation
  const sanitizedMetadata = metadata ? { ...metadata } : {};
  delete sanitizedMetadata.role;
  
  // Get the redirect URL for email confirmation - redirect to user dashboard, not admin
  const redirectUrl = `${window.location.origin}/dashboard`;
  
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: sanitizedMetadata,
      emailRedirectTo: redirectUrl
    }
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Current session helpers
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

// Get user profile (renamed to avoid conflicts)
export const getUserProfile = async (userId: string) => {
  if (!userId) {
    console.error('No user ID provided to getUserProfile');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
};

// Get user role - try user_roles table first, fall back to profiles
export const getUserRole = async (userId: string): Promise<'admin' | 'editor' | 'reader' | null> => {
  try {
    // First try user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!roleError && roleData?.role) {
      return roleData.role as 'admin' | 'editor' | 'reader';
    }
    
    // Fallback to profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (!profileError && profileData?.role) {
      return profileData.role as 'admin' | 'editor' | 'reader';
    }
    
    return 'reader'; // Default to reader
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

// Check if user is admin or editor (for admin panel access)
export const checkAdminAccess = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'editor';
};

// Subscribe to auth changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
