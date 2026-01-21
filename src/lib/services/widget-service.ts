import { supabase } from '../supabase';
import type { Widget } from '../../types/database';

// Get all widgets
export const getWidgets = async (): Promise<Widget[]> => {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .order('position');
  
  if (error) throw error;
  return (data as Widget[]) || [];
};

// Get a single widget
export const getWidget = async (id: string): Promise<Widget | null> => {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Widget;
};

// Get widgets by type
export const getWidgetsByType = async (type: string): Promise<Widget[]> => {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('type', type)
    .order('position');
  
  if (error) throw error;
  return (data as Widget[]) || [];
};

// Create a new widget
export const createWidget = async (widget: Partial<Widget>): Promise<Widget> => {
  if (!widget.name || !widget.type) {
    throw new Error('Widget name and type are required');
  }

  // Get the max position
  const { data: widgets } = await supabase
    .from('widgets')
    .select('position')
    .order('position', { ascending: false })
    .limit(1);
  
  const maxPosition = widgets?.[0]?.position || 0;

  const { data, error } = await supabase
    .from('widgets')
    .insert({
      name: widget.name,
      type: widget.type,
      config: widget.config || {},
      position: widget.position ?? maxPosition + 1
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Widget;
};

// Update a widget
export const updateWidget = async (id: string, widget: Partial<Widget>): Promise<Widget> => {
  const { data, error } = await supabase
    .from('widgets')
    .update(widget)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Widget;
};

// Delete a widget
export const deleteWidget = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('widgets')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Reorder widgets
export const reorderWidgets = async (widgetOrders: { id: string; position: number }[]): Promise<boolean> => {
  for (const widget of widgetOrders) {
    const { error } = await supabase
      .from('widgets')
      .update({ position: widget.position })
      .eq('id', widget.id);
    
    if (error) throw error;
  }
  
  return true;
};
