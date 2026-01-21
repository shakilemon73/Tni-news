import { supabase } from '../supabase';

// Profile interface
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// User role interface
interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'editor';
  created_at: string;
}

// Get all profiles
export const getProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

// Get a single profile
export const getProfile = async (id: string): Promise<Profile | null> => {
  console.log('Fetching profile for user ID:', id);
  
  if (!id) {
    console.error('No user ID provided to getProfile');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No profile found for user ID:', id);
      return await createDefaultProfile(id);
    }
    
    console.log('Profile found:', data);
    return data as Profile;
  } catch (error) {
    console.error('Error in getProfile:', error);
    throw error;
  }
};

// Update profile
export const updateProfile = async (id: string, profile: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Create profile
export const createProfile = async (profile: Partial<Profile> & { id: string }) => {
  console.log('Creating new profile:', profile);
  
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profile.id)
    .maybeSingle();
    
  if (existingProfile) {
    console.log('Profile already exists, returning existing profile');
    return existingProfile;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: profile.id,
      full_name: profile.full_name || null,
      avatar_url: profile.avatar_url || null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
  
  console.log('Profile created:', data);
  return data;
};

// Create default profile for new users
export const createDefaultProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Creating default profile for user:', userId);
    
    const profile = await createProfile({
      id: userId,
      full_name: null,
      avatar_url: null
    });
    
    return profile as Profile;
  } catch (error) {
    console.error('Error creating default profile:', error);
    return null;
  }
};

// Get user role
export const getUserRole = async (userId: string): Promise<'admin' | 'editor' | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
  
  return data?.role as 'admin' | 'editor' | null;
};

// Check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

// Check if user is admin or editor
export const isUserAdminOrEditor = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'editor';
};

// Set user role (admin only)
export const setUserRole = async (userId: string, role: 'admin' | 'editor') => {
  // Check if role already exists
  const { data: existing } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (existing) {
    // Update existing role
    const { data, error } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } else {
    // Insert new role
    const { data, error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
