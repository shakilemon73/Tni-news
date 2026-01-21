import { supabase } from '../supabase';
import type { Theme } from '../../types/database';

// Get all themes
export const getThemes = async (): Promise<Theme[]> => {
  const { data, error } = await supabase
    .from('themes')
    .select('*');
  
  if (error) throw error;
  return (data as Theme[]) || [];
};

// Get active theme
export const getActiveTheme = async (): Promise<Theme | null> => {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('active', true)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Theme | null;
};

// Get a single theme
export const getTheme = async (id: string): Promise<Theme | null> => {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Theme;
};

// Create a new theme
export const createTheme = async (theme: Partial<Theme>): Promise<Theme> => {
  if (!theme.name) {
    throw new Error('Theme name is required');
  }

  const { data, error } = await supabase
    .from('themes')
    .insert({
      name: theme.name,
      file_url: theme.file_url || null,
      config: theme.config || {},
      active: theme.active || false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Theme;
};

// Update a theme
export const updateTheme = async (id: string, theme: Partial<Theme>): Promise<Theme> => {
  const { data, error } = await supabase
    .from('themes')
    .update(theme)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Theme;
};

// Activate a theme (deactivates all others)
export const activateTheme = async (id: string): Promise<Theme> => {
  // First, set all themes to inactive
  const { error: updateError } = await supabase
    .from('themes')
    .update({ active: false })
    .neq('id', '');
  
  if (updateError) throw updateError;
  
  // Then, set the selected theme to active
  const { data, error } = await supabase
    .from('themes')
    .update({ active: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Theme;
};

// Delete a theme
export const deleteTheme = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
