
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormState } from '@/hooks/use-article-form';

interface TagsInputProps {
  formState: FormState;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
}

export const TagsInput = ({
  formState,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag
}: TagsInputProps) => {
  return (
    <div>
      <Label>ট্যাগ</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {formState.tags.map((tag) => (
          <div 
            key={tag} 
            className="bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 text-sm"
          >
            {tag}
            <button 
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-primary hover:text-primary/80"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <Input 
          placeholder="ট্যাগ যোগ করুন"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
        />
        <Button 
          type="button"
          className="ml-2"
          onClick={handleAddTag}
        >
          যোগ
        </Button>
      </div>
    </div>
  );
};
