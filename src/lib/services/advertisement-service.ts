import { supabase } from '../supabase';

export interface Advertisement {
  id: string;
  title: string;
  type: 'banner' | 'sponsored' | 'sidebar';
  image_url: string | null;
  link_url: string | null;
  content: string | null;
  position: string;
  slot: string | null;
  priority: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  clicks: number;
  impressions: number;
  created_at: string;
  updated_at: string;
}

// Get active advertisements by position
export const getAdvertisements = async (position: string, limit = 10): Promise<Advertisement[]> => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('position', position)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching advertisements:', error);
    return [];
  }
  return data as Advertisement[];
};

// Get advertisements by type
export const getAdvertisementsByType = async (type: string, limit = 10): Promise<Advertisement[]> => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching advertisements:', error);
    return [];
  }
  return data as Advertisement[];
};

// Get a specific ad by position and slot
export const getAdvertisementBySlot = async (position: string, slot: string): Promise<Advertisement | null> => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('position', position)
    .eq('slot', slot)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching advertisement:', error);
    return null;
  }
  return data as Advertisement | null;
};

// Track ad click
export const trackAdClick = async (adId: string): Promise<void> => {
  // Get current clicks and increment
  const { data } = await supabase
    .from('advertisements')
    .select('clicks')
    .eq('id', adId)
    .single();
  
  if (data) {
    await supabase
      .from('advertisements')
      .update({ clicks: (data.clicks || 0) + 1 })
      .eq('id', adId);
  }
};

// Track ad impression
export const trackAdImpression = async (adId: string): Promise<void> => {
  // Get current impressions and increment
  const { data } = await supabase
    .from('advertisements')
    .select('impressions')
    .eq('id', adId)
    .single();
  
  if (data) {
    await supabase
      .from('advertisements')
      .update({ impressions: (data.impressions || 0) + 1 })
      .eq('id', adId);
  }
};

// Admin functions
export const getAllAdvertisements = async (): Promise<Advertisement[]> => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Advertisement[];
};

export const createAdvertisement = async (ad: Partial<Advertisement>): Promise<Advertisement> => {
  const { data, error } = await supabase
    .from('advertisements')
    .insert([ad as any])
    .select()
    .single();

  if (error) throw error;
  return data as Advertisement;
};

export const updateAdvertisement = async (id: string, ad: Partial<Advertisement>): Promise<Advertisement> => {
  const { data, error } = await supabase
    .from('advertisements')
    .update(ad)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Advertisement;
};

export const deleteAdvertisement = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('advertisements')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
