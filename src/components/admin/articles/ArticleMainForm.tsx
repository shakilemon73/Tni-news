import { Card, CardContent } from '@/components/ui/card';
import { FormState } from '@/hooks/use-article-form';
import { BasicInfoForm } from './main/BasicInfoForm';
import { SeoForm } from './main/SeoForm';

interface ArticleMainFormProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ArticleMainForm = ({
  formState,
  setFormState,
  handleChange,
}: ArticleMainFormProps) => {
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <BasicInfoForm 
            formState={formState} 
            handleChange={handleChange} 
          />
        </CardContent>
      </Card>
      
      {/* SEO Settings */}
      <Card>
        <CardContent className="pt-6">
          <SeoForm 
            formState={formState}
            setFormState={setFormState}
            handleChange={handleChange}
          />
        </CardContent>
      </Card>
    </>
  );
};
