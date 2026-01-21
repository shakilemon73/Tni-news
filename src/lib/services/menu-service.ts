import { supabase } from '../supabase';
import type { Menu } from '../../types/database';
import type { MenuItem } from '../../types/admin';
import type { Json } from '../../integrations/supabase/types';

// Get all menus
export const getMenus = async (): Promise<Menu[]> => {
  const { data, error } = await supabase
    .from('menus')
    .select('*');
  
  if (error) throw error;
  return (data as Menu[]) || [];
};

// Get a single menu
export const getMenu = async (id: string): Promise<Menu | null> => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Menu;
};

// Get menu by name
export const getMenuByName = async (name: string): Promise<Menu | null> => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('name', name)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data as Menu | null;
};

// Create a new menu
export const createMenu = async (menu: Partial<Menu>): Promise<Menu> => {
  if (!menu.name) {
    throw new Error('Menu name is required');
  }

  const { data, error } = await supabase
    .from('menus')
    .insert({
      name: menu.name,
      items: (menu.items as Json) || []
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Menu;
};

// Update a menu
export const updateMenu = async (id: string, menu: Partial<Menu>): Promise<Menu> => {
  const updateData: Record<string, any> = { ...menu };
  
  // Convert items to Json if needed
  if (menu.items) {
    updateData.items = menu.items as Json;
  }

  const { data, error } = await supabase
    .from('menus')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Menu;
};

// Delete a menu
export const deleteMenu = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Get menu items
export const getMenuItems = async (menuId: string): Promise<MenuItem[]> => {
  const menu = await getMenu(menuId);
  return (menu?.items as unknown as MenuItem[]) || [];
};

// Update menu items
export const updateMenuItems = async (menuId: string, items: MenuItem[]): Promise<Menu> => {
  return await updateMenu(menuId, { items: items as unknown as Json });
};
