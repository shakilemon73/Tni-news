
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormState } from '@/hooks/use-article-form';

interface ArticleEditorHeaderProps {
  isEditMode: boolean;
  formState: FormState;
  isSaving: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  navigate: ReturnType<typeof useNavigate>;
}

export const ArticleEditorHeader = ({
  isEditMode,
  formState,
  isSaving,
  handleSubmit,
  navigate
}: ArticleEditorHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <Button 
        variant="outline" 
        onClick={() => navigate('/admin/articles')}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        <span>ফিরে যান</span>
      </Button>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => window.open(`/article/${formState.slug}`, '_blank')}
          disabled={!isEditMode || formState.status !== 'published'}
          className="flex items-center gap-2"
        >
          <Eye size={16} />
          <span>প্রিভিউ</span>
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>সংরক্ষণ করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>সংরক্ষণ করুন</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
