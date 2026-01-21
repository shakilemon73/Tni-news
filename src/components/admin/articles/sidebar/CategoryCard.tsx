
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from '@/types/database';
import { FormState } from '@/hooks/use-article-form';

interface CategoryCardProps {
  formState: FormState;
  handleSelectChange: (field: string, value: string) => void;
  categories: Category[] | null | undefined;
  handleRemoveCategory: (categoryId: string) => void;
}

export const CategoryCard = ({
  formState,
  handleSelectChange,
  categories,
  handleRemoveCategory
}: CategoryCardProps) => {
  // Ensure categories is an array even if it's null or undefined
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <div>
      <Label>ক্যাটেগরি</Label>
      <Select
        onValueChange={(value) => handleSelectChange('category', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
        </SelectTrigger>
        <SelectContent>
          {safeCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Selected Categories */}
      <div className="flex flex-wrap gap-2 mt-2">
        {formState.category_ids && Array.isArray(formState.category_ids) && formState.category_ids.map((categoryId) => {
          const category = safeCategories.find(c => c.id === categoryId);
          return category ? (
            <div 
              key={categoryId} 
              className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 text-sm"
            >
              {category.name}
              <button 
                type="button"
                onClick={() => handleRemoveCategory(categoryId)}
                className="text-primary hover:text-primary/80"
              >
                ×
              </button>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};
