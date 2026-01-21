import { useState } from 'react';
import { ImagePlus, X, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FormState } from '@/hooks/use-article-form';

interface GalleryImagesCardProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  galleryFiles: File[];
  setGalleryFiles: React.Dispatch<React.SetStateAction<File[]>>;
  galleryPreviews: string[];
  setGalleryPreviews: React.Dispatch<React.SetStateAction<string[]>>;
}

export const GalleryImagesCard = ({
  formState,
  setFormState,
  galleryFiles,
  setGalleryFiles,
  galleryPreviews,
  setGalleryPreviews
}: GalleryImagesCardProps) => {
  
  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Check each file
      const validFiles: File[] = [];
      const previews: string[] = [];
      
      files.forEach(file => {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} - ইমেজের সাইজ ৫MB এর বেশি হবে না`);
          return;
        }
        
        // Check file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`${file.name} - শুধুমাত্র JPG, PNG বা WebP ফরম্যাট সাপোর্ট করে`);
          return;
        }
        
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      });
      
      if (validFiles.length > 0) {
        setGalleryFiles(prev => [...prev, ...validFiles]);
        setGalleryPreviews(prev => [...prev, ...previews]);
      }
    }
  };
  
  const handleRemoveGalleryImage = (index: number) => {
    // Remove from previews
    const newPreviews = [...galleryPreviews];
    newPreviews.splice(index, 1);
    setGalleryPreviews(newPreviews);
    
    // Check if it's a new file or existing URL
    const existingImages = formState.gallery_images || [];
    if (index < existingImages.length) {
      // It's an existing image from the database
      const newGalleryImages = [...existingImages];
      newGalleryImages.splice(index, 1);
      
      const newGalleryCredits = [...(formState.gallery_credits || [])];
      newGalleryCredits.splice(index, 1);
      
      setFormState(prev => ({
        ...prev,
        gallery_images: newGalleryImages,
        gallery_credits: newGalleryCredits
      }));
    } else {
      // It's a new file
      const fileIndex = index - existingImages.length;
      const newFiles = [...galleryFiles];
      newFiles.splice(fileIndex, 1);
      setGalleryFiles(newFiles);
    }
  };
  
  const handleCreditChange = (index: number, credit: string) => {
    const newCredits = [...(formState.gallery_credits || [])];
    // Ensure array is long enough
    while (newCredits.length <= index) {
      newCredits.push('');
    }
    newCredits[index] = credit;
    
    setFormState(prev => ({
      ...prev,
      gallery_credits: newCredits
    }));
  };
  
  // Combine existing gallery images and new previews
  const allPreviews = [
    ...(formState.gallery_images || []),
    ...galleryPreviews.slice(formState.gallery_images?.length || 0)
  ];
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>গ্যালারি ছবি</Label>
          <p className="text-xs text-muted-foreground">
            একাধিক ছবি যুক্ত করুন যা আর্টিকেল পেজে গ্যালারি হিসেবে দেখাবে
          </p>
          
          {/* Gallery Preview */}
          {galleryPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Gallery ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveGalleryImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Input
                    type="text"
                    placeholder="ছবি ক্রেডিট"
                    value={(formState.gallery_credits || [])[index] || ''}
                    onChange={(e) => handleCreditChange(index, e.target.value)}
                    className="mt-1 text-xs h-7"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Button */}
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            <div className="flex flex-col items-center justify-center py-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">গ্যালারি ছবি যুক্ত করুন</p>
              <p className="text-xs text-gray-500">একাধিক ছবি সিলেক্ট করতে পারবেন</p>
            </div>
            <Input
              id="gallery-images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleGalleryImageChange}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('gallery-images')?.click()}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              ছবি যুক্ত করুন
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
