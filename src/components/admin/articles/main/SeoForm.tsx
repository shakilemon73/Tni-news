import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormState } from '@/hooks/use-article-form';
import { X, Plus } from 'lucide-react';

interface SeoFormProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const SeoForm = ({
  formState,
  setFormState,
  handleChange,
}: SeoFormProps) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formState.seo_metadata.keywords.includes(newKeyword.trim())) {
      setFormState(prev => ({
        ...prev,
        seo_metadata: {
          ...prev.seo_metadata,
          keywords: [...prev.seo_metadata.keywords, newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormState(prev => ({
      ...prev,
      seo_metadata: {
        ...prev.seo_metadata,
        keywords: prev.seo_metadata.keywords.filter(k => k !== keywordToRemove)
      }
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">SEO সেটিংস</h3>
      
      <div>
        <Label htmlFor="seo_title">মেটা টাইটেল</Label>
        <Input 
          id="seo_title"
          name="seo_metadata.title"
          value={formState.seo_metadata.title}
          onChange={handleChange}
          placeholder="SEO টাইটেল লিখুন"
        />
      </div>
      
      <div>
        <Label htmlFor="seo_description">সংক্ষিপ্ত বিবরণ / মেটা ডেসক্রিপশন</Label>
        <Textarea 
          id="seo_description"
          name="seo_metadata.description"
          value={formState.seo_metadata.description}
          onChange={handleChange}
          placeholder="আর্টিকেলের সংক্ষিপ্ত বিবরণ লিখুন"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          এটি সার্চ ইঞ্জিন ও সোশ্যাল মিডিয়ায় দেখানো হবে
        </p>
      </div>
      
      <div>
        <Label>কীওয়ার্ডস</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="কীওয়ার্ড লিখুন"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleAddKeyword}
            variant="outline"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 min-h-[32px]">
          {formState.seo_metadata.keywords.length > 0 ? (
            formState.seo_metadata.keywords.map((keyword) => (
              <div 
                key={keyword} 
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              কীওয়ার্ড যোগ করতে উপরে লিখে Enter চাপুন বা + বাটন ক্লিক করুন
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
