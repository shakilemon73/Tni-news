
import { FormState } from '@/hooks/use-article-form';
import { Category } from '@/types/database';
import { StatusCard } from './sidebar/StatusCard';
import { CategoriesCard } from './sidebar/CategoriesCard';
import { FeaturedImageCard } from './sidebar/FeaturedImageCard';
import { GalleryImagesCard } from './sidebar/GalleryImagesCard';

interface ArticleSidebarProps {
  formState: FormState;
  handleSelectChange: (field: string, value: string) => void;
  categories: Category[] | null | undefined;
  handleRemoveCategory: (categoryId: string) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  previewImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPreviewImage: (value: string | null) => void;
  setImageFile: (value: File | null) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  galleryFiles: File[];
  setGalleryFiles: React.Dispatch<React.SetStateAction<File[]>>;
  galleryPreviews: string[];
  setGalleryPreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ArticleSidebar = ({
  formState,
  handleSelectChange,
  categories,
  handleRemoveCategory,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  previewImage,
  handleImageChange,
  setPreviewImage,
  setImageFile,
  setFormState,
  galleryFiles,
  setGalleryFiles,
  galleryPreviews,
  setGalleryPreviews
}: ArticleSidebarProps) => {
  return (
    <>
      <StatusCard 
        formState={formState}
        handleSelectChange={handleSelectChange}
        setFormState={setFormState}
      />
      
      <CategoriesCard 
        formState={formState}
        handleSelectChange={handleSelectChange}
        categories={categories}
        handleRemoveCategory={handleRemoveCategory}
        tagInput={tagInput}
        setTagInput={setTagInput}
        handleAddTag={handleAddTag}
        handleRemoveTag={handleRemoveTag}
      />
      
      <FeaturedImageCard 
        previewImage={previewImage}
        handleImageChange={handleImageChange}
        setPreviewImage={setPreviewImage}
        setImageFile={setImageFile}
        setFormState={setFormState}
        formState={formState}
      />
      
      <GalleryImagesCard 
        formState={formState}
        setFormState={setFormState}
        galleryFiles={galleryFiles}
        setGalleryFiles={setGalleryFiles}
        galleryPreviews={galleryPreviews}
        setGalleryPreviews={setGalleryPreviews}
      />
    </>
  );
};
