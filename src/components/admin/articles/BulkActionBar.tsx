
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BulkActionBarProps {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  onDraft: () => void;
  onClearSelection: () => void;
}

export const BulkActionBar = ({
  selectedCount,
  onPublish,
  onArchive,
  onDraft,
  onClearSelection,
}: BulkActionBarProps) => {
  return (
    <Card className="bg-primary-50 border-primary/20">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-primary" />
          <span>{selectedCount} আর্টিকেল নির্বাচিত</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPublish}
          >
            প্রকাশ করুন
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onArchive}
          >
            আর্কাইভ করুন
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDraft}
          >
            খসড়া করুন
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearSelection}
          >
            বাতিল
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
