
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormState } from '@/hooks/use-article-form';

interface BasicInfoFormProps {
  formState: FormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const BasicInfoForm = ({
  formState,
  handleChange
}: BasicInfoFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">শিরোনাম</Label>
        <Input 
          id="title"
          name="title"
          value={formState.title}
          onChange={handleChange}
          placeholder="আর্টিকেলের শিরোনাম"
          className="text-lg"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="content">কন্টেন্ট</Label>
        <Textarea 
          id="content"
          name="content"
          value={formState.content}
          onChange={handleChange}
          placeholder="আর্টিকেলের বিস্তারিত কন্টেন্ট"
          rows={15}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="image_credit">ছবির ক্রেডিট</Label>
        <Input 
          id="image_credit"
          name="image_credit"
          value={formState.image_credit || ''}
          onChange={handleChange}
          placeholder="ছবি: সংগৃহীত / ফটোগ্রাফার নাম"
        />
        <p className="text-xs text-muted-foreground mt-1">
          ফিচার ইমেজের জন্য ক্রেডিট (যেমন: সংগৃহীত, রয়টার্স, এএফপি ইত্যাদি)
        </p>
      </div>
    </div>
  );
};
