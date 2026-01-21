import { useState } from 'react';
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';
import { FormState } from '@/hooks/use-article-form';
import { createArticle, getNextSequentialArticleSlug, slugExists, updateArticle } from '@/lib/services';
import { uploadToR2 } from '@/lib/services/r2-storage-service';

export const useArticleSave = (
  isEditMode: boolean, 
  id: string | undefined,
  formState: FormState,
  imageFile: File | null,
  galleryFiles: File[],
  navigate: NavigateFunction,
  currentUserId?: string
) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!formState.title?.trim()) {
        toast.error('শিরোনাম পূরণ করুন');
        setIsSaving(false);
        return;
      }

      if (!formState.content?.trim()) {
        toast.error('কন্টেন্ট পূরণ করুন');
        setIsSaving(false);
        return;
      }

      // Validate title length
      if (formState.title.length > 500) {
        toast.error('শিরোনাম ৫০০ অক্ষরের বেশি হতে পারে না');
        setIsSaving(false);
        return;
      }

      // Get author_id - use form state first, then fallback to currentUserId
      const authorId = formState.author_id || currentUserId;
      
      if (!authorId) {
        toast.error('লগইন সেশন খুঁজে পাওয়া যায়নি। পুনরায় লগইন করুন।');
        setIsSaving(false);
        navigate('/admin/login');
        return;
      }
      
      // Always auto-generate slug for new articles
      let slug = formState.slug?.trim();

      // For NEW articles, always generate a random slug
      if (!isEditMode) {
        try {
          slug = await getNextSequentialArticleSlug('article');
        } catch (err) {
          console.error('Error generating sequential slug:', err);
          slug = `article-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        }
      }

      // Fallback for edit mode (should rarely happen)
      if (!slug) {
        slug = `article-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      }
      
      // Upload featured image to R2 if selected
      let imageUrl = formState.featured_image;
      if (imageFile) {
        try {
          const result = await uploadToR2(imageFile, 'articles');
          if (result.success && result.url) {
            imageUrl = result.url;
          } else {
            console.error('Image upload error:', result.error);
            toast.error('ইমেজ আপলোড করতে সমস্যা হয়েছে');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error('ইমেজ আপলোড করতে সমস্যা হয়েছে');
          // Continue with save operation even if image upload fails
        }
      }
      
      // Upload gallery images to R2
      let galleryUrls = [...(formState.gallery_images || [])];
      if (galleryFiles.length > 0) {
        try {
          const uploadPromises = galleryFiles.map(async (file) => {
            const result = await uploadToR2(file, 'gallery');
            if (result.success && result.url) {
              return result.url;
            }
            throw new Error(result.error || 'Upload failed');
          });
          const newUrls = await Promise.all(uploadPromises);
          galleryUrls = [...galleryUrls, ...newUrls];
        } catch (error) {
          console.error('Gallery upload error:', error);
          toast.error('গ্যালারি ছবি আপলোড করতে সমস্যা হয়েছে');
          // Continue with save operation even if gallery upload fails
        }
      }
      
      // Use SEO description as excerpt if excerpt is empty, or sync them
      const seoDescription = formState.seo_metadata?.description || '';
      const excerpt = formState.excerpt || seoDescription || null;
      
      const articleData = {
        title: formState.title,
        slug: slug,
        content: formState.content,
        excerpt: excerpt,
        category_ids: formState.category_ids || [],
        tags: formState.tags || [],
        author_id: authorId,
        featured_image: imageUrl || null,
        image_credit: formState.image_credit || null,
        gallery_images: galleryUrls,
        gallery_credits: formState.gallery_credits || [],
        status: formState.status,
        publish_date: formState.status === 'published' 
          ? formState.publish_date || new Date().toISOString() 
          : formState.publish_date || new Date().toISOString(),
        seo_metadata: {
          title: formState.seo_metadata?.title || formState.title || '',
          description: seoDescription || excerpt || '',
          keywords: formState.seo_metadata?.keywords || []
        },
        views: formState.views || 0
      };
      
      console.log('Saving article data:', articleData);
      
      if (isEditMode && id) {
        // Update existing article
        await updateArticle(id, articleData);
        toast.success('আর্টিকেল আপডেট হয়েছে');
      } else {
        // Create new article
        await createArticle(articleData);
        toast.success('নতুন আর্টিকেল তৈরি হয়েছে');
      }
      
      // Redirect after successful save
      navigate('/admin/articles');
    } catch (error: any) {
      console.error('Error saving article:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('row-level security')) {
        toast.error('অনুমতি নেই। আপনার অ্যাকাউন্টে প্রয়োজনীয় অনুমতি নেই।');
      } else if (error.message?.includes('duplicate key')) {
        toast.error('এই স্লাগ দিয়ে ইতিমধ্যে একটি আর্টিকেল আছে।');
      } else {
        toast.error('আর্টিকেল সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, handleSubmit };
};
