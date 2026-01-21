import { ImagePlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormState } from '@/hooks/use-article-form';

interface FeaturedImageCardProps {
  previewImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPreviewImage: (value: string | null) => void;
  setImageFile: (value: File | null) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  formState: FormState;
}

export const FeaturedImageCard = ({
  previewImage,
  handleImageChange,
  setPreviewImage,
  setImageFile,
  setFormState,
  formState
}: FeaturedImageCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>ফিচার্ড ইমেজ</Label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
            {previewImage ? (
              <div className="space-y-2">
                <img 
                  src={previewImage} 
                  alt="Featured" 
                  className="mx-auto max-h-40 object-cover rounded-md"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setPreviewImage(null);
                    setImageFile(null);
                    setFormState(prev => ({ ...prev, featured_image: '', image_credit: '' }));
                  }}
                >
                  ইমেজ পরিবর্তন করুন
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col items-center justify-center py-4">
                  <ImagePlus className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">ইমেজ আপলোড করুন</p>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP (৫MB পর্যন্ত)</p>
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  ইমেজ নির্বাচন করুন
                </Button>
              </div>
            )}
          </div>

          {/* Image Credit Field */}
          {previewImage && (
            <div className="space-y-2">
              <Label htmlFor="sidebar_image_credit">ছবির ক্রেডিট</Label>
              <Input
                id="sidebar_image_credit"
                value={formState.image_credit || ''}
                onChange={(e) => setFormState(prev => ({ ...prev, image_credit: e.target.value }))}
                placeholder="ছবি: সংগৃহীত / ফটোগ্রাফার নাম"
              />
              <p className="text-xs text-muted-foreground">
                যেমন: সংগৃহীত, রয়টার্স, এএফপি ইত্যাদি
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
