
import { useState } from 'react';
import { toast } from 'sonner';

export interface FormState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_ids: string[];
  tags: string[];
  author_id: string;
  featured_image: string;
  image_credit: string;
  gallery_images: string[];
  gallery_credits: string[];
  status: 'draft' | 'published' | 'archived';
  publish_date: string;
  seo_metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  views: number;
}

export const useArticleForm = () => {
  const [formState, setFormState] = useState<FormState>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_ids: [],
    tags: [],
    author_id: '',
    featured_image: '',
    image_credit: '',
    gallery_images: [],
    gallery_credits: [],
    status: 'draft',
    publish_date: new Date().toISOString(),
    seo_metadata: {
      title: '',
      description: '',
      keywords: []
    },
    views: 0
  });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g. seo_metadata.title)
      const [parent, child] = name.split('.');
      setFormState(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormState] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from title
      if (name === 'title') {
        const slug = value
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')  // Remove special chars
          .replace(/\s+/g, '-')      // Replace spaces with hyphens
          .replace(/--+/g, '-')      // Replace multiple hyphens with single
          .trim();
        
        setFormState(prev => ({ 
          ...prev, 
          slug,
          seo_metadata: {
            ...prev.seo_metadata,
            title: prev.seo_metadata.title || value
          }
        }));
      }
      
      // Auto-populate SEO description from excerpt
      if (name === 'excerpt') {
        setFormState(prev => ({
          ...prev,
          seo_metadata: {
            ...prev.seo_metadata,
            description: prev.seo_metadata.description || value
          }
        }));
      }
    }
  };
  
  const handleSelectChange = (field: string, value: string) => {
    if (field === 'category') {
      // Add category if not already selected
      if (!formState.category_ids.includes(value)) {
        setFormState(prev => ({
          ...prev,
          category_ids: [...prev.category_ids, value]
        }));
      }
    } else {
      setFormState(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleRemoveCategory = (categoryId: string) => {
    setFormState(prev => ({
      ...prev,
      category_ids: Array.isArray(prev.category_ids) ? 
        prev.category_ids.filter(id => id !== categoryId) : 
        []
    }));
  };
  
  const handleAddTag = () => {
    if (tagInput && !formState.tags.includes(tagInput)) {
      setFormState(prev => ({
        ...prev,
        tags: Array.isArray(prev.tags) ? 
          [...prev.tags, tagInput] : 
          [tagInput]
      }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormState(prev => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? 
        prev.tags.filter(t => t !== tag) : 
        []
    }));
  };
  
  const handleAddKeyword = (keyword: string) => {
    if (keyword && !formState.seo_metadata.keywords.includes(keyword)) {
      setFormState(prev => ({
        ...prev,
        seo_metadata: {
          ...prev.seo_metadata,
          keywords: Array.isArray(prev.seo_metadata.keywords) ? 
            [...prev.seo_metadata.keywords, keyword] : 
            [keyword]
        }
      }));
    }
  };
  
  const handleRemoveKeyword = (keyword: string) => {
    setFormState(prev => ({
      ...prev,
      seo_metadata: {
        ...prev.seo_metadata,
        keywords: Array.isArray(prev.seo_metadata.keywords) ? 
          prev.seo_metadata.keywords.filter(k => k !== keyword) : 
          []
      }
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ইমেজের সাইজ ৫MB এর বেশি হবে না');
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('শুধুমাত্র JPG, PNG বা WebP ফরম্যাট সাপোর্ট করে');
        return;
      }
      
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  return {
    formState,
    setFormState,
    previewImage,
    setPreviewImage,
    imageFile,
    setImageFile,
    galleryFiles,
    setGalleryFiles,
    galleryPreviews,
    setGalleryPreviews,
    tagInput,
    setTagInput,
    handleChange,
    handleSelectChange,
    handleRemoveCategory,
    handleAddTag,
    handleRemoveTag,
    handleAddKeyword,
    handleRemoveKeyword,
    handleImageChange
  };
};
