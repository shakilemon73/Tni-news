import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { processImage, createProcessedFile } from '../utils/image-processor';

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  size?: number;
  type?: string;
  error?: string;
}

interface DeleteResult {
  success: boolean;
  deleted?: string;
  error?: string;
}

const STORAGE_BUCKET = 'media';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param folder - The folder to store the file in (default: 'articles')
 * @returns Upload result with URL and file info
 */
export async function uploadToR2(file: File, folder: string = 'articles', skipProcessing: boolean = false): Promise<UploadResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if this is a favicon or logo upload - skip processing
    const isIconFile = folder === 'icons' || 
                       folder === 'logos' || 
                       file.name.toLowerCase().includes('favicon') || 
                       file.name.toLowerCase().includes('logo');

    let processedFile = file;
    
    // Process image files (compress and convert to WebP) - skip for icons/logos
    if (file.type.startsWith('image/') && !isIconFile && !skipProcessing) {
      try {
        const processed = await processImage(file);
        processedFile = createProcessedFile(processed.blob, file.name);
        console.log(`Image optimized: ${(file.size / 1024).toFixed(1)}KB → ${(processedFile.size / 1024).toFixed(1)}KB`);
      } catch (error) {
        console.warn('Image processing failed, uploading original:', error);
        // Fall back to original file if processing fails
      }
    }

    // Generate unique filename with .webp extension for images
    const fileExt = processedFile.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${uniqueFilename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: processedFile.type,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      filename: uniqueFilename,
      size: processedFile.size,
      type: processedFile.type,
    };
  } catch (error) {
    console.error('Storage upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path - The file path to delete (e.g., 'articles/uuid.jpg')
 * @returns Delete result
 */
export async function deleteFromR2(path: string): Promise<DeleteResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    // Clean the path - remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([cleanPath]);

    if (error) {
      console.error('Supabase Storage delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, deleted: cleanPath };
  } catch (error) {
    console.error('Storage delete error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

/**
 * Extract storage path from a full Supabase Storage URL
 * @param url - The full public URL
 * @returns The path portion of the URL (e.g., 'articles/uuid.jpg')
 */
export function extractR2Path(url: string): string | null {
  try {
    // Handle Supabase Storage URLs
    // Format: https://xxx.supabase.co/storage/v1/object/public/media/articles/uuid.jpg
    const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
    if (match) {
      return match[1];
    }
    
    // Fallback: try to extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/media/');
    if (pathParts.length > 1) {
      return pathParts[1];
    }
    
    return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is from Supabase Storage
 * @param url - The URL to check
 * @returns True if the URL is from Supabase Storage
 */
export function isR2Url(url: string): boolean {
  if (!url) return false;
  // Check for Supabase Storage URL patterns
  return url.includes('supabase.co/storage') || 
         url.includes('.r2.dev') || 
         url.includes('r2.cloudflarestorage.com');
}

/**
 * Upload article image to Storage
 * Convenience wrapper for article featured images
 */
export async function uploadArticleImage(file: File): Promise<UploadResult> {
  return uploadToR2(file, 'articles');
}

/**
 * Upload gallery image to Storage
 * Convenience wrapper for gallery images
 */
export async function uploadGalleryImage(file: File): Promise<UploadResult> {
  return uploadToR2(file, 'gallery');
}

/**
 * Upload PDF to Storage
 * Convenience wrapper for e-paper PDFs
 */
export async function uploadPdf(file: File): Promise<UploadResult> {
  return uploadToR2(file, 'epapers');
}
