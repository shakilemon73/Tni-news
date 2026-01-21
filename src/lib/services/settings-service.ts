import { supabase } from '../supabase';
import type { SiteSettings } from '../../types/database';

// Re-export type with alias
export type Settings = SiteSettings;
export type { SiteSettings };

// We treat settings as a singleton row. If multiple rows exist (from earlier bugs/manual inserts),
// always read/update the oldest row to avoid `.single()` coercion errors.
const SETTINGS_SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

// Get site settings
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SiteSettings | null;
};

// Alias for getSiteSettings
export const getSettings = getSiteSettings;

// Update site settings
export const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<SiteSettings | null> => {
  // Pick a deterministic settings row to update (prevents "Cannot coerce ... single JSON object" when duplicates exist)
  const { data: rows, error: existingError } = await supabase
    .from('settings')
    .select('id')
    .order('id', { ascending: true })
    .limit(1);

  if (existingError) throw existingError;
  
  const existingSettings = rows && rows.length > 0 ? rows[0] : null;

  if (existingSettings?.id) {
    // Update existing settings - use select without .single() to avoid coercion error
    const { data: updateRows, error } = await supabase
      .from('settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSettings.id)
      .select();

    if (error) throw error;
    if (!updateRows || updateRows.length === 0) {
      throw new Error('Settings update returned 0 rows (likely blocked by permissions/RLS).');
    }

    return updateRows[0] as SiteSettings;
  }

  // Create new settings (use fixed ID so future updates can target a known row)
  const { data: insertRows, error } = await supabase
    .from('settings')
    .insert({
      id: SETTINGS_SINGLETON_ID,
      site_name: settings.site_name || 'বাংলা টাইমস',
      site_description: settings.site_description || null,
      logo: settings.logo || null,
      favicon: settings.favicon || null,
      social_media: settings.social_media || {},
      contact_email: settings.contact_email || null,
      contact_phone: settings.contact_phone || null,
      contact_address: settings.contact_address || null,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  if (!insertRows || insertRows.length === 0) {
    throw new Error('Settings insert returned 0 rows.');
  }
  return insertRows[0] as SiteSettings;
};

// Alias for updateSiteSettings
export const updateSettings = async (id: string, settings: Partial<SiteSettings>): Promise<SiteSettings | null> => {
  const { data: rows, error } = await supabase
    .from('settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!rows || rows.length === 0) {
    throw new Error('Settings update returned 0 rows (likely blocked by permissions/RLS).');
  }
  return rows[0] as SiteSettings;
};

// Get social media links
export const getSocialMediaLinks = async (): Promise<Record<string, string>> => {
  const settings = await getSiteSettings();
  return (settings?.social_media as Record<string, string>) || {};
};

// Update social media links
export const updateSocialMediaLinks = async (socialMedia: Record<string, string>): Promise<void> => {
  await updateSiteSettings({ social_media: socialMedia });
};
