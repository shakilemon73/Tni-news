
import { useState, useEffect } from 'react';
import { Article } from '@/types/database';

// Define the possible article status values
type ArticleStatus = 'published' | 'draft' | 'archived';

// Define the form state interface with proper types
export interface FormState {
  title: string;
  content: string;
  slug: string;
  views: number;
  status: ArticleStatus;
  author_id: string;
  featured_image: string;
  image_credit: string;
  gallery_images: string[];
  gallery_credits: string[];
  publish_date: string;
  category_ids: string[];
  tags: string[];
  seo_metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const useArticleData = (initialData: Article | null) => {
  // Initialize form with default values or from article data
  const [formState, setFormState] = useState<FormState>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    slug: initialData?.slug || '',
    views: initialData?.views || 0,
    status: (initialData?.status as ArticleStatus) || 'draft',
    author_id: initialData?.author_id || '',
    featured_image: initialData?.featured_image || '',
    image_credit: initialData?.image_credit || '',
    gallery_images: initialData?.gallery_images || [],
    gallery_credits: initialData?.gallery_credits || [],
    publish_date: initialData?.publish_date || '',
    category_ids: initialData?.category_ids || [],
    tags: initialData?.tags || [],
    seo_metadata: {
      title: typeof initialData?.seo_metadata === 'object' ? 
        (initialData?.seo_metadata as any)?.title || '' : '',
      description: typeof initialData?.seo_metadata === 'object' ? 
        (initialData?.seo_metadata as any)?.description || '' : '',
      keywords: typeof initialData?.seo_metadata === 'object' ? 
        (initialData?.seo_metadata as any)?.keywords || [] : [],
    },
  });

  // Update form when the initial data changes (e.g. when the article is loaded)
  useEffect(() => {
    if (initialData) {
      setFormState({
        title: initialData.title || '',
        content: initialData.content || '',
        slug: initialData.slug || '',
        views: initialData.views || 0,
        status: (initialData.status as ArticleStatus) || 'draft',
        author_id: initialData.author_id || '',
        featured_image: initialData.featured_image || '',
        image_credit: initialData.image_credit || '',
        gallery_images: initialData.gallery_images || [],
        gallery_credits: initialData.gallery_credits || [],
        publish_date: initialData.publish_date || '',
        category_ids: initialData.category_ids || [],
        tags: initialData.tags || [],
        seo_metadata: {
          title: typeof initialData.seo_metadata === 'object' ? 
            (initialData.seo_metadata as any)?.title || '' : '',
          description: typeof initialData.seo_metadata === 'object' ? 
            (initialData.seo_metadata as any)?.description || '' : '',
          keywords: typeof initialData.seo_metadata === 'object' ? 
            (initialData.seo_metadata as any)?.keywords || [] : [],
        },
      });
    }
  }, [initialData]);

  return { formState, setFormState };
};
