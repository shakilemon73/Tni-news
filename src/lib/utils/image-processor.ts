/**
 * Image processing utilities for compression and WebP conversion
 */

interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
  format: string;
}

const MAX_WIDTH = 1200;
const QUALITY = 0.8;
const TARGET_SIZE_KB = 300;

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(width: number, height: number, maxWidth: number): { width: number; height: number } {
  if (width <= maxWidth) {
    return { width, height };
  }
  const ratio = maxWidth / width;
  return {
    width: maxWidth,
    height: Math.round(height * ratio),
  };
}

/**
 * Convert image to WebP with compression
 */
async function compressToWebP(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use high-quality image rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Convert to WebP blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Progressively compress image until it meets target size
 */
async function compressToTargetSize(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  targetSizeKB: number
): Promise<Blob> {
  let quality = QUALITY;
  let blob = await compressToWebP(img, targetWidth, targetHeight, quality);
  
  // If already under target, return
  if (blob.size <= targetSizeKB * 1024) {
    return blob;
  }

  // Progressively reduce quality until target is met or minimum quality reached
  const minQuality = 0.4;
  const qualityStep = 0.1;

  while (blob.size > targetSizeKB * 1024 && quality > minQuality) {
    quality -= qualityStep;
    blob = await compressToWebP(img, targetWidth, targetHeight, quality);
  }

  // If still too large, reduce dimensions
  if (blob.size > targetSizeKB * 1024) {
    let currentWidth = targetWidth;
    let currentHeight = targetHeight;
    const dimensionStep = 0.8;

    while (blob.size > targetSizeKB * 1024 && currentWidth > 400) {
      currentWidth = Math.round(currentWidth * dimensionStep);
      currentHeight = Math.round(currentHeight * dimensionStep);
      blob = await compressToWebP(img, currentWidth, currentHeight, quality);
    }
  }

  return blob;
}

/**
 * Process an image file: resize, convert to WebP, and compress
 * @param file - The original image file
 * @returns Processed image blob and metadata
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  // Skip processing for non-image files
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  // Skip processing for already small WebP images
  if (file.type === 'image/webp' && file.size < TARGET_SIZE_KB * 1024) {
    return {
      blob: file,
      width: 0,
      height: 0,
      originalSize: file.size,
      processedSize: file.size,
      format: 'image/webp',
    };
  }

  const img = await loadImage(file);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  // Calculate target dimensions
  const { width: targetWidth, height: targetHeight } = calculateDimensions(
    originalWidth,
    originalHeight,
    MAX_WIDTH
  );

  // Compress to target size
  const blob = await compressToTargetSize(img, targetWidth, targetHeight, TARGET_SIZE_KB);

  // Clean up object URL
  URL.revokeObjectURL(img.src);

  console.log(
    `Image processed: ${file.name} - Original: ${(file.size / 1024).toFixed(1)}KB → Processed: ${(blob.size / 1024).toFixed(1)}KB (${((1 - blob.size / file.size) * 100).toFixed(1)}% reduction)`
  );

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    originalSize: file.size,
    processedSize: blob.size,
    format: 'image/webp',
  };
}

/**
 * Create a File object from a processed blob
 */
export function createProcessedFile(blob: Blob, originalName: string): File {
  // Replace extension with .webp
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const newName = `${baseName}.webp`;
  
  return new File([blob], newName, { type: 'image/webp' });
}
