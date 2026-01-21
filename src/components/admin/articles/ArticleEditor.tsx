import { useParams, useNavigate } from 'react-router-dom';
import { useArticleForm } from '@/hooks/use-article-form';
import { ArticleEditorHeader } from './ArticleEditorHeader';
import { ArticleMainForm } from './ArticleMainForm';
import { ArticleSidebar } from './ArticleSidebar';
import { useState, useEffect } from 'react';
import { Category } from '@/types/database';
import { toast } from 'sonner';
import { useArticleSave } from './editor/useArticleSave';
import { getArticle, getCategories, getSession } from '@/lib/services';
import { AdminArticleEditorSkeleton } from '@/components/skeletons/AdminSkeletons';

const ArticleEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const { 
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
    handleAddTag,
    handleRemoveTag,
    handleAddKeyword,
    handleRemoveKeyword,
    handleRemoveCategory,
    handleImageChange
  } = useArticleForm();

  // Fetch article data, categories, and current user
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get current session to get user ID
        const session = await getSession();
        if (!session?.user?.id) {
          toast.error('লগইন করা প্রয়োজন');
          navigate('/admin/login');
          return;
        }
        
        const userId = session.user.id;
        setCurrentUserId(userId);
        
        // Set author_id in form state for new articles
        if (!isEditMode) {
          setFormState(prev => ({
            ...prev,
            author_id: userId
          }));
        }
        
        // Fetch categories
        console.info('Fetching categories');
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
        console.info('Fetched categories:', categoriesData);
        
        // If in edit mode, fetch the article data
        if (isEditMode && id) {
          const article = await getArticle(id);
          if (article) {
            setFormState({
              title: article.title || '',
              content: article.content || '',
              slug: article.slug || '',
              excerpt: article.excerpt || '',
              status: article.status as 'draft' | 'published' | 'archived',
              views: article.views || 0,
              author_id: article.author_id || userId,
              featured_image: article.featured_image || '',
              image_credit: article.image_credit || '',
              gallery_images: article.gallery_images || [],
              gallery_credits: article.gallery_credits || [],
              publish_date: article.publish_date || '',
              category_ids: article.category_ids || [],
              tags: article.tags || [],
              seo_metadata: {
                title: typeof article.seo_metadata === 'object' ? 
                  (article.seo_metadata as any)?.title || '' : '',
                description: typeof article.seo_metadata === 'object' ? 
                  (article.seo_metadata as any)?.description || '' : '',
                keywords: typeof article.seo_metadata === 'object' ? 
                  (article.seo_metadata as any)?.keywords || [] : [],
              }
            });
            
            // Set preview image if article has a featured image
            if (article.featured_image) {
              setPreviewImage(article.featured_image);
            }
            
            // Set gallery previews if article has gallery images
            if (article.gallery_images && article.gallery_images.length > 0) {
              setGalleryPreviews(article.gallery_images);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('ডাটা লোড করতে সমস্যা হয়েছে');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, setFormState, setPreviewImage, navigate]);
  
  const { isSaving, handleSubmit } = useArticleSave(
    isEditMode,
    id,
    formState,
    imageFile,
    galleryFiles,
    navigate,
    currentUserId
  );
  
  if (isLoading) {
    return <AdminArticleEditorSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      <ArticleEditorHeader 
        isEditMode={isEditMode}
        formState={formState}
        isSaving={isSaving}
        handleSubmit={handleSubmit}
        navigate={navigate}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <ArticleMainForm 
              formState={formState}
              setFormState={setFormState}
              handleChange={handleChange}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <ArticleSidebar 
              formState={formState}
              handleSelectChange={handleSelectChange}
              categories={categories}
              handleRemoveCategory={handleRemoveCategory}
              tagInput={tagInput}
              setTagInput={setTagInput}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
              previewImage={previewImage}
              handleImageChange={handleImageChange}
              setPreviewImage={setPreviewImage}
              setImageFile={setImageFile}
              setFormState={setFormState}
              galleryFiles={galleryFiles}
              setGalleryFiles={setGalleryFiles}
              galleryPreviews={galleryPreviews}
              setGalleryPreviews={setGalleryPreviews}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;
