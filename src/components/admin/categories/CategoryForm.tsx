
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Category } from '@/types/database';

export interface CategoryFormProps {
  initialData: Category | null;
  onSave: (category: Partial<Category>) => Promise<void>;
  onCancel: () => void;
  categories: Category[];
}

export const CategoryForm = ({ initialData, onSave, onCancel, categories }: CategoryFormProps) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [image, setImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSlug(initialData.slug || '');
      setDescription(initialData.description || '');
      setParentId(initialData.parent_id || null);
      setImage(initialData.image || '');
    }
  }, [initialData]);

  const generateSlug = (name: string) => {
    // Generate slug that works with Bengali characters
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^\u0980-\u09FF\w-]/g, '') // Keep Bengali, alphanumeric, and hyphens
      .replace(/--+/g, '-')           // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Only auto-generate slug if it's a new category or slug hasn't been manually edited
    if (!initialData || (initialData && !initialData.slug)) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      if (!name) {
        toast('নাম প্রয়োজন', {
          description: 'ক্যাটেগরি নাম দিন'
        });
        return;
      }
      
      await onSave({
        name,
        slug: slug || generateSlug(name),
        description,
        parent_id: parentId,
        image: image || null
      });
      
    } catch (error) {
      console.error('Error saving category:', error);
      toast('সংরক্ষণ করতে ব্যর্থ', {
        description: 'ক্যাটেগরি সংরক্ষণ করতে সমস্যা হয়েছে'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">নাম</Label>
        <Input
          id="name"
          value={name}
          onChange={handleNameChange}
          required
          placeholder="ক্যাটেগরির নাম"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="slug">স্লাগ</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="category-slug"
        />
        <p className="text-xs text-gray-500">URL এ ব্যবহারের জন্য একটি অনন্য নিচু-কেস শনাক্তকারী</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">বর্ণনা</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ক্যাটেগরির সংক্ষিপ্ত বর্ণনা"
        rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">ছবি URL</Label>
        <Input
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/category-image.jpg"
        />
        <p className="text-xs text-gray-500">ক্যাটেগরি পেজে প্রদর্শিত হবে</p>
        {image && (
          <div className="mt-2">
            <img 
              src={image} 
              alt="Category preview" 
              className="w-32 h-20 object-cover rounded border"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="parent">প্যারেন্ট ক্যাটেগরি</Label>
        <Select
          value={parentId || 'none'}
          onValueChange={(value) => setParentId(value === 'none' ? null : value)}
        >
          <SelectTrigger id="parent">
            <SelectValue placeholder="কোন প্যারেন্ট নেই" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">কোন প্যারেন্ট নেই</SelectItem>
            {categories
              .filter(cat => !initialData || cat.id !== initialData.id)
              .map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          বাতিল
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'সংরক্ষণ হচ্ছে...' : initialData ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
        </Button>
      </div>
    </form>
  );
};
