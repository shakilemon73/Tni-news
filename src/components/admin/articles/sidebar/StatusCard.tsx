
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { FormState } from '@/hooks/use-article-form';

interface StatusCardProps {
  formState: FormState;
  handleSelectChange: (field: string, value: string) => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

export const StatusCard = ({
  formState,
  handleSelectChange,
  setFormState
}: StatusCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label>প্রকাশিত স্ট্যাটাস</Label>
            <div className="flex items-center justify-between mt-2">
              <Select 
                value={formState.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">খসড়া</SelectItem>
                  <SelectItem value="published">প্রকাশিত</SelectItem>
                  <SelectItem value="archived">আর্কাইভ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formState.status === 'published' && (
            <div>
              <Label htmlFor="publish_date">প্রকাশের তারিখ</Label>
              <Input 
                id="publish_date"
                name="publish_date"
                type="datetime-local"
                value={formState.publish_date ? new Date(formState.publish_date).toISOString().substring(0, 16) : ''}
                onChange={(e) => setFormState(prev => ({ ...prev, publish_date: new Date(e.target.value).toISOString() }))}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
