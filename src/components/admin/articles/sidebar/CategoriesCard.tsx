
import { Card, CardContent } from '@/components/ui/card';
import { CategoryCard } from './CategoryCard';
import { TagsInput } from './TagsInput';
import { Category } from '@/types/database';
import { FormState } from '@/hooks/use-article-form';

interface CategoriesCardProps {
  formState: FormState;
  handleSelectChange: (field: string, value: string) => void;
  categories: Category[] | null | undefined;
  handleRemoveCategory: (categoryId: string) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
}

export const CategoriesCard = ({
  formState,
  handleSelectChange,
  categories,
  handleRemoveCategory,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag
}: CategoriesCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <CategoryCard 
            formState={formState}
            handleSelectChange={handleSelectChange}
            categories={categories}
            handleRemoveCategory={handleRemoveCategory}
          />
          
          <TagsInput 
            formState={formState}
            tagInput={tagInput}
            setTagInput={setTagInput}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
          />
        </div>
      </CardContent>
    </Card>
  );
};
