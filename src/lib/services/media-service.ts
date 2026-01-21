import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase';
import { deleteFromR2, extractR2Path, isR2Url } from './r2-storage-service';

// Media interface - exported for use in components
export interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// Alias for backward compatibility
type Media = MediaFile;

// Upload a file to Supabase storage (for non-article files like avatars)
export const uploadFile = async (
  bucket: string, 
  folder: string, 
  file: File
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  if (uploadError) throw uploadError;
  
  // Get the public URL for the file
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return publicUrl;
};

// Upload file and save to media table (for Supabase storage)
export const uploadMedia = async (
  file: File, 
  userId?: string,
  altText?: string
): Promise<Media | null> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId || 'anonymous'}/${uuidv4()}.${fileExt}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
    
  if (uploadError) throw uploadError;
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);
  
  // Save to media table
  const { data, error } = await supabase
    .from('media')
    .insert({
      filename: file.name,
      file_path: filePath,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      alt_text: altText || null,
      uploaded_by: userId || null
    })
    .select()
    .single();
    
  if (error) throw error;
  return data as Media;
};

// Get all media files
export const getMediaFiles = async (): Promise<Media[]> => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return (data as Media[]) || [];
};

// Delete a media file (handles both R2 and Supabase storage)
export const deleteMediaFile = async (id: string, filePath?: string, fileUrl?: string): Promise<boolean> => {
  // Check if this is an R2 file
  if (fileUrl && isR2Url(fileUrl)) {
    const r2Path = extractR2Path(fileUrl);
    if (r2Path) {
      const result = await deleteFromR2(r2Path);
      if (!result.success) {
        console.error('Error deleting from R2:', result.error);
      }
    }
  } else if (filePath) {
    // Delete from Supabase storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([filePath]);
      
    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }
  }
  
  // Then delete from database
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', id);
    
  if (dbError) throw dbError;
  return true;
};

// Alias for deleteMediaFile
export const deleteMedia = deleteMediaFile;

// Get a single media file
export const getMedia = async (id: string): Promise<Media | null> => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as Media;
};
